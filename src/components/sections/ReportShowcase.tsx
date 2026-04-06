"use client";

import { FadeInOnScroll } from "@/components/animations/FadeInOnScroll";
import { TypewriterText } from "@/components/animations/TypewriterText";
import { Accordion } from "@/components/ui/Accordion";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CountUp } from "@/components/animations/CountUp";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/analytics";
import type { Dictionary } from "@/lib/dictionary-types";

export function ReportShowcase({ dict }: { dict: Dictionary }) {
  const t = dict.reportShowcase;
  const pathname = usePathname();
  const firstSegment = pathname.split("/")[1];
  const lang = (firstSegment === "cs" || firstSegment === "en") ? firstSegment : "cs";
  const speakerNames = t.speakers;
  const accordionItems = t.reportSections.map((s, i) => ({
    id: String(i),
    title: s.title,
    content: s.content,
  }));

  return (
    <section id="report-showcase" className="py-24 sm:py-32 bg-surface">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <FadeInOnScroll>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary">
              {t.heading}
            </h2>
          </div>
        </FadeInOnScroll>

        <div className="grid lg:grid-cols-[1fr_auto_1fr] gap-6 lg:gap-0 items-start">
          {/* Left panel */}
          <FadeInOnScroll direction="left">
            <div className="rounded-2xl border border-border bg-background p-6 lg:mr-4">
              <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-4">
                {t.transcriptLabel}
              </h3>
              <div className="space-y-4 text-sm leading-relaxed">
                {t.dialogue.map((line, i) => {
                  const name =
                    line.speaker === "doctor"
                      ? speakerNames.doctor
                      : speakerNames.patient;
                  return (
                    <div key={i}>
                      <span
                        className={`font-semibold ${
                          line.speaker === "doctor"
                            ? "text-primary"
                            : "text-secondary"
                        }`}
                      >
                        {name}:
                      </span>{" "}
                      {i === 0 ? (
                        <TypewriterText
                          text={line.text}
                          speed={25}
                          className="text-text-primary"
                        />
                      ) : (
                        <span className="text-text-primary">{line.text}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </FadeInOnScroll>

          {/* Animated arrow */}
          <FadeInOnScroll delay={0.3}>
            <div className="hidden lg:flex flex-col items-center justify-center h-full py-12 px-4">
              <svg
                width="60"
                height="24"
                viewBox="0 0 60 24"
                fill="none"
                className="text-primary"
              >
                <path
                  d="M0 12H50M50 12L42 4M50 12L42 20"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="4 4"
                />
              </svg>
              <Badge className="mt-4 bg-primary text-white whitespace-nowrap">
                \u23f1\ufe0f <CountUp end={12} duration={1200} className="font-bold" />{" "}
                {t.timer}
              </Badge>
            </div>
            <div className="flex lg:hidden justify-center py-4">
              <div className="flex flex-col items-center gap-2">
                <svg
                  width="24"
                  height="40"
                  viewBox="0 0 24 40"
                  fill="none"
                  className="text-primary"
                >
                  <path
                    d="M12 0V30M12 30L4 22M12 30L20 22"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="4 4"
                  />
                </svg>
                <Badge className="bg-primary text-white whitespace-nowrap">
                  \u23f1\ufe0f <CountUp end={12} duration={1200} className="font-bold" />{" "}
                  {t.timer}
                </Badge>
              </div>
            </div>
          </FadeInOnScroll>

          {/* Right panel */}
          <FadeInOnScroll direction="right" delay={0.2}>
            <div className="rounded-2xl border border-border bg-background p-6 lg:ml-4">
              <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-4">
                {t.arrowLabel}
              </h3>
              <Accordion items={accordionItems} onItemOpen={(title) => trackEvent("report_section_expand", { section: title })} />
            </div>
          </FadeInOnScroll>
        </div>

        {/* CTA */}
        <FadeInOnScroll>
          <div className="text-center mt-14">
            <Link href={`/${lang}/demo`}>
              <Button size="lg">
                {dict.demoVideo.cta}
              </Button>
            </Link>
          </div>
        </FadeInOnScroll>
      </div>
    </section>
  );
}
