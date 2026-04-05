"use client";

import { FadeInOnScroll } from "@/components/animations/FadeInOnScroll";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <section className="pt-32 pb-16 relative overflow-hidden">
      {/* Subtle gradient background matching hero style */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
        <div className="absolute top-0 right-0 w-[40%] h-[60%] rounded-full bg-primary/[0.03] blur-[80px]" />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <FadeInOnScroll>
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-text-primary">
              {title}
            </h1>
            {subtitle && (
              <h2 className="mt-4 text-lg sm:text-xl text-text-secondary leading-relaxed">
                {subtitle}
              </h2>
            )}
          </div>
        </FadeInOnScroll>
      </div>
    </section>
  );
}
