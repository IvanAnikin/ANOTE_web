"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ParallaxFloat } from "@/components/animations/ParallaxFloat";
import { trackEvent } from "@/lib/analytics";
import type { Dictionary } from "@/lib/dictionary-types";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.33, 1, 0.68, 1] as [number, number, number, number] },
});

const badgeIcons = ["🔒", "🇪🇺", "📱", "⚡"];

export function Hero({ dict }: { dict: Dictionary }) {
  const t = dict.hero;
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      {/* Animated mesh gradient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
        <div className="absolute top-0 right-0 w-[60%] h-[60%] rounded-full bg-primary/[0.04] blur-[100px] animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute bottom-0 left-0 w-[40%] h-[40%] rounded-full bg-secondary/[0.03] blur-[80px] animate-[pulse_10s_ease-in-out_infinite_2s]" />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 w-full py-20 lg:py-0">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text content */}
          <div className="max-w-xl">
            <motion.h1
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-text-primary leading-[1.1]"
              {...fadeUp(0)}
            >
              {t.headingLine1}
              <br />
              <span className="text-primary">{t.headingLine2}</span>
            </motion.h1>

            <motion.p
              className="mt-6 text-lg sm:text-xl text-text-secondary leading-relaxed"
              {...fadeUp(0.15)}
            >
              {t.description}
            </motion.p>

            <motion.div
              className="mt-8 flex flex-wrap gap-4"
              {...fadeUp(0.3)}
            >
              <Button size="lg" onClick={() => { trackEvent("cta_click_hero"); document.getElementById("cta-bottom")?.scrollIntoView({ behavior: "smooth" }); }}>
                {t.ctaPrimary}
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => document.getElementById("demo-video")?.scrollIntoView({ behavior: "smooth" })}
              >
                <svg className="w-5 h-5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                {t.ctaSecondary}
              </Button>
            </motion.div>

            <motion.div
              className="mt-8 flex flex-wrap gap-3"
              {...fadeUp(0.5)}
            >
              {t.badges.map((label, i) => (
                <Badge key={label} className="bg-white/80 text-text-secondary border border-border">
                  <span>{badgeIcons[i]}</span> {label}
                </Badge>
              ))}
            </motion.div>
          </div>

          {/* Right: Phone mockup placeholder */}
          <motion.div
            initial={{ opacity: 0, x: 60, rotateY: -8 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.33, 1, 0.68, 1] }}
            className="relative flex justify-center lg:justify-end"
          >
            <ParallaxFloat speed={0.15}>
              <div className="relative w-[280px] sm:w-[320px] lg:w-[340px] mb-[-80px]">
                {/* Phone frame placeholder */}
                <div className="aspect-[9/19] rounded-[2.5rem] bg-gradient-to-b from-dark-bg to-dark-bg-lighter border-4 border-dark-bg shadow-xl overflow-hidden">
                  {/* Screen content placeholder */}
                  <div className="h-full flex flex-col p-4 pt-8">
                    {/* Status bar */}
                    <div className="flex justify-between text-white/40 text-xs mb-4">
                      <span>9:41</span>
                      <span>●●●</span>
                    </div>
                    {/* App header */}
                    <div className="text-center mb-4">
                      <span className="text-xl font-bold text-white">ANOTE</span>
                    </div>
                    {/* Fake transcript lines */}
                    <div className="flex-1 space-y-2">
                      <div className="h-2 w-3/4 bg-white/10 rounded" />
                      <div className="h-2 w-full bg-white/10 rounded" />
                      <div className="h-2 w-5/6 bg-white/10 rounded" />
                      <div className="h-2 w-2/3 bg-primary/30 rounded" />
                      <div className="mt-4 h-2 w-full bg-white/10 rounded" />
                      <div className="h-2 w-4/5 bg-white/10 rounded" />
                      <div className="h-2 w-3/4 bg-primary/30 rounded" />
                      <div className="mt-4 h-2 w-full bg-white/10 rounded" />
                      <div className="h-2 w-2/3 bg-white/10 rounded" />
                    </div>
                    {/* Record button */}
                    <div className="flex justify-center py-4">
                      <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-[var(--shadow-glow)]">
                        <div className="w-5 h-5 rounded-full bg-white animate-pulse" />
                      </div>
                    </div>
                  </div>
                </div>
                {/* Shadow underneath */}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-dark-bg/20 blur-2xl rounded-full" />
              </div>
            </ParallaxFloat>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
