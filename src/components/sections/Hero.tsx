"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { trackEvent } from "@/lib/analytics";
import { HeroPhoneDemo } from "@/components/sections/HeroPhoneDemo";
import type { Dictionary } from "@/lib/dictionary-types";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.33, 1, 0.68, 1] as [number, number, number, number] },
});

const badgeIcons = ["🔒", "🇪🇺", "📱", "⚡"];

export function Hero({ dict }: { dict: Dictionary }) {
  const t = dict.hero;
  const pathname = usePathname();
  const firstSegment = pathname.split("/")[1];
  const lang = (firstSegment === "cs" || firstSegment === "en") ? firstSegment : "cs";
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
              <Link
                href={`/${lang}/demo`}
                onClick={() => trackEvent("cta_click", { location: "hero" })}
                className="inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 bg-primary text-white hover:bg-primary-dark hover:shadow-[var(--shadow-glow)] hover:scale-[1.03] active:scale-[0.97] px-8 py-3.5 text-lg"
              >
                {t.ctaPrimary}
              </Link>
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

          {/* Right: Interactive phone demo */}
          <HeroPhoneDemo dict={dict} />
        </div>
      </div>
    </section>
  );
}
