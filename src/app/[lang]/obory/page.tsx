import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { contentMetadata, contentUrl } from "@/lib/seo";
import { obory, oborPath, OBORY_PATH } from "@/content";
import { HubView } from "@/components/content/HubView";
import { JsonLd } from "@/components/content/JsonLd";
import { breadcrumbList, ORGANIZATION_ID, WEBSITE_ID } from "@/lib/jsonld";

// Czech-only section: /en/obory renders 404.
const TITLE = "Návrh lékařské zprávy podle vašeho oboru";
const PEREX =
  "ANOTE z nahraného rozhovoru nebo diktátu připraví návrh zprávy ve struktuře, kterou váš obor používá. Vyberte svůj obor a podívejte se, jaké oddíly zpráva má.";
const crumbs = [
  { name: "ANOTE", path: "/" },
  { name: "Obory", path: OBORY_PATH },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (lang !== "cs") return {};
  return contentMetadata({
    path: OBORY_PATH,
    title: "Návrh lékařské zprávy podle oboru | ANOTE",
    description:
      "Gastroenterologie, praktik, interna, diabetologie, sonografie, ortopedie: ANOTE připraví z rozhovoru návrh zprávy ve struktuře vašeho vyšetření.",
  });
}

export default async function OboryPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (lang !== "cs") notFound();

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "CollectionPage",
              name: TITLE,
              url: contentUrl(OBORY_PATH),
              inLanguage: "cs-CZ",
              isPartOf: { "@id": WEBSITE_ID },
              publisher: { "@id": ORGANIZATION_ID },
            },
            breadcrumbList(crumbs),
          ],
        }}
      />
      <HubView title={TITLE} perex={PEREX} crumbs={crumbs} pages={obory} hrefFor={oborPath} kind="specialty_page" />
    </>
  );
}
