import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CookieConsent } from "@/components/analytics/CookieConsent";
import { jakarta } from "@/lib/fonts";
import { GoogleTagManager } from "@next/third-parties/google";
import { CONSENT_DEFAULT_SCRIPT } from "@/lib/consent";
import { siteConfig } from "@/lib/constants";
import { routeLanguages, routeUrl } from "@/lib/seo";
import "../globals.css";
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
      url: routeUrl("home", lang as Locale),
      siteName: "ANOTE",
      locale: lang === "cs" ? "cs_CZ" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: m.ogTitle,
      description: m.twitterDescription,
    },
    alternates: {
      canonical: routeUrl("home", lang as Locale),
      languages: routeLanguages("home"),
    },
    robots: { index: true, follow: true },
    other: {
      // Meta Business domain verification: anote-appka.cz (legacy) and anote.cz.
      "facebook-domain-verification": ["nir1sumltt1te39ymgev8tte3kpt0w", "v9x19bg7izlirsfozjytehcwzfalfh"],
    },
  };
}

// Structured data. Wording follows the marketing claim ledger
// (Knowledge.Healthcare/marketing/knowledge/claims-and-compliance-guardrails.md):
// no compliance claims, no price (pricing is not announced), no store listing.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteConfig.url}/#organization`,
      name: "ANOTE",
      url: siteConfig.url,
      logo: `${siteConfig.url}/icon.png`,
      email: siteConfig.contactEmail,
      sameAs: [
        "https://www.facebook.com/profile.php?id=61590339076321",
        "https://www.instagram.com/anote.cz/",
      ],
    },
    {
      "@type": "MobileApplication",
      name: "ANOTE",
      url: siteConfig.url,
      applicationCategory: "MedicalApplication",
      operatingSystem: "iOS, Android",
      inLanguage: "cs",
      description:
        "Mobilní aplikace, která z nahraného rozhovoru lékaře s pacientem připraví návrh strukturované lékařské zprávy ke kontrole lékařem.",
      publisher: { "@id": `${siteConfig.url}/#organization` },
    },
  ],
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
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID || "GTM-5JCQPNZ9";

  return (
    <html
      lang={lang}
      className={`${jakarta.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Consent Mode v2 defaults (all denied) — must run before GTM loads. */}
        <script dangerouslySetInnerHTML={{ __html: CONSENT_DEFAULT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar lang={lang as Locale} dict={dict} />
      <div className="flex-1">{children}</div>
      <Footer lang={lang as Locale} dict={dict} />
      <CookieConsent lang={lang as Locale} dict={dict} />
      </body>
      {gtmId ? <GoogleTagManager gtmId={gtmId} /> : null}
    </html>
  );
}
