import type { Submission } from "./submissions";

/**
 * Forwards a contact/demo submission to Ivan's n8n assistant (`anote-lead-v1` webhook).
 *
 * Runs after the submission is stored by `addSubmission`. It never throws and the visitor's
 * response never depends on it. Server-to-server only: the secret is read from
 * `ASSISTANT_ANOTE_WEBHOOK_SECRET` and sent in `X-Webhook-Secret`; it is never exposed to
 * client code. The submission id is the `Idempotency-Key`, so a retry or a manual replay
 * from the admin export can never create a second lead.
 *
 * Commercial contact data only. The assistant itself withholds messages that look like
 * patient data from Telegram and AI prompts, but nothing here adds clinical content.
 */

const ATTEMPT_TIMEOUT_MS = 4000;
const RETRY_DELAY_MS = 500;
const PRIVACY_NOTICE = "https://anote.cz/cs/ochrana-soukromi";

export type ForwardResult =
  | { forwarded: true }
  | { forwarded: false; reason: "unconfigured" | "refused" | "unreachable" };

function readConfig(): { url: string; secret: string } | null {
  const url = process.env.ASSISTANT_ANOTE_WEBHOOK_URL ?? "";
  const secret = process.env.ASSISTANT_ANOTE_WEBHOOK_SECRET ?? "";
  if (!url || !secret) return null;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  const loopback = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
  if (parsed.protocol !== "https:" && !(parsed.protocol === "http:" && loopback)) return null;
  return { url, secret };
}

/** Keeps the page URL only when it is an anote.cz page; anything else becomes null. */
export function safePageUrl(referer: string | null): string | null {
  if (!referer) return null;
  try {
    const u = new URL(referer);
    if (u.protocol !== "https:" || !/(^|\.)anote\.cz$/.test(u.hostname)) return null;
    return `${u.origin}${u.pathname}`.slice(0, 500);
  } catch {
    return null;
  }
}

function utmFrom(pageUrl: string | null, referer: string | null) {
  const empty = { source: null, medium: null, campaign: null };
  if (!pageUrl || !referer) return empty;
  try {
    const q = new URL(referer).searchParams;
    const pick = (k: string) => q.get(k)?.slice(0, 100) || null;
    return { source: pick("utm_source"), medium: pick("utm_medium"), campaign: pick("utm_campaign") };
  } catch {
    return empty;
  }
}

/** The assistant's website-lead contract, schema_version 1 (shared by all three sites). */
export function assistantPayload(submission: Submission, referer: string | null) {
  const pageUrl = safePageUrl(referer);
  return {
    schema_version: "1",
    submission_id: submission.id,
    source: "anote.cz/kontakt",
    business_line: "anote",
    submitted_at_utc: submission.timestamp,
    full_name: submission.name,
    email: submission.email,
    phone: submission.phone || null,
    message: submission.message || null,
    // The form refuses to submit without the GDPR checkbox (`gdpr: z.literal(true)`).
    consent: { given: true, privacy_notice_version: PRIVACY_NOTICE, captured_at_utc: submission.timestamp },
    utm: utmFrom(pageUrl, referer),
    page_url: pageUrl,
    form_fields: {},
  };
}

export async function forwardToAssistant(
  submission: Submission,
  referer: string | null,
  fetchImpl: typeof fetch = fetch,
): Promise<ForwardResult> {
  const config = readConfig();
  if (!config) return { forwarded: false, reason: "unconfigured" };

  const body = JSON.stringify(assistantPayload(submission, referer));
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const res = await fetchImpl(config.url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-webhook-secret": config.secret,
          "idempotency-key": submission.id,
        },
        body,
        signal: AbortSignal.timeout(ATTEMPT_TIMEOUT_MS),
        redirect: "error",
      });
      if (res.ok) return { forwarded: true };
      if (res.status < 500) {
        console.error(`assistant-forward: n8n refused submission ${submission.id} (HTTP ${res.status})`);
        return { forwarded: false, reason: "refused" };
      }
    } catch (err) {
      if (attempt === 2) {
        const name = err instanceof Error ? err.name : "unknown";
        console.error(`assistant-forward: n8n unreachable for submission ${submission.id} (${name})`);
        return { forwarded: false, reason: "unreachable" };
      }
    }
    if (attempt === 1) await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
  }
  console.error(`assistant-forward: n8n kept failing for submission ${submission.id}`);
  return { forwarded: false, reason: "unreachable" };
}
