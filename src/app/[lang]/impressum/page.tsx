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
    title: dict.impressum.title,
    description: dict.impressum.description,
  };
}

export default async function ImpressumPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang as Locale);
  const t = dict.impressum;

  return (
    <main className="pt-32 pb-24 bg-background">
      <article className="mx-auto max-w-3xl px-6 lg:px-8 prose prose-stone">
        <h1>{t.heading}</h1>

        <h2>{t.operator}</h2>
        <p style={{ whiteSpace: "pre-line" }}>{t.operatorValue}</p>

        <h2>{t.identification}</h2>
        <table>
          <tbody>
            <tr>
              <td><strong>{t.ico}</strong></td>
              <td>{t.icoValue}</td>
            </tr>
            <tr>
              <td><strong>{t.dic}</strong></td>
              <td>{t.dicValue}</td>
            </tr>
            <tr>
              <td><strong>{t.registration}</strong></td>
              <td>{t.registrationValue}</td>
            </tr>
          </tbody>
        </table>

        <h2>{t.contactHeading}</h2>
        <p>
          Email:{" "}
          <a href="mailto:info@anote.cz">info@anote.cz</a>
          <br />
          {dict.kontakt.phoneLabel}: +420 XXX XXX XXX
        </p>

        <h2>{t.responsiblePerson}</h2>
        <p>{t.responsiblePersonValue}</p>

        <p className="text-sm text-text-secondary mt-12">{t.note}</p>
      </article>
    </main>
  );
}
