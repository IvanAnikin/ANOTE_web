import { NextRequest } from "next/server";
import { isRateLimited } from "@/lib/demo-rate-limit";

const ANOTE_BACKEND_URL = process.env.ANOTE_BACKEND_URL ?? "";
const ANOTE_API_TOKEN = process.env.ANOTE_API_TOKEN ?? "";

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  );
}

// Azure SWA kills idle connections at ~45s. We stream newline-delimited JSON
// (ndjson) with periodic heartbeat lines to keep the connection alive while
// the ANOTE backend generates the report via OpenAI.

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  if (isRateLimited(ip, "report")) {
    return Response.json(
      { error: "Rate limit exceeded. Try again later." },
      { status: 429 },
    );
  }

  if (!ANOTE_BACKEND_URL || !ANOTE_API_TOKEN) {
    return Response.json(
      { error: "Report service not configured" },
      { status: 503 },
    );
  }

  let body: { transcript?: string; visit_type?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const transcript = body.transcript?.trim();
  if (!transcript) {
    return Response.json({ error: "Empty transcript" }, { status: 400 });
  }

  const visitType = body.visit_type ?? "default";

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      // Send heartbeat every 10s to prevent SWA 45s idle timeout
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode("\n"));
        } catch {
          clearInterval(heartbeat);
        }
      }, 10_000);

      try {
        const response = await fetch(`${ANOTE_BACKEND_URL}/report`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${ANOTE_API_TOKEN}`,
          },
          body: JSON.stringify({
            transcript,
            language: "cs",
            visit_type: visitType,
          }),
          signal: AbortSignal.timeout(120_000),
        });

        if (!response.ok) {
          const text = await response.text().catch(() => "");
          console.error("ANOTE backend error:", response.status, text);
          controller.enqueue(
            encoder.encode(JSON.stringify({ error: "Report generation failed" }) + "\n"),
          );
        } else {
          const data = await response.json();
          controller.enqueue(
            encoder.encode(JSON.stringify({ report: data.report ?? "" }) + "\n"),
          );
        }
      } catch (err) {
        console.error("ANOTE backend request failed:", err);
        controller.enqueue(
          encoder.encode(JSON.stringify({ error: "Report generation failed" }) + "\n"),
        );
      } finally {
        clearInterval(heartbeat);
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "no-cache",
      "Transfer-Encoding": "chunked",
    },
  });
}
