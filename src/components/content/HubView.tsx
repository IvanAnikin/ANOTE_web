import Link from "next/link";
import type { ContentPage } from "@/content/types";
import type { Crumb } from "@/lib/jsonld";
import { Breadcrumbs } from "./Breadcrumbs";
import { ContentCta } from "./ContentCta";
import { RegulatoryDisclaimer } from "./RegulatoryDisclaimer";

export function HubView({
  title,
  perex,
  crumbs,
  pages,
  hrefFor,
  kind,
}: {
  title: string;
  perex: string;
  crumbs: Crumb[];
  pages: ContentPage[];
  hrefFor: (slug: string) => string;
  kind: "specialty_page" | "article";
}) {
  return (
    <main>
      <header className="pt-28 pb-10 bg-gradient-to-br from-background via-background to-primary/5">
        <div className="mx-auto max-w-5xl px-6">
          <Breadcrumbs crumbs={crumbs} />
          <h1 className="mt-6 text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">{title}</h1>
          <p className="mt-5 max-w-3xl text-lg text-text-secondary leading-relaxed">{perex}</p>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-6 py-12">
        <ul className="grid gap-5 sm:grid-cols-2">
          {pages.map((p) => (
            <li key={p.slug}>
              <Link
                href={hrefFor(p.slug)}
                className="block h-full rounded-2xl border border-border bg-surface p-6 transition-shadow hover:shadow-[var(--shadow-md)]"
              >
                <h2 className="text-lg font-bold text-text-primary">{p.shortTitle}</h2>
                <p className="mt-2 text-sm text-text-secondary leading-relaxed">{p.description}</p>
                <span className="mt-4 inline-block text-sm font-semibold text-primary">Číst dál →</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <RegulatoryDisclaimer />
      <ContentCta
        heading="Vyzkoušejte ANOTE v prohlížeči"
        text="Nahrajte ukázkový rozhovor nebo diktát a podívejte se na návrh zprávy. Bez instalace."
        primary="demo"
        location={kind}
      />
    </main>
  );
}
