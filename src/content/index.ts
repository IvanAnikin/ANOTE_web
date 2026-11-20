import { obory } from "./obory";
import { clanky } from "./clanky";
import type { ContentPage } from "./types";

export type { ContentPage } from "./types";
export { obory, clanky };

export const OBORY_PATH = "/obory";
export const CLANKY_PATH = "/clanky";

export const oborPath = (slug: string) => `${OBORY_PATH}/${slug}`;
export const clanekPath = (slug: string) => `${CLANKY_PATH}/${slug}`;

export function getObor(slug: string): ContentPage | undefined {
  return obory.find((p) => p.slug === slug);
}

export function getClanek(slug: string): ContentPage | undefined {
  return clanky.find((p) => p.slug === slug);
}

/** Every Czech-only content URL, for the sitemap. */
export function contentSitemapEntries(): { path: string; modified: string; priority: number }[] {
  const latest = (pages: ContentPage[]) =>
    pages.map((p) => p.modified).sort().at(-1) ?? "2026-11-20";
  return [
    { path: OBORY_PATH, modified: latest(obory), priority: 0.7 },
    ...obory.map((p) => ({ path: oborPath(p.slug), modified: p.modified, priority: 0.7 })),
    { path: CLANKY_PATH, modified: latest(clanky), priority: 0.6 },
    ...clanky.map((p) => ({ path: clanekPath(p.slug), modified: p.modified, priority: 0.6 })),
  ];
}
