"use client";

import Link from "next/link";
import { Shield } from "lucide-react";
import { FadeInOnScroll } from "@/components/animations/FadeInOnScroll";
import type { Dictionary } from "@/lib/dictionary-types";
import type { Locale } from "@/lib/i18n";

export function TrustStrip({
  lang,
  dict,
}: {
  lang: Locale;
  dict: Dictionary;
}) {
  const t = dict.trustStrip;
  const prefix = lang === "cs" ? "" : "/en";
  const securitySlug = lang === "cs" ? "bezpecnost" : "security";

  return (
    <section className="py-16 sm:py-20 bg-dark-bg text-white relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <FadeInOnScroll>
          <div className="flex flex-col items-center gap-8">
            {/* Heading with shield */}
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" strokeWidth={1.5} />
              <h2 className="text-xl sm:text-2xl font-bold">{t.heading}</h2>
            </div>

            {/* Trust points — horizontal desktop, 2×2 grid mobile */}
            <div className="grid grid-cols-2 md:flex md:flex-row md:items-center gap-4 md:gap-8">
              {t.points.map((point, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-sm sm:text-base text-white/80"
                >
                  <span className="text-primary">✓</span>
                  <span>{point}</span>
                </div>
              ))}
            </div>

            {/* Link to dedicated security page */}
            <Link
              href={`${prefix}/${securitySlug}`}
              className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
            >
              {t.link} →
            </Link>
          </div>
        </FadeInOnScroll>
      </div>
    </section>
  );
}
