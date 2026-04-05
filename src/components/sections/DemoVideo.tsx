"use client";

import { FadeInOnScroll } from "@/components/animations/FadeInOnScroll";
import { StaggerChildren } from "@/components/animations/StaggerChildren";
import { Button } from "@/components/ui/Button";
import { motion, type Variants } from "framer-motion";
import { trackEvent } from "@/lib/analytics";
import type { Dictionary } from "@/lib/dictionary-types";

const itemVariant: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.33, 1, 0.68, 1] as [number, number, number, number] },
  },
};

const screenshotIcons = ["🎙️", "📝", "📋", "🏥", "📧"];

export function DemoVideo({ dict }: { dict: Dictionary }) {
  const t = dict.demoVideo;
  return (
    <section
      id="demo-video"
      className="py-24 sm:py-32 bg-dark-bg text-white relative overflow-hidden"
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark-bg via-dark-bg-lighter/30 to-dark-bg pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <FadeInOnScroll>
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold">
              {t.heading}
            </h2>
            <p className="mt-4 text-lg text-white/60">
              {t.subheading}
            </p>
          </div>
        </FadeInOnScroll>

        {/* Video placeholder */}
        <FadeInOnScroll>
          <div className="max-w-4xl mx-auto mb-14">
            <div className="aspect-video rounded-2xl bg-dark-bg-lighter border border-white/10 overflow-hidden relative flex items-center justify-center shadow-xl">
              {/* Play button */}
              <button
                className="group relative z-10 w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-[var(--shadow-glow)] transition-transform duration-300 hover:scale-110 cursor-pointer"
                aria-label={t.playLabel}
                onClick={() => trackEvent("video_play")}
              >
                <svg
                  className="w-8 h-8 text-white ml-1"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                {/* Pulse ring */}
                <span className="absolute inset-0 rounded-full border-2 border-primary/40 animate-ping" />
              </button>

              {/* Placeholder text */}
              <span className="absolute bottom-4 text-sm text-white/30">
                {t.placeholder}
              </span>
            </div>
          </div>
        </FadeInOnScroll>

        {/* Screenshot carousel fallback */}
        <StaggerChildren className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
          {t.screenshots.map((caption, i) => (
            <motion.div
              key={caption}
              variants={itemVariant}
              className="snap-center shrink-0 w-48 sm:w-56"
            >
              <div className="aspect-[9/16] rounded-xl bg-dark-bg-lighter border border-white/10 flex flex-col items-center justify-center gap-3 p-4">
                <span className="text-4xl">{screenshotIcons[i]}</span>
                <div className="space-y-1.5 w-full">
                  <div className="h-1.5 w-full bg-white/10 rounded" />
                  <div className="h-1.5 w-3/4 bg-white/10 rounded" />
                  <div className="h-1.5 w-5/6 bg-white/10 rounded" />
                </div>
              </div>
              <p className="mt-2 text-sm text-white/50 text-center">
                {caption}
              </p>
            </motion.div>
          ))}
        </StaggerChildren>

        {/* CTA */}
        <FadeInOnScroll>
          <div className="text-center mt-12">
            <Button
              size="lg"
              onClick={() =>
                document
                  .getElementById("cta-bottom")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              {t.cta}
            </Button>
          </div>
        </FadeInOnScroll>
      </div>
    </section>
  );
}
