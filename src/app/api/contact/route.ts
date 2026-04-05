import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { addSubmission } from "@/lib/submissions";
import { sendContactNotification } from "@/lib/email";

const CONTACT_EMAILS = (
  process.env.CONTACT_EMAIL_TO ?? "ianikin2002@gmail.com"
)
  .split(",")
  .map((e) => e.trim());

const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  practiceType: z.string().optional(),
  message: z.string().optional(),
  gdpr: z.literal(true),
});

// Simple in-memory rate limiting (per-deployment; for production, use Redis/KV)
const rateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

export async function POST(request: NextRequest) {
  // Rate limiting
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Příliš mnoho požadavků. Zkuste to znovu za hodinu." },
      { status: 429 },
    );
  }

  // Parse & validate body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Neplatný požadavek." },
      { status: 400 },
    );
  }

  const result = contactSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Neplatná data formuláře.", details: result.error.flatten() },
      { status: 422 },
    );
  }

  const data = result.data;

  // Store submission to disk
  const submission = addSubmission({
    name: data.name,
    email: data.email,
    phone: data.phone ?? "",
    practiceType: data.practiceType ?? "",
    message: data.message ?? "",
  });

  // Send email notification (non-blocking — don't fail the request if email fails)
  sendContactNotification(submission, CONTACT_EMAILS).catch((err) =>
    console.error("Failed to send contact notification email:", err),
  );

  return NextResponse.json({ success: true });
}
