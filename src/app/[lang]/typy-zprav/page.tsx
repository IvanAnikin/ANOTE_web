import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getDictionary, hasLocale, locales, type Locale } from "@/lib/i18n";
import { siteConfig } from "@/lib/constants";
import { PageHeader } from "@/components/layout/PageHeader";

const ReportShowcase = dynamic(() =>
  import("@/components/sections/ReportShowcase").then((m) => m.ReportShowcase)
);
const VisitTypes = dynamic(() =>
  import("@/components/sections/VisitTypes").then((m) => m.VisitTypes)
);
const Privacy = dynamic(() =>
  import("@/components/sections/Privacy").then((m) => m.Privacy)
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
  const t = dict.reportTypesPage;
  const enSlug = "report-types";
  const csSlug = "typy-zprav";

  return {
    title: t.title,
    description: t.description,
    alternates: {
      canonical:
        lang === "cs"
          ? `${siteConfig.url}/${csSlug}`
          : `${siteConfig.url}/en/${enSlug}`,
      languages: {
        cs: `${siteConfig.url}/${csSlug}`,
        en: `${siteConfig.url}/en/${enSlug}`,
      },
    },
  };
}

export default async function TypyZpravPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang as Locale);
  const t = dict.reportTypesPage;
  const prefix = lang === "cs" ? "" : "/en";
  const demoSlug = "demo";

  return (
    <main>
      <PageHeader title={t.title.replace(" — ANOTE", "")} subtitle={t.subtitle} />
      <ReportShowcase dict={dict} />
      <VisitTypes dict={dict} />
      <div id="security">
        <Privacy dict={dict} />
      </div>
      <section className="py-16 sm:py-20 bg-gradient-to-br from-primary to-primary-dark text-center">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-6">
            {dict.demoPage.cta}
          </h2>
          <Link
            href={`${prefix}/${demoSlug}`}
            className="inline-flex items-center justify-center rounded-xl bg-white px-8 py-3 text-base font-semibold text-primary shadow-lg hover:bg-white/90 transition-colors"
          >
            {dict.nav.demo}
          </Link>
        </div>
      </section>
    </main>
  );
}
