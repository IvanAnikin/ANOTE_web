import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale, locales, type Locale } from "@/lib/i18n";
import { siteConfig } from "@/lib/constants";
import { PageHeader } from "@/components/layout/PageHeader";
import { DemoUI } from "@/components/demo/DemoUI";

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

  return (
    <main>
      <PageHeader title={t.heading} subtitle={t.subtitle} />
      <section className="pb-16 sm:pb-24 bg-background">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <DemoUI dict={dict} />
        </div>
      </section>
    </main>
  );
}
