import type { MetadataRoute } from "next";
import { routes, routeUrl, routeLanguages, contentUrl, type RouteKey } from "@/lib/seo";
import { contentSitemapEntries } from "@/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const core = (Object.keys(routes) as RouteKey[]).flatMap((key) => {
    const r = routes[key];
    const languages = routeLanguages(key);
    return (["cs", "en"] as const).map((lang) => ({
      url: routeUrl(key, lang),
      changeFrequency: r.changeFrequency,
      priority: lang === "cs" ? r.priority : Math.round(r.priority * 90) / 100,
      alternates: { languages },
    }));
  });

  // Czech-only content pages (/obory, /clanky): no English alternate.
  const content = contentSitemapEntries().map((e) => {
    const url = contentUrl(e.path);
    return {
      url,
      lastModified: e.modified,
      changeFrequency: "monthly" as const,
      priority: e.priority,
      alternates: { languages: { cs: url, "x-default": url } },
    };
  });

  return [...core, ...content];
}
