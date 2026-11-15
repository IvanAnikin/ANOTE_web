// Run: node --experimental-strip-types --no-warnings --test tests/
// Covers the n8n forward in src/lib/assistant-forward.ts: contract, retries, never throws.
import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import { assistantPayload, forwardToAssistant, safePageUrl } from "../src/lib/assistant-forward.ts";

const SUB = {
  id: "5d1c9f00-1111-4222-8333-444455556666",
  name: "MUDr. Test Example",
  email: "doctor@example.test",
  phone: "",
  message: "Chtěl bych demo",
  timestamp: "2026-11-08T12:00:00.000Z",
};

function fakeFetch(statuses) {
  const calls = [];
  const impl = async (url, init) => {
    calls.push({ url: String(url), init });
    const next = statuses[Math.min(calls.length - 1, statuses.length - 1)];
    if (next instanceof Error) throw next;
    return new Response(null, { status: next });
  };
  return { calls, impl };
}

beforeEach(() => {
  process.env.ASSISTANT_ANOTE_WEBHOOK_URL = "https://automation.example.test/webhook/anote-lead-v1";
  process.env.ASSISTANT_ANOTE_WEBHOOK_SECRET = "s3cret";
  console.error = () => {};
});

test("payload follows the schema_version 1 contract", () => {
  const p = assistantPayload(SUB, "https://anote.cz/cs/kontakt?utm_source=google&utm_campaign=x");
  assert.equal(p.schema_version, "1");
  assert.equal(p.submission_id, SUB.id);
  assert.equal(p.source, "anote.cz/kontakt");
  assert.equal(p.phone, null);
  assert.equal(p.consent.given, true);
  assert.equal(p.page_url, "https://anote.cz/cs/kontakt");
  assert.deepEqual(p.utm, { source: "google", medium: null, campaign: "x" });
});

test("foreign referers are dropped", () => {
  assert.equal(safePageUrl("https://evil.example/anote.cz"), null);
  assert.equal(safePageUrl("not a url"), null);
  assert.equal(assistantPayload(SUB, "https://evil.example/?utm_source=x").utm.source, null);
});

test("2xx: one call with secret and idempotency key", async () => {
  const { calls, impl } = fakeFetch([200]);
  assert.deepEqual(await forwardToAssistant(SUB, null, impl), { forwarded: true });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].init.headers["x-webhook-secret"], "s3cret");
  assert.equal(calls[0].init.headers["idempotency-key"], SUB.id);
});

test("5xx retried once, 4xx never, network errors never throw", async () => {
  let f = fakeFetch([502, 200]);
  assert.deepEqual(await forwardToAssistant(SUB, null, f.impl), { forwarded: true });
  assert.equal(f.calls.length, 2);
  f = fakeFetch([401]);
  assert.deepEqual(await forwardToAssistant(SUB, null, f.impl), { forwarded: false, reason: "refused" });
  assert.equal(f.calls.length, 1);
  f = fakeFetch([new TypeError("fetch failed")]);
  assert.deepEqual(await forwardToAssistant(SUB, null, f.impl), { forwarded: false, reason: "unreachable" });
});

test("unconfigured or plain-HTTP never calls out", async () => {
  const f = fakeFetch([200]);
  delete process.env.ASSISTANT_ANOTE_WEBHOOK_SECRET;
  assert.equal((await forwardToAssistant(SUB, null, f.impl)).reason, "unconfigured");
  process.env.ASSISTANT_ANOTE_WEBHOOK_SECRET = "s";
  process.env.ASSISTANT_ANOTE_WEBHOOK_URL = "http://automation.example.test/x";
  assert.equal((await forwardToAssistant(SUB, null, f.impl)).reason, "unconfigured");
  assert.equal(f.calls.length, 0);
});
