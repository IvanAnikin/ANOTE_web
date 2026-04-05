import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale, type Locale } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang as Locale);
  return {
    title: dict.podminky.title,
    description: dict.podminky.description,
  };
}

export default async function PodminkyPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang as Locale);
  const t = dict.podminky;

  return (
    <main className="pt-32 pb-24 bg-background">
      <article className="mx-auto max-w-3xl px-6 lg:px-8 prose prose-stone">
        <h1>{t.heading}</h1>
        <p className="text-text-secondary">{t.lastUpdated}</p>

        {t.sections.map((section, i) => (
          <div key={i}>
            <h2>{section.heading}</h2>
            <p>{section.content}</p>
          </div>
        ))}

        <p className="text-sm text-text-secondary mt-12">{t.note}</p>
      </article>
    </main>
  );
}
