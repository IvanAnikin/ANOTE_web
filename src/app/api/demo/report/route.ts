import { NextRequest } from "next/server";
import { isRateLimited } from "@/lib/demo-rate-limit";

const ANOTE_BACKEND_URL = process.env.ANOTE_BACKEND_URL ?? "";
const ANOTE_API_TOKEN = process.env.ANOTE_API_TOKEN ?? "";

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  );
}

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
        visit_type: body.visit_type ?? "default",
      }),
      signal: AbortSignal.timeout(120_000),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      console.error("ANOTE backend error:", response.status, text);
      return Response.json(
        { error: "Report generation failed" },
        { status: 502 },
      );
    }

    const data = await response.json();
    return Response.json({ report: data.report });
  } catch (err) {
    console.error("ANOTE backend request failed:", err);
    return Response.json(
      { error: "Report generation failed" },
      { status: 502 },
    );
  }
}
