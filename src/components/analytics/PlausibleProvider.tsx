"use client";

import Script from "next/script";

export function PlausibleProvider() {
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  if (!domain) return null;

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
