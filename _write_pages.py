#!/usr/bin/env python3
"""Write 4 i18n-enabled static pages."""
import os

base = '/Users/ivananikin/Documents/ANOTE-web/src/app/[lang]'

KONTAKT = '''import type { Metadata } from "next";
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
'''

PODMINKY = '''import type { Metadata } from "next";
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
'''

OCHRANA = '''import type { Metadata } from "next";
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
    title: dict.ochranaSoukromi.title,
    description: dict.ochranaSoukromi.description,
  };
}

export default async function OchranaSoukromiPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang as Locale);
  const t = dict.ochranaSoukromi;

  return (
    <main className="pt-32 pb-24 bg-background">
      <article className="mx-auto max-w-3xl px-6 lg:px-8 prose prose-stone">
        <h1>{t.heading}</h1>
        <p className="text-text-secondary">{t.lastUpdated}</p>

        {t.sections.map((section, i) => (
          <div key={i}>
            <h2>{section.heading}</h2>
            {"subsections" in section && section.subsections ? (
              section.subsections.map((sub, j) => (
                <div key={j}>
                  <h3>{sub.heading}</h3>
                  <p>{sub.content}</p>
                </div>
              ))
            ) : (
              <p>{section.content}</p>
            )}
          </div>
        ))}

        <p className="text-sm text-text-secondary mt-12">{t.note}</p>
      </article>
    </main>
  );
}
'''

IMPRESSUM = '''import type { Metadata } from "next";
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
'''

pages = {
    'kontakt/page.tsx': KONTAKT,
    'podminky/page.tsx': PODMINKY,
    'ochrana-soukromi/page.tsx': OCHRANA,
    'impressum/page.tsx': IMPRESSUM,
}

for path, content in pages.items():
    full = os.path.join(base, path)
    with open(full, 'w') as f:
        f.write(content)
    print(f'Wrote {path}')

print('All pages done')
