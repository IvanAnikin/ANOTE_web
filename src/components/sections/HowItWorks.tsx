"use client";

import { FadeInOnScroll } from "@/components/animations/FadeInOnScroll";
import { StaggerChildren } from "@/components/animations/StaggerChildren";
import { Card } from "@/components/ui/Card";
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
import { Mic, AudioLines, FileCheck } from "lucide-react";

const stepIcons = [Mic, AudioLines, FileCheck];

export function HowItWorks({ dict }: { dict: Dictionary }) {
  const t = dict.howItWorks;
  return (
    <section id="how-it-works" className="py-24 sm:py-32">
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

        <StaggerChildren className="relative grid md:grid-cols-3 gap-8 lg:gap-12">
          {/* Connecting dotted line (desktop only) */}
          <div className="hidden md:block absolute top-1/3 left-[16%] right-[16%] h-px border-t-2 border-dashed border-primary/20 -z-0" />

          {t.steps.map((step, i) => {
            const Icon = stepIcons[i];
            return (
              <motion.div key={step.number} variants={itemVariant} className="relative">
                <Card className="relative overflow-hidden text-center h-full" hover>
                  {/* Large watermark number */}
                  <span className="absolute top-2 right-4 text-[5rem] font-extrabold text-primary/[0.06] leading-none select-none pointer-events-none">
                    {step.number}
                  </span>

                  {/* Icon with looping animation */}
                  <div className="mx-auto mb-5 w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Icon
                      className="w-8 h-8 text-primary animate-[pulse_3s_ease-in-out_infinite]"
                      strokeWidth={1.5}
                    />
                  </div>

                  <h3 className="text-xl font-bold text-text-primary mb-3">
                    {step.title}
                  </h3>
                  <p className="text-text-secondary leading-relaxed">
                    {step.description}
                  </p>
                </Card>
              </motion.div>
            );
          })}
        </StaggerChildren>
      </div>
    </section>
  );
}
