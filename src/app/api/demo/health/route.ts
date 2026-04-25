import { NextRequest } from "next/server";

const ANOTE_BACKEND_URL = process.env.ANOTE_BACKEND_URL ?? "";

// Minimal pre-warm proxy for the demo page. Calls the backend /health
// endpoint to wake a scaled-to-zero replica. Always returns 200 so a
// failing pre-warm never surfaces to the user.
export async function GET(_request: NextRequest) {
  if (!ANOTE_BACKEND_URL) {
    return Response.json({ ok: false, reason: "not-configured" });
  }

  try {
    const response = await fetch(`${ANOTE_BACKEND_URL}/health`, {
      method: "GET",
      signal: AbortSignal.timeout(8_000),
      cache: "no-store",
    });
    return Response.json({ ok: response.ok, status: response.status });
  } catch {
    return Response.json({ ok: false, reason: "unreachable" });
  }
}
