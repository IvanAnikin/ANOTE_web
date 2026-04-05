"use client";

import { FadeInOnScroll } from "@/components/animations/FadeInOnScroll";
import { StaggerChildren } from "@/components/animations/StaggerChildren";
import { Card } from "@/components/ui/Card";
import { motion, type Variants } from "framer-motion";
import { trackEvent } from "@/lib/analytics";
import type { Dictionary } from "@/lib/dictionary-types";

const itemVariant: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.33, 1, 0.68, 1] as [number, number, number, number],
    },
  },
};

const visitTypeIcons = ["🏥", "🔄", "🔬", "🔬", "📡", "🤖"];

export function VisitTypes({ dict }: { dict: Dictionary }) {
  const t = dict.visitTypes;
  return (
    <section id="visit-types" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <FadeInOnScroll>
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary">
              {t.heading}
            </h2>
            <p className="mt-4 text-lg text-text-secondary">
              {t.subheading}
            </p>
          </div>
        </FadeInOnScroll>

        <StaggerChildren className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide lg:grid lg:grid-cols-3 xl:grid-cols-6 lg:overflow-visible">
          {t.types.map((vt, i) => (
            <motion.div
              key={vt.name}
              variants={itemVariant}
              className="snap-center shrink-0 w-56 lg:w-auto"
            >
              <Card className="h-full" onClick={() => trackEvent("visit_type_click", { type: vt.name })}>
                <div className="text-3xl mb-3">{visitTypeIcons[i]}</div>
                <h3 className="text-base font-bold text-text-primary mb-3">
                  {vt.name}
                </h3>
                <ul className="space-y-1.5">
                  {vt.sections.map((s, j) => (
                    <li
                      key={j}
                      className="text-sm text-text-secondary flex items-start gap-2"
                    >
                      <span className="text-primary mt-0.5 text-xs">•</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}
