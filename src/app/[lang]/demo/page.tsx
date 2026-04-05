import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getDictionary, hasLocale, locales, type Locale } from "@/lib/i18n";
import { siteConfig } from "@/lib/constants";
import { PageHeader } from "@/components/layout/PageHeader";
import { FadeInOnScroll } from "@/components/animations/FadeInOnScroll";

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
  const t = dict.demoPage;

  return {
    title: t.title,
    description: t.description,
    alternates: {
      canonical:
        lang === "cs"
          ? `${siteConfig.url}/demo`
          : `${siteConfig.url}/en/demo`,
      languages: {
        cs: `${siteConfig.url}/demo`,
        en: `${siteConfig.url}/en/demo`,
      },
    },
  };
}

export default async function DemoPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang as Locale);
  const t = dict.demoPage;
  const prefix = lang === "cs" ? "" : "/en";
  const kontaktSlug = lang === "cs" ? "kontakt" : "contact";

  return (
    <main>
      <PageHeader title={t.title.replace(" — ANOTE", "")} />
      <section className="py-24 sm:py-32 bg-background">
        <div className="mx-auto max-w-2xl px-6 lg:px-8 text-center">
          <FadeInOnScroll>
            <div className="rounded-2xl border border-border bg-surface p-10 sm:p-14 shadow-sm">
              <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-3xl">🚀</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-text-primary mb-4">
                {t.comingSoon}
              </h2>
              <p className="text-text-secondary leading-relaxed mb-8">
                {t.descriptionText}
              </p>
              <Link
                href={`${prefix}/${kontaktSlug}`}
                className="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-3 text-base font-semibold text-white shadow-lg hover:bg-primary-dark transition-colors"
              >
                {t.cta}
              </Link>
            </div>
          </FadeInOnScroll>
        </div>
      </section>
    </main>
  );
}
