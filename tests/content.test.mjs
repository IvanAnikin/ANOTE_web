// Run: npm test
// Guards for the Czech-only SEO content (/obory, /clanky) — SPEC-0058 acceptance criteria 3, 7, 8.
import assert from "node:assert/strict";
import { test } from "node:test";
import { obory } from "../src/content/obory.ts";
import { clanky } from "../src/content/clanky.ts";

const all = [
  ...obory.map((p) => ({ ...p, path: `/obory/${p.slug}` })),
  ...clanky.map((p) => ({ ...p, path: `/clanky/${p.slug}` })),
];

function text(page) {
  const parts = [page.title, page.metaTitle, page.description, page.perex, page.cta.heading, page.cta.text];
  for (const s of page.sections) {
    parts.push(s.heading);
    for (const b of s.blocks) {
      if (b.type === "p") parts.push(b.text);
      else if (b.type === "table") parts.push(...b.head, ...b.rows.flat());
      else parts.push(...b.items);
    }
  }
  return parts.join("\n");
}

test("slugs are unique and URL-safe", () => {
  const paths = all.map((p) => p.path);
  assert.equal(new Set(paths).size, paths.length);
  for (const p of all) assert.match(p.slug, /^[a-z0-9]+(-[a-z0-9]+)*$/, p.slug);
});

test("meta title ≤ 60 chars and description 100–160 chars", () => {
  for (const p of all) {
    assert.ok(p.metaTitle.length <= 60, `${p.path} title ${p.metaTitle.length}`);
    assert.ok(p.description.length >= 100 && p.description.length <= 160, `${p.path} description ${p.description.length}`);
  }
});

test("internal links resolve to a known page", () => {
  const known = new Set([
    ...all.map((p) => p.path),
    "/obory", "/clanky", "/typy-zprav", "/bezpecnost", "/ochrana-soukromi", "/demo", "/kontakt",
  ]);
  for (const p of all) for (const r of p.related) assert.ok(known.has(r.href), `${p.path} → ${r.href}`);
});

test("no claims the ledger forbids", () => {
  const forbidden = [
    /certifik/i, /zero retention/i, /end-to-end/i, /\bE2E\b/, /anonymiz/i, /v reálném čase/i,
    /splňuje/i, /integrac[ei] s/i,
  ];
  for (const p of all) {
    const t = text(p);
    for (const re of forbidden) assert.ok(!re.test(t), `${p.path} matches ${re}`);
  }
});

test("numbers only on sourced pages, never as an ANOTE measurement", () => {
  const numeric = [/\d+\s*(s|sekund|minut|min|hodin|h)\b/i, /\d+(,\d+)?\s*%/];
  for (const p of all) {
    const t = text(p);
    const hasNumbers = numeric.some((re) => re.test(t));
    if (!hasNumbers) continue;
    assert.ok(p.sources && p.sources.length > 0, `${p.path} quotes numbers without sources`);
    assert.ok(/nejsou měřením ANOTE/.test(t), `${p.path} must say the figures are not ANOTE measurements`);
    for (const src of p.sources) assert.match(src.url, /^https:\/\//, `${p.path} source url`);
  }
});

test("every page mentions the draft and the doctor's review", () => {
  for (const p of all) {
    const t = text(p).toLowerCase();
    assert.ok(t.includes("návrh"), `${p.path} has no "návrh"`);
    assert.ok(/kontrol|zkontrol/.test(t), `${p.path} has no review mention`);
  }
});

test("dates are ISO and modified ≥ published", () => {
  for (const p of all) {
    assert.match(p.published, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(p.modified >= p.published, p.path);
  }
});
