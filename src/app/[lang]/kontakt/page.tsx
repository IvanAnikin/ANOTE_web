import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale, type Locale } from "@/lib/i18n";
import { BottomCTA } from "@/components/sections/BottomCTA";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang as Locale);
  return {
    title: dict.kontakt.title,
    description: dict.kontakt.description,
  };
}

export default async function KontaktPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang as Locale);
  const t = dict.kontakt;

  return (
    <main>
      {/* Direct contact info */}
      <section className="pt-32 pb-16 bg-background">
        <div className="mx-auto max-w-3xl px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold text-text-primary mb-4">
            {t.heading}
          </h1>
          <p className="text-lg text-text-secondary mb-10">
            {t.subheading}
          </p>
          <div className="flex flex-wrap justify-center gap-8 text-text-secondary">
            <div>
              <p className="font-semibold text-text-primary mb-1">{t.emailLabel}</p>
              <a
                href="mailto:info@anote.cz"
                className="text-primary hover:underline"
              >
                info@anote.cz
              </a>
            </div>
            <div>
              <p className="font-semibold text-text-primary mb-1">{t.phoneLabel}</p>
              <span>+420 XXX XXX XXX</span>
            </div>
          </div>
        </div>
      </section>

      {/* Reuse the contact form */}
      <BottomCTA dict={dict} />
    </main>
  );
}
