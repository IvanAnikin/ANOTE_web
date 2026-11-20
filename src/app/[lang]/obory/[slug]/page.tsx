import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { contentMetadata, contentUrl } from "@/lib/seo";
import { getObor, obory, oborPath, OBORY_PATH } from "@/content";
import { ContentPageView } from "@/components/content/ContentPageView";
import { JsonLd } from "@/components/content/JsonLd";
import { APP_ID, breadcrumbList, ORGANIZATION_ID, WEBSITE_ID } from "@/lib/jsonld";

// Czech-only section. Slugs are generated for both locales because Next 16
// prerenders nothing when one parent locale returns no params; the English
// variants call notFound() below. Unknown slugs 404 (dynamicParams = false).
export const dynamicParams = false;

export function generateStaticParams() {
  return obory.map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ lang: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  const page = getObor(slug);
  if (lang !== "cs" || !page) return {};
  return contentMetadata({ path: oborPath(slug), title: page.metaTitle, description: page.description });
}

export default async function OborPage({ params }: Props) {
  const { lang, slug } = await params;
  const page = getObor(slug);
  if (lang !== "cs" || !page) notFound();

  const crumbs = [
    { name: "ANOTE", path: "/" },
    { name: "Obory", path: OBORY_PATH },
    { name: page.shortTitle, path: oborPath(slug) },
  ];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebPage",
              name: page.title,
              description: page.description,
              url: contentUrl(oborPath(slug)),
              inLanguage: "cs-CZ",
              isPartOf: { "@id": WEBSITE_ID },
              about: { "@id": APP_ID },
              publisher: { "@id": ORGANIZATION_ID },
              dateModified: page.modified,
            },
            breadcrumbList(crumbs),
          ],
        }}
      />
      <ContentPageView page={page} crumbs={crumbs} kind="specialty_page" />
    </>
  );
}
