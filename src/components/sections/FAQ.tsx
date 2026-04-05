"use client";

import { FadeInOnScroll } from "@/components/animations/FadeInOnScroll";
import { Accordion } from "@/components/ui/Accordion";
import { trackEvent } from "@/lib/analytics";
import type { Dictionary } from "@/lib/dictionary-types";

export function FAQ({ dict }: { dict: Dictionary }) {
  const t = dict.faq;
  const faqItems = t.items.map((item, i) => ({
    id: String(i),
    title: item.q,
    content: item.a,
  }));

  return (
    <section id="faq" className="py-24 sm:py-32 bg-background">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <FadeInOnScroll>
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary">
              {t.heading}
            </h2>
          </div>
        </FadeInOnScroll>

        <FadeInOnScroll>
          <Accordion items={faqItems} onItemOpen={(title) => trackEvent("faq_expand", { question: title })} />
        </FadeInOnScroll>
      </div>
    </section>
  );
}
