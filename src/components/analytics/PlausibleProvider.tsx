"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { CONSENT_CHANGE_EVENT, getStoredConsent } from "@/lib/consent";

export function PlausibleProvider() {
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const syncConsent = () => {
      setEnabled(getStoredConsent()?.analytics === true);
    };

    syncConsent();
    window.addEventListener(CONSENT_CHANGE_EVENT, syncConsent);

    return () => {
      window.removeEventListener(CONSENT_CHANGE_EVENT, syncConsent);
    };
  }, []);

  if (!domain) return null;
  if (!enabled) return null;

  const host =
    process.env.NEXT_PUBLIC_PLAUSIBLE_HOST || "https://plausible.io";

  return (
    <Script
      strategy="afterInteractive"
      data-domain={domain}
      src={`${host}/js/script.js`}
    />
  );
}
