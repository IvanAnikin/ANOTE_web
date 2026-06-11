"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  DEFAULT_CONSENT,
  type ConsentState,
  getStoredConsent,
  saveConsent,
} from "@/lib/consent";

const copy = {
  cs: {
    badge: "Soukromi a cookies",
    title: "Pouzivame jen nutne cookies a volitelne mereni.",
    description:
      "Nutne cookies drzi web v chodu. Analyticke cookies pomahaji merit vykon webu v GA4. Marketing povoluje reklamni mereni pres GTM pro Meta, LinkedIn a Google Ads.",
    necessary: "Nutne",
    necessaryDetail: "Vzdy aktivni",
    analytics: "Analytika",
    analyticsDetail: "GA4 pres Google Tag Manager",
    marketing: "Marketing",
    marketingDetail: "Meta Pixel, LinkedIn Insight Tag, Google Ads",
    acceptAll: "Prijmout vse",
    rejectOptional: "Odmítnout volitelne",
    saveSelection: "Ulozit volbu",
  },
  en: {
    badge: "Privacy and cookies",
    title: "We use only necessary cookies and optional measurement.",
    description:
      "Necessary cookies keep the site working. Analytics helps measure site performance in GA4. Marketing enables advertising measurement in GTM for Meta, LinkedIn, and Google Ads.",
    necessary: "Necessary",
    necessaryDetail: "Always active",
    analytics: "Analytics",
    analyticsDetail: "GA4 via Google Tag Manager",
    marketing: "Marketing",
    marketingDetail: "Meta Pixel, LinkedIn Insight Tag, Google Ads",
    acceptAll: "Accept all",
    rejectOptional: "Reject optional",
    saveSelection: "Save selection",
  },
} as const;

function getLocaleFromPath(pathname: string) {
  return pathname.startsWith("/en") ? "en" : "cs";
}

export function ConsentBanner() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [consent, setConsent] = useState<ConsentState>(DEFAULT_CONSENT);

  useEffect(() => {
    const stored = getStoredConsent();
    setMounted(true);
    if (stored) {
      setConsent(stored);
      setVisible(false);
      return;
    }

    setConsent(DEFAULT_CONSENT);
    setVisible(true);
  }, []);

  const locale = useMemo(() => {
    if (typeof window === "undefined") return "cs";
    return getLocaleFromPath(window.location.pathname);
  }, []);

  const t = copy[locale];

  if (!mounted || !visible) return null;

  const persistConsent = (nextConsent: ConsentState) => {
    saveConsent(nextConsent);
    setConsent(nextConsent);
    setVisible(false);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-[70] p-4 sm:p-6" role="dialog" aria-live="polite" aria-label={t.badge}>
      <div className="mx-auto max-w-4xl rounded-[2rem] border border-border bg-surface/95 p-5 shadow-[var(--shadow-xl)] backdrop-blur-xl sm:p-6">
        <div className="flex flex-col gap-5">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              {t.badge}
            </p>
            <h2 className="text-xl font-bold text-text-primary sm:text-2xl">
              {t.title}
            </h2>
            <p className="max-w-3xl text-sm leading-relaxed text-text-secondary sm:text-base">
              {t.description}
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-border bg-background p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-text-primary">{t.necessary}</p>
                  <p className="mt-1 text-sm text-text-secondary">{t.necessaryDetail}</p>
                </div>
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                  On
                </span>
              </div>
            </div>

            <label className="rounded-2xl border border-border bg-background p-4 cursor-pointer">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-text-primary">{t.analytics}</p>
                  <p className="mt-1 text-sm text-text-secondary">{t.analyticsDetail}</p>
                </div>
                <input
                  type="checkbox"
                  checked={consent.analytics}
                  onChange={(event) =>
                    setConsent((current) => ({
                      ...current,
                      analytics: event.target.checked,
                    }))
                  }
                  className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
                />
              </div>
            </label>

            <label className="rounded-2xl border border-border bg-background p-4 cursor-pointer">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-text-primary">{t.marketing}</p>
                  <p className="mt-1 text-sm text-text-secondary">{t.marketingDetail}</p>
                </div>
                <input
                  type="checkbox"
                  checked={consent.marketing}
                  onChange={(event) =>
                    setConsent((current) => ({
                      ...current,
                      marketing: event.target.checked,
                    }))
                  }
                  className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
                />
              </div>
            </label>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
            <Button
              variant="ghost"
              className="justify-center rounded-2xl"
              onClick={() => persistConsent(DEFAULT_CONSENT)}
            >
              {t.rejectOptional}
            </Button>
            <Button
              variant="secondary"
              className="justify-center rounded-2xl"
              onClick={() => persistConsent(consent)}
            >
              {t.saveSelection}
            </Button>
            <Button
              className="justify-center rounded-2xl"
              onClick={() =>
                persistConsent({ analytics: true, marketing: true })
              }
            >
              {t.acceptAll}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
