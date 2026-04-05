import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getDictionary, hasLocale, locales, type Locale } from "@/lib/i18n";
import { siteConfig } from "@/lib/constants";
import { PageHeader } from "@/components/layout/PageHeader";

const FAQ = dynamic(() =>
  import("@/components/sections/FAQ").then((m) => m.FAQ)
);

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
  const t = dict.faqPage;

  return {
    title: t.title,
    description: t.description,
    alternates: {
      canonical:
        lang === "cs"
          ? `${siteConfig.url}/faq`
          : `${siteConfig.url}/en/faq`,
      languages: {
        cs: `${siteConfig.url}/faq`,
        en: `${siteConfig.url}/en/faq`,
      },
    },
  };
}

function FAQJsonLd({ dict, lang }: { dict: Awaited<ReturnType<typeof getDictionary>>; lang: string }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: dict.faq.items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
    inLanguage: lang === "cs" ? "cs-CZ" : "en-US",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default async function FAQPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang as Locale);
  const t = dict.faqPage;
  const prefix = lang === "cs" ? "" : "/en";
  const kontaktSlug = lang === "cs" ? "kontakt" : "contact";

  return (
    <main>
      <FAQJsonLd dict={dict} lang={lang} />
      <PageHeader title={t.title.replace(" — ANOTE", "")} />
      <FAQ dict={dict} />
      <section className="py-16 sm:py-20 bg-gradient-to-br from-primary to-primary-dark text-center">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">
            {lang === "cs" ? "Máte další otázky?" : "Have more questions?"}
          </h2>
          <Link
            href={`${prefix}/${kontaktSlug}`}
            className="inline-flex items-center justify-center rounded-xl bg-white px-8 py-3 text-base font-semibold text-primary shadow-lg hover:bg-white/90 transition-colors"
          >
            {dict.bottomCta.ctaOnlyButton}
          </Link>
        </div>
      </section>
    </main>
  );
}
