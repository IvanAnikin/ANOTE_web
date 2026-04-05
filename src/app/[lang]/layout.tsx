import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { siteConfig } from "@/lib/constants";
import { getDictionary, hasLocale, locales, type Locale } from "@/lib/i18n";

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang as Locale);
  const m = dict.meta;

  return {
    title: { default: m.title, template: m.titleTemplate },
    description: m.description,
    keywords: m.keywords.split(","),
    authors: [{ name: "ANOTE" }],
    metadataBase: new URL(siteConfig.url),
    openGraph: {
      title: m.ogTitle,
      description: m.ogDescription,
      url: lang === "cs" ? siteConfig.url : `${siteConfig.url}/en`,
      siteName: "ANOTE",
      images: [
        {
          url: "/images/og-image.png",
          width: 1200,
          height: 630,
          alt: m.ogImageAlt,
        },
      ],
      locale: lang === "cs" ? "cs_CZ" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: m.ogTitle,
      description: m.twitterDescription,
      images: ["/images/og-image.png"],
    },
    alternates: {
      canonical: lang === "cs" ? siteConfig.url : `${siteConfig.url}/en`,
      languages: {
        cs: siteConfig.url,
        en: `${siteConfig.url}/en`,
      },
    },
    robots: { index: true, follow: true },
  };
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "ANOTE",
  applicationCategory: "HealthApplication",
  operatingSystem: "iOS, Android",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "CZK",
  },
  description:
    "AI-powered medical report generation from voice dictation. On-device transcription, GDPR compliant.",
  availableLanguage: ["cs", "en"],
};

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang as Locale);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar lang={lang as Locale} dict={dict} />
      <div className="flex-1">{children}</div>
      <Footer lang={lang as Locale} dict={dict} />
    </>
  );
}
