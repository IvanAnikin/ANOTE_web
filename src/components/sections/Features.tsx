"use client";

import { BouncingChips } from "@/components/animations/BouncingChips";
import { FadeInOnScroll } from "@/components/animations/FadeInOnScroll";
import { Badge } from "@/components/ui/Badge";
import type { Dictionary } from "@/lib/dictionary-types";

const featurePlaceholders = ["transcript", "anamneza", "workflow"];

function FeatureVisual({ type, dict }: { type: string; dict: Dictionary }) {
  const wf = dict.features.workflow;
  const visuals: Record<string, React.ReactNode> = {
    transcript: (
      <div className="space-y-2 p-4">
        <div className="h-2.5 w-4/5 bg-primary/50 rounded animate-[pulse_2s_ease-in-out_infinite]" />
        <div className="h-2.5 w-full bg-primary/40 rounded animate-[pulse_2s_ease-in-out_infinite_0.2s]" />
        <div className="h-2.5 w-3/4 bg-primary/30 rounded animate-[pulse_2s_ease-in-out_infinite_0.4s]" />
        <div className="h-2.5 w-5/6 bg-primary/40 rounded animate-[pulse_2s_ease-in-out_infinite_0.6s]" />
        <div className="h-2.5 w-2/3 bg-primary/30 rounded" />
      </div>
    ),
    privacy: (
      <div className="flex items-center justify-center gap-6 p-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">📱</div>
        <div className="flex flex-col items-center gap-1">
          <div className="text-xs text-text-secondary">text only →</div>
          <div className="w-16 border-t-2 border-dashed border-primary/30" />
          <div className="text-xs text-error line-through">❌ audio</div>
        </div>
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">🇪🇺</div>
      </div>
    ),
    offline: (
      <div className="flex items-center justify-center gap-4 p-4">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-lg mx-auto mb-1">✈️</div>
          <span className="text-xs text-text-secondary">Offline</span>
        </div>
        <div className="text-success text-xl">✓</div>
        <div className="text-center">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg mx-auto mb-1">📝</div>
          <span className="text-xs text-text-secondary">Přepis</span>
        </div>
      </div>
    ),
    templates: (
      <div className="flex gap-2 p-4 overflow-hidden">
        {["🏥", "🔄", "🔬", "📡"].map((icon, i) => (
          <div
            key={i}
            className="shrink-0 w-14 h-16 rounded-lg bg-surface border border-border flex items-center justify-center text-xl shadow-[var(--shadow-sm)]"
          >
            {icon}
          </div>
        ))}
      </div>
    ),
    anamneza: (
      <div className="w-full h-40 p-2">
        <BouncingChips chips={["NO", "RA", "OA", "FA", "AA"]} />
      </div>
    ),
    workflow: (
      <div className="flex items-center justify-center gap-2 p-4 flex-wrap">
        {/* Step 1: Record */}
        <div className="text-center">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg mx-auto mb-1">🔴</div>
          <span className="text-[10px] text-text-secondary">{wf.record}</span>
        </div>

        <span className="text-primary/40 text-lg">→</span>

        {/* Step 2: Stop */}
        <div className="text-center">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg mx-auto mb-1">⏹️</div>
          <span className="text-[10px] text-text-secondary">{wf.stop}</span>
        </div>

        {/* Fork: two outcome branches */}
        <div className="flex flex-col items-start gap-2 ml-1">
          <div className="flex items-center gap-2">
            <span className="text-primary/40 text-sm leading-none">→</span>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm">📧</div>
            <span className="text-[10px] text-text-secondary whitespace-nowrap">{wf.sendEmail}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-primary/40 text-sm leading-none">→</span>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm">📋</div>
            <span className="text-[10px] text-text-secondary whitespace-nowrap">{wf.copy}</span>
          </div>
        </div>
      </div>
    ),
  };

  return (
    <div className="rounded-2xl bg-background border border-border overflow-hidden min-h-[160px] flex items-center justify-center">
      {visuals[type] ?? <div className="h-32 bg-primary/5" />}
    </div>
  );
}

export function Features({ dict }: { dict: Dictionary }) {
  const t = dict.features;
  return (
    <section id="features" className="py-24 sm:py-32 bg-background">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <FadeInOnScroll>
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary">
              {t.heading}
            </h2>
          </div>
        </FadeInOnScroll>

        <div className="space-y-20 lg:space-y-28">
          {t.items.map((feature, index) => {
            const isReversed = index % 2 === 1;
            return (
              <FadeInOnScroll
                key={index}
                direction={isReversed ? "right" : "left"}
              >
                <div
                  className={`grid lg:grid-cols-2 gap-10 lg:gap-16 items-center ${
                    isReversed ? "lg:direction-rtl" : ""
                  }`}
                >
                  {/* Text side */}
                  <div className={isReversed ? "lg:order-2" : ""}>
                    <Badge className="mb-4">{feature.badge}</Badge>
                    <h3 className="text-2xl sm:text-3xl font-bold text-text-primary mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-text-secondary text-lg leading-relaxed">
                      {feature.body}
                    </p>
                  </div>

                  {/* Visual side — overlaps by 60px into adjacent blocks */}
                  <div
                    className={`${
                      isReversed ? "lg:order-1" : ""
                    } lg:-my-[30px]`}
                  >
                    <FeatureVisual type={featurePlaceholders[index] ?? "transcript"} dict={dict} />
                  </div>
                </div>
              </FadeInOnScroll>
            );
          })}
        </div>
      </div>
    </section>
  );
}
