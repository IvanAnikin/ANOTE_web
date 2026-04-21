import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  // TODO: replace with production domain when anote.cz is configured
  const baseUrl = "https://yellow-forest-086a45303.7.azurestaticapps.net";

  // Pages with same slug for both locales
  const sameSlugPages = [
    { cs: "", en: "", changeFrequency: "weekly" as const, priority: 1 },
    { cs: "/kontakt", en: "/kontakt", changeFrequency: "monthly" as const, priority: 0.7 },
    { cs: "/faq", en: "/faq", changeFrequency: "monthly" as const, priority: 0.6 },
    { cs: "/demo", en: "/demo", changeFrequency: "monthly" as const, priority: 0.6 },
    { cs: "/podminky", en: "/podminky", changeFrequency: "yearly" as const, priority: 0.3 },
    { cs: "/ochrana-soukromi", en: "/ochrana-soukromi", changeFrequency: "yearly" as const, priority: 0.3 },
  ];

  // Pages with different slugs per locale (EN slug in the URL, CS slug on filesystem)
  const localizedPages = [
    { cs: "/cenik", en: "/pricing", changeFrequency: "monthly" as const, priority: 0.8 },
    { cs: "/typy-zprav", en: "/report-types", changeFrequency: "monthly" as const, priority: 0.7 },
  ];

  const allPages = [...sameSlugPages, ...localizedPages];

  return allPages.flatMap((page) => [
    {
      url: `${baseUrl}${page.cs}`,
      lastModified: new Date(),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
      alternates: {
        languages: {
          cs: `${baseUrl}${page.cs}`,
          en: `${baseUrl}/en${page.en}`,
        },
      },
    },
    {
      url: `${baseUrl}/en${page.en}`,
      lastModified: new Date(),
      changeFrequency: page.changeFrequency,
      priority: page.priority * 0.9,
      alternates: {
        languages: {
          cs: `${baseUrl}${page.cs}`,
          en: `${baseUrl}/en${page.en}`,
        },
      },
    },
  ]);
}
