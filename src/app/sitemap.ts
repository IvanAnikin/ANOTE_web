import type { MetadataRoute } from "next";
import { routes, routeUrl, routeLanguages, type RouteKey } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return (Object.keys(routes) as RouteKey[]).flatMap((key) => {
    const r = routes[key];
    const languages = routeLanguages(key);
    return (["cs", "en"] as const).map((lang) => ({
      url: routeUrl(key, lang),
      changeFrequency: r.changeFrequency,
      priority: lang === "cs" ? r.priority : Math.round(r.priority * 90) / 100,
      alternates: { languages },
    }));
  });
}
