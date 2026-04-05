"use client";

import { FadeInOnScroll } from "@/components/animations/FadeInOnScroll";
import { StaggerChildren } from "@/components/animations/StaggerChildren";
import { motion, type Variants } from "framer-motion";
import type { Dictionary } from "@/lib/dictionary-types";

const itemVariant: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.33, 1, 0.68, 1] as [number, number, number, number] },
  },
};

const lastLogoLabel = (logos: readonly string[]) => logos[logos.length - 1];

export function LogoBar({ dict }: { dict: Dictionary }) {
  const t = dict.logoBar;
  return (
    <section className="relative z-10 -mt-8">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="rounded-2xl bg-surface border border-border shadow-[var(--shadow-md)] py-8 px-6 sm:px-10">
          <FadeInOnScroll>
            <p className="text-center text-sm font-medium text-text-secondary mb-6 tracking-wide uppercase">
              {t.label}
            </p>
          </FadeInOnScroll>

          <StaggerChildren className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
            {t.logos.map((name) => (
              <motion.div
                key={name}
                variants={itemVariant}
                className="group flex items-center justify-center"
              >
                <div className="px-4 py-2 rounded-lg text-text-secondary/50 font-semibold text-sm sm:text-base grayscale transition-all duration-300 hover:grayscale-0 hover:text-primary cursor-default select-none">
                  {name === lastLogoLabel(t.logos) ? (
                    <span className="border-2 border-dashed border-primary/30 rounded-full px-4 py-1.5 text-primary/60 hover:border-primary hover:text-primary transition-colors">
                      {name}
                    </span>
                  ) : (
                    <span className="text-lg tracking-wide">{name}</span>
                  )}
                </div>
              </motion.div>
            ))}
          </StaggerChildren>
        </div>
      </div>
    </section>
  );
}
