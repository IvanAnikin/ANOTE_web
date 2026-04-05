import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://anote.cz";

  const pages = [
    { path: "", changeFrequency: "weekly" as const, priority: 1 },
    { path: "/kontakt", changeFrequency: "monthly" as const, priority: 0.7 },
    { path: "/podminky", changeFrequency: "yearly" as const, priority: 0.3 },
    { path: "/ochrana-soukromi", changeFrequency: "yearly" as const, priority: 0.3 },
    { path: "/impressum", changeFrequency: "yearly" as const, priority: 0.3 },
  ];

  return pages.flatMap((page) => [
    {
      url: `${baseUrl}${page.path}`,
      lastModified: new Date(),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
      alternates: {
        languages: {
          cs: `${baseUrl}${page.path}`,
          en: `${baseUrl}/en${page.path}`,
        },
      },
    },
    {
      url: `${baseUrl}/en${page.path}`,
      lastModified: new Date(),
      changeFrequency: page.changeFrequency,
      priority: page.priority * 0.9,
      alternates: {
        languages: {
          cs: `${baseUrl}${page.path}`,
          en: `${baseUrl}/en${page.path}`,
        },
      },
    },
  ]);
}
