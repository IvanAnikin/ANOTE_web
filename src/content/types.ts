/**
 * Czech-only SEO content (/obory/*, /clanky/*). Every claim in these files must
 * map to the ANOTE claim ledger (Knowledge.Healthcare
 * marketing/knowledge/claims-and-compliance-guardrails.md) — see SPEC-0058.
 */

export type Block =
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "table"; head: string[]; rows: string[][] };

export interface Section {
  heading: string;
  blocks: Block[];
}

export interface RelatedLink {
  href: string;
  label: string;
}

export interface ContentCtaConfig {
  heading: string;
  text: string;
  /** Primary button: "demo" → /demo, "contact" → /kontakt. */
  primary: "demo" | "contact";
}

export interface Source {
  /** Full citation as shown on the page. */
  label: string;
  url: string;
}

export interface ContentPage {
  slug: string;
  /** H1. */
  title: string;
  /** <title>, ≤ 60 characters. */
  metaTitle: string;
  /** Meta description, 120–155 characters. */
  description: string;
  /** Short label for hub cards and breadcrumbs. */
  shortTitle: string;
  perex: string;
  sections: Section[];
  related: RelatedLink[];
  cta: ContentCtaConfig;
  /** Required on any page that quotes a number (see tests/content.test.mjs). */
  sources?: Source[];
  /** ISO dates. */
  published: string;
  modified: string;
}
