"use client";

import { FadeInOnScroll } from "@/components/animations/FadeInOnScroll";
import { useRef, useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import type { Dictionary } from "@/lib/dictionary-types";

export function Testimonials({ dict }: { dict: Dictionary }) {
  const t = dict.testimonials;
  const [active, setActive] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pathname = usePathname();
  const firstSegment = pathname.split("/")[1];
  const lang = (firstSegment === "cs" || firstSegment === "en") ? firstSegment : "cs";
  const kontaktHref = lang === "cs" ? "/kontakt" : "/en/contact";

  const next = useCallback(() => {
    setActive((prev) => (prev + 1) % t.items.length);
  }, [t.items.length]);

  const prev = useCallback(() => {
    setActive((prev) => (prev - 1 + t.items.length) % t.items.length);
  }, [t.items.length]);

  // Auto-scroll every 6s
  useEffect(() => {
    timerRef.current = setInterval(next, 6000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [next]);

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(next, 6000);
  };

  return (
    <section id="testimonials" className="py-24 sm:py-32 bg-surface">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <FadeInOnScroll>
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary">
              {t.heading}
            </h2>
          </div>
        </FadeInOnScroll>

        <FadeInOnScroll>
          <div className="relative max-w-3xl mx-auto">
            {/* Carousel */}
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${active * 100}%)` }}
              >
                {t.items.map((item, i) => (
                  <div key={i} className="w-full shrink-0 px-4">
                    <div className="rounded-2xl bg-background border border-border p-8 sm:p-10 text-center">
                      <span className="text-5xl text-primary/20 leading-none block mb-4">
                        &ldquo;
                      </span>
                      <blockquote className="text-lg sm:text-xl text-text-primary leading-relaxed mb-6">
                        {item.quote}
                      </blockquote>
                      <p className="font-bold text-text-primary">{item.name}</p>
                      <p className="text-sm text-text-secondary">{item.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation arrows */}
            <button
              onClick={() => { prev(); resetTimer(); }}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 sm:-translate-x-6 w-10 h-10 rounded-full bg-surface border border-border shadow-[var(--shadow-sm)] flex items-center justify-center text-text-secondary hover:text-primary transition-colors cursor-pointer"
              aria-label={t.prev}
            >
              &#8249;
            </button>
            <button
              onClick={() => { next(); resetTimer(); }}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:translate-x-6 w-10 h-10 rounded-full bg-surface border border-border shadow-[var(--shadow-sm)] flex items-center justify-center text-text-secondary hover:text-primary transition-colors cursor-pointer"
              aria-label={t.next}
            >
              &#8250;
            </button>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-6">
              {t.items.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setActive(i); resetTimer(); }}
                  className={`w-2.5 h-2.5 rounded-full transition-colors cursor-pointer ${
                    i === active ? "bg-primary" : "bg-border"
                  }`}
                  aria-label={`Testimonial ${i + 1}`}
                />
              ))}
            </div>

            {/* Fallback CTA */}
            <div className="text-center mt-10">
              <p className="text-text-secondary mb-4">
                {t.earlyAccessLabel}
              </p>
              <a
                href={kontaktHref}
                className="inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 border border-primary text-primary bg-transparent hover:bg-primary/5 px-6 py-2.5 text-base"
              >
                {t.earlyAccessCta}
              </a>
            </div>
          </div>
        </FadeInOnScroll>
      </div>
    </section>
  );
}
