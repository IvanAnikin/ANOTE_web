import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { contentMetadata, contentUrl } from "@/lib/seo";
import { siteUrl } from "@/lib/constants";
import { clanekPath, clanky, CLANKY_PATH, getClanek } from "@/content";
import { ContentPageView } from "@/components/content/ContentPageView";
import { JsonLd } from "@/components/content/JsonLd";
import { breadcrumbList, ORGANIZATION_ID } from "@/lib/jsonld";

// Czech-only section. Slugs are generated for both locales because Next 16
// prerenders nothing when one parent locale returns no params; the English
// variants call notFound() below. Unknown slugs 404 (dynamicParams = false).
export const dynamicParams = false;

export function generateStaticParams() {
  return clanky.map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ lang: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  const page = getClanek(slug);
  if (lang !== "cs" || !page) return {};
  return contentMetadata({
    path: clanekPath(slug),
    title: page.metaTitle,
    description: page.description,
    type: "article",
    publishedTime: page.published,
    modifiedTime: page.modified,
  });
}

export default async function ClanekPage({ params }: Props) {
  const { lang, slug } = await params;
  const page = getClanek(slug);
  if (lang !== "cs" || !page) notFound();

  const url = contentUrl(clanekPath(slug));
  const crumbs = [
    { name: "ANOTE", path: "/" },
    { name: "Články", path: CLANKY_PATH },
    { name: page.shortTitle, path: clanekPath(slug) },
  ];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Article",
              headline: page.title,
              description: page.description,
              url,
              mainEntityOfPage: url,
              inLanguage: "cs-CZ",
              datePublished: page.published,
              dateModified: page.modified,
              image: `${siteUrl}/cs/opengraph-image`,
              author: { "@id": ORGANIZATION_ID },
              publisher: { "@id": ORGANIZATION_ID },
            },
            breadcrumbList(crumbs),
          ],
        }}
      />
      <ContentPageView page={page} crumbs={crumbs} kind="article" />
    </>
  );
}
