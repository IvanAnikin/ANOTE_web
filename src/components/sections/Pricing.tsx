"use client";

import { FadeInOnScroll } from "@/components/animations/FadeInOnScroll";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Check } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Dictionary } from "@/lib/dictionary-types";

export function Pricing({ dict }: { dict: Dictionary }) {
  const t = dict.pricing;
  const pathname = usePathname();
  const firstSegment = pathname.split("/")[1];
  const lang = (firstSegment === "cs" || firstSegment === "en") ? firstSegment : "cs";
  return (
    <section id="pricing" className="py-24 sm:py-32 bg-background">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <FadeInOnScroll>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary">
              {t.heading}
            </h2>
            <p className="mt-4 text-lg text-text-secondary">
              {t.subheading}
            </p>
          </div>
        </FadeInOnScroll>

        {/* Pricing card */}
        <FadeInOnScroll>
          <div className="max-w-md mx-auto mb-20">
            <Card className="border-primary/20 shadow-[var(--shadow-lg)] text-center p-8 sm:p-10">
              <p className="text-sm font-semibold text-primary uppercase tracking-wide mb-2">
                {t.cardLabel}
              </p>
              <div className="mb-1">
                <span className="text-5xl font-extrabold text-text-primary">
                  {t.price}
                </span>
              </div>
              <p className="text-text-secondary mb-8">{t.perUnit}</p>

              <ul className="space-y-3 text-left mb-8">
                {t.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-text-primary">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link href={`/${lang}/demo`} className="w-full">
                <Button
                  size="lg"
                  className="w-full"
                >
                  {t.cta}
                </Button>
              </Link>
            </Card>
          </div>
        </FadeInOnScroll>

        {/* Comparison table */}
        <FadeInOnScroll>
          <div className="max-w-4xl mx-auto">
            <h3 className="text-xl font-bold text-text-primary text-center mb-8">
              {t.comparisonHeading}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-text-secondary" />
                    {t.comparisonHeaders.map((h, i) => (
                      <th
                        key={h}
                        className={`text-center py-3 px-4 ${
                          i === 0
                            ? "font-bold text-primary"
                            : "font-semibold text-text-secondary"
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {t.comparisonRows.map((row) => (
                    <tr
                      key={row.label}
                      className="border-b border-border/50 transition-colors hover:bg-primary/[0.02]"
                    >
                      <td className="py-3 px-4 font-medium text-text-primary">
                        {row.label}
                      </td>
                      {row.values.map((v, i) => (
                        <td
                          key={i}
                          className={`py-3 px-4 text-center ${
                            i === 0
                              ? "font-semibold text-primary"
                              : "text-text-secondary"
                          }`}
                        >
                          {v}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </FadeInOnScroll>
      </div>
    </section>
  );
}
