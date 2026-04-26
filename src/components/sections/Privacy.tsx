"use client";

import { FadeInOnScroll } from "@/components/animations/FadeInOnScroll";
import { StaggerChildren } from "@/components/animations/StaggerChildren";
import { motion, type Variants } from "framer-motion";
import { Shield } from "lucide-react";
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

const privacyIcons = ["🔒", "📱", "🇪🇺", "🚫", "🔑", "🏢"];

export function Privacy({ dict }: { dict: Dictionary }) {
  const t = dict.privacy;
  return (
    <section id="privacy" className="pt-12 pb-24 sm:pt-16 sm:pb-32 bg-dark-bg text-white relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative">
        {/* Centerpiece shield */}
        <FadeInOnScroll>
          <div className="flex justify-center mb-16">
            <div className="relative">
              <Shield
                className="w-16 h-16 text-primary animate-[pulse_4s_ease-in-out_infinite]"
                strokeWidth={1.5}
              />
              {/* Glow ring */}
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-[pulse_4s_ease-in-out_infinite]" />
            </div>
          </div>
        </FadeInOnScroll>

        <StaggerChildren className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {t.features.map((f, i) => (
            <motion.div
              key={f.title}
              variants={itemVariant}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm transition-colors hover:border-primary/30"
            >
              <span className="text-3xl mb-3 block">{privacyIcons[i]}</span>
              <h3 className="text-lg font-bold mb-2">{f.title}</h3>
              <p className="text-white/60 text-sm leading-relaxed">{f.detail}</p>
            </motion.div>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}
