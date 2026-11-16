"use client";

import { FadeInOnScroll } from "@/components/animations/FadeInOnScroll";
import { StaggerChildren } from "@/components/animations/StaggerChildren";
import { Button } from "@/components/ui/Button";
import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/lib/dictionary-types";

/**
 * Muted, looping app demo. Horizontal (16:9) on wider screens, vertical (9:16)
 * on phones; the file is only fetched once the player is near the viewport and
 * it only plays while visible. With prefers-reduced-motion it does not
 * autoplay and shows controls instead.
 */
function DemoClip({ lang, label }: { lang: "cs" | "en"; label: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [vertical, setVertical] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const narrow = window.matchMedia("(max-width: 639px)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setVertical(narrow.matches);
      setReducedMotion(motionQuery.matches);
    };
    update();
    narrow.addEventListener("change", update);
    motionQuery.addEventListener("change", update);
    return () => {
      narrow.removeEventListener("change", update);
      motionQuery.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setNear(true);
        if (reducedMotion) return;
        if (entry.isIntersecting) void el.play().catch(() => {});
        else el.pause();
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reducedMotion, vertical]);

  const format = vertical ? "9x16" : "16x9";
  const base = `/videos/anote-demo-${lang}-${format}`;

  return (
    <div
      className={`mx-auto mb-14 overflow-hidden rounded-[1.75rem] border border-white/10 bg-dark-bg-lighter shadow-2xl ${
        vertical ? "max-w-sm" : "max-w-5xl"
      }`}
    >
      <video
        key={format}
        ref={ref}
        className="block h-auto w-full"
        width={vertical ? 1080 : 1920}
        height={vertical ? 1920 : 1080}
        poster={`${base}.jpg`}
        src={near ? `${base}.mp4` : undefined}
        muted
        loop
        playsInline
        autoPlay={!reducedMotion}
        controls={reducedMotion}
        preload="none"
        aria-label={label}
      />
    </div>
  );
}

const itemVariant: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.33, 1, 0.68, 1] as [number, number, number, number] },
  },
};

const screenshotImages = [
  "/screenshots/IMG_0306.PNG",
  "/screenshots/IMG_0305.PNG",
  "/screenshots/IMG_0304.PNG",
  "/screenshots/IMG_0299.PNG",
] as const;

export function DemoVideo({ dict }: { dict: Dictionary }) {
  const t = dict.demoVideo;
  const pathname = usePathname();
  const firstSegment = pathname.split("/")[1];
  const lang = (firstSegment === "cs" || firstSegment === "en") ? firstSegment : "cs";
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
          </div>
        </FadeInOnScroll>

        <FadeInOnScroll>
          <DemoClip lang={lang} label={t.videoLabel} />
        </FadeInOnScroll>

        <StaggerChildren className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide md:grid md:grid-cols-2 md:justify-items-center xl:grid-cols-4 md:overflow-visible">
          {screenshotImages.map((src, i) => (
            <motion.div
              key={src}
              variants={itemVariant}
              className="snap-center shrink-0"
            >
              <div className="w-fit overflow-hidden rounded-[1.75rem] border border-white/10 bg-dark-bg-lighter shadow-xl">
                <img
                  src={src}
                  alt={t.screenshots[i]}
                  width="1170"
                  height="2532"
                  className="block h-auto w-64 bg-dark-bg-lighter sm:w-72 xl:w-[17rem]"
                  loading="lazy"
                />
              </div>
              <p className="mt-2 text-sm text-white/50 text-center">
                {t.screenshots[i]}
              </p>
            </motion.div>
          ))}
        </StaggerChildren>

        {/* CTA */}
        <FadeInOnScroll>
          <div className="text-center mt-12">
            <Link href={`/${lang}/demo`}>
              <Button size="lg">
                {t.cta}
              </Button>
            </Link>
          </div>
        </FadeInOnScroll>
      </div>
    </section>
  );
}
