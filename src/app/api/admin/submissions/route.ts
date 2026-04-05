import { NextRequest, NextResponse } from "next/server";
import { getSubmissions, submissionsToCsv } from "@/lib/submissions";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function checkAuth(request: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  const header = request.headers.get("authorization");
  if (header === `Bearer ${secret}`) return true;
  // Also check query param for simple browser access
  const param = request.nextUrl.searchParams.get("secret");
  return param === secret;
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) return unauthorized();

  const format = request.nextUrl.searchParams.get("format");
  const submissions = getSubmissions();

  if (format === "csv") {
    const csv = submissionsToCsv(submissions);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="anote-submissions-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }

  return NextResponse.json(submissions);
}
