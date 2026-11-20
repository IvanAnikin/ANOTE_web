"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/analytics";

export function ContentCta({
  heading,
  text,
  primary,
  location,
}: {
  heading: string;
  text: string;
  primary: "demo" | "contact";
  location: "specialty_page" | "article";
}) {
  const buttons =
    primary === "demo"
      ? [
          { href: "/demo", label: "Vyzkoušet demo", main: true },
          { href: "/kontakt", label: "Domluvit ukázku", main: false },
        ]
      : [
          { href: "/kontakt", label: "Napsat nám", main: true },
          { href: "/demo", label: "Vyzkoušet demo", main: false },
        ];

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-br from-primary to-primary-dark text-center">
      <div className="mx-auto max-w-2xl px-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">{heading}</h2>
        <p className="mt-4 text-white/85 leading-relaxed">{text}</p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          {buttons.map((b) => (
            <Link
              key={b.href}
              href={b.href}
              onClick={() => trackEvent("cta_click", { location })}
              className={
                b.main
                  ? "inline-flex items-center justify-center rounded-xl bg-white px-8 py-3 text-base font-semibold text-primary shadow-lg hover:bg-white/90 transition-colors"
                  : "inline-flex items-center justify-center rounded-xl border-2 border-white/70 px-8 py-3 text-base font-semibold text-white hover:bg-white/10 transition-colors"
              }
            >
              {b.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
