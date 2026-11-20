import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { contentMetadata, contentUrl } from "@/lib/seo";
import { clanky, clanekPath, CLANKY_PATH } from "@/content";
import { HubView } from "@/components/content/HubView";
import { JsonLd } from "@/components/content/JsonLd";
import { breadcrumbList, ORGANIZATION_ID, WEBSITE_ID } from "@/lib/jsonld";

// Czech-only section: /en/clanky renders 404.
const TITLE = "Články o lékařské dokumentaci";
const PEREX =
  "Praktické články o struktuře lékařských zpráv, diktování a přepisu a o tom, jak pracovat s návrhem zprávy z nahrávky.";
const crumbs = [
  { name: "ANOTE", path: "/" },
  { name: "Články", path: CLANKY_PATH },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (lang !== "cs") return {};
  return contentMetadata({
    path: CLANKY_PATH,
    title: "Články o lékařské dokumentaci | ANOTE",
    description:
      "Praktické články o struktuře lékařských zpráv, diktování, přepisu rozhovoru a práci s návrhem zprávy z nahrávky v ambulanci.",
  });
}

export default async function ClankyPage({ params }: { params: Promise<{ lang: string }> }) {
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
              url: contentUrl(CLANKY_PATH),
              inLanguage: "cs-CZ",
              isPartOf: { "@id": WEBSITE_ID },
              publisher: { "@id": ORGANIZATION_ID },
            },
            breadcrumbList(crumbs),
          ],
        }}
      />
      <HubView title={TITLE} perex={PEREX} crumbs={crumbs} pages={clanky} hrefFor={clanekPath} kind="article" />
    </>
  );
}
