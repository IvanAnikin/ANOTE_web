import Link from "next/link";
import type { Block, ContentPage } from "@/content/types";
import type { Crumb } from "@/lib/jsonld";
import { Breadcrumbs } from "./Breadcrumbs";
import { ContentCta } from "./ContentCta";
import { RegulatoryDisclaimer } from "./RegulatoryDisclaimer";

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d}. ${m}. ${y}`;
}

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "p":
      return <p className="text-text-secondary leading-relaxed">{block.text}</p>;
    case "ul":
      return (
        <ul className="list-disc pl-6 space-y-2 text-text-secondary leading-relaxed marker:text-primary">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol className="list-decimal pl-6 space-y-2 text-text-secondary leading-relaxed marker:text-primary marker:font-semibold">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      );
    case "table":
      return (
        <>
        {/* Phones: one card per row, header labels inline. */}
        <dl className="sm:hidden space-y-3">
          {block.rows.map((row) => (
            <div key={row[0]} className="rounded-xl border border-border bg-surface p-4">
              <dt className="font-semibold text-text-primary">{row[0]}</dt>
              {row.slice(1).map((cell, i) => (
                <dd key={i} className="mt-1 text-sm text-text-secondary leading-relaxed">
                  {block.head.length > 2 && i === 0 ? (
                    <span className="font-medium text-text-primary">{cell}</span>
                  ) : (
                    cell
                  )}
                </dd>
              ))}
            </div>
          ))}
        </dl>
        <div className="hidden sm:block overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-primary/5 text-text-primary">
              <tr>
                {block.head.map((h) => (
                  <th key={h} scope="col" className="px-4 py-3 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row) => (
                <tr key={row[0]} className="border-t border-border align-top">
                  {row.map((cell, i) =>
                    i === 0 ? (
                      <th key={i} scope="row" className="px-4 py-3 font-semibold text-text-primary whitespace-nowrap">
                        {cell}
                      </th>
                    ) : (
                      <td key={i} className="px-4 py-3 text-text-secondary">
                        {cell}
                      </td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      );
  }
}

export function ContentPageView({
  page,
  crumbs,
  kind,
}: {
  page: ContentPage;
  crumbs: Crumb[];
  kind: "specialty_page" | "article";
}) {
  return (
    <main>
      <article>
        <header className="pt-28 pb-10 bg-gradient-to-br from-background via-background to-primary/5">
          <div className="mx-auto max-w-3xl px-6">
            <Breadcrumbs crumbs={crumbs} />
            <h1 className="mt-6 text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
              {page.title}
            </h1>
            <p className="mt-5 text-lg text-text-secondary leading-relaxed">{page.perex}</p>
            {kind === "article" && (
              <p className="mt-4 text-sm text-text-secondary">
                ANOTE · <time dateTime={page.published}>{formatDate(page.published)}</time>
                {page.modified !== page.published && (
                  <>
                    {" "}
                    · aktualizováno <time dateTime={page.modified}>{formatDate(page.modified)}</time>
                  </>
                )}
              </p>
            )}
          </div>
        </header>

        <div className="mx-auto max-w-3xl px-6 py-12 space-y-12">
          {page.sections.map((section) => (
            <section key={section.heading} className="space-y-4">
              <h2 className="text-2xl font-bold text-text-primary">{section.heading}</h2>
              {section.blocks.map((block, i) => (
                <BlockView key={i} block={block} />
              ))}
            </section>
          ))}

          {page.related.length > 0 && (
            <section className="space-y-4 border-t border-border pt-10">
              <h2 className="text-xl font-bold text-text-primary">Související</h2>
              <ul className="space-y-2">
                {page.related.map((r) => (
                  <li key={r.href}>
                    <Link href={r.href} className="text-primary font-medium hover:underline">
                      {r.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <RegulatoryDisclaimer />
      </article>
      <ContentCta {...page.cta} location={kind} />
    </main>
  );
}
