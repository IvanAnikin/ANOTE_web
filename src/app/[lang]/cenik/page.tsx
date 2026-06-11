import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale, locales, type Locale } from "@/lib/i18n";
import { siteConfig } from "@/lib/constants";
import { PageHeader } from "@/components/layout/PageHeader";
import { TrackedLink } from "@/components/analytics/TrackedLink";

const Pricing = dynamic(() =>
  import("@/components/sections/Pricing").then((m) => m.Pricing)
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
  const t = dict.pricingPage;
  const enSlug = "pricing";
  const csSlug = "cenik";

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

export default async function CenikPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang as Locale);
  const t = dict.pricingPage;
  const prefix = lang === "cs" ? "" : "/en";
  const kontaktSlug = lang === "cs" ? "kontakt" : "contact";

  return (
    <main>
      <PageHeader title={dict.pricing.heading} subtitle={t.subtitle} />
      <Pricing dict={dict} />
      <section className="py-16 sm:py-20 bg-gradient-to-br from-primary to-primary-dark text-center">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-6">
            {dict.bottomCta.ctaOnlyHeading}
          </h2>
          <TrackedLink
            href={`${prefix}/${kontaktSlug}`}
            eventName="cta_click"
            eventProps={{ location: "pricing_page" }}
            className="inline-flex items-center justify-center rounded-xl bg-white px-8 py-3 text-base font-semibold text-primary shadow-lg hover:bg-white/90 transition-colors"
          >
            {dict.bottomCta.ctaOnlyButton}
          </TrackedLink>
        </div>
      </section>
    </main>
  );
}
