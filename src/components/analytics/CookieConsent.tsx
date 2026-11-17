"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CONSENT_OPEN_EVENT,
  readConsent,
  saveConsent,
  type ConsentChoice,
} from "@/lib/consent";
import type { Dictionary } from "@/lib/dictionary-types";
import type { Locale } from "@/lib/i18n";

/**
 * Small bottom bar asking for analytics/marketing cookie consent.
 * Both choices have the same visual weight. Hidden until mounted so the
 * server render never shows it to visitors who already chose.
 */
export function CookieConsent({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const t = dict.cookieConsent;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (readConsent() === null) setOpen(true);
    const reopen = () => setOpen(true);
    window.addEventListener(CONSENT_OPEN_EVENT, reopen);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, reopen);
  }, []);

  if (!open) return null;

  const choose = (choice: ConsentChoice) => {
    saveConsent(choice);
    setOpen(false);
  };

  const privacyHref = lang === "cs" ? "/ochrana-soukromi" : "/en/privacy";
  const buttonClass =
    "inline-flex flex-1 items-center justify-center whitespace-nowrap rounded-full border border-primary px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary cursor-pointer sm:flex-none";

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-consent-text"
      className="fixed inset-x-0 bottom-0 z-[60] p-3 sm:p-4"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-3 rounded-2xl border border-border bg-surface/95 px-4 py-3 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:gap-5 sm:px-5">
        <p id="cookie-consent-text" className="text-sm leading-snug text-text-secondary">
          {t.text}{" "}
          <Link href={privacyHref} className="font-medium text-text-primary underline underline-offset-2 hover:text-primary">
            {t.privacyLink}
          </Link>
        </p>
        <div className="flex shrink-0 gap-2">
          <button type="button" className={buttonClass} onClick={() => choose("necessary")}>
            {t.necessaryOnly}
          </button>
          <button type="button" className={buttonClass} onClick={() => choose("all")}>
            {t.acceptAll}
          </button>
        </div>
      </div>
    </div>
  );
}
