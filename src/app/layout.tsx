import type { Metadata } from "next";
import { jakarta } from "@/lib/fonts";
import { PlausibleProvider } from "@/components/analytics/PlausibleProvider";
import { ConsentBanner } from "@/components/analytics/ConsentBanner";
import { CONSENT_STORAGE_KEY, DEFAULT_CONSENT, toConsentMode } from "@/lib/consent";
import { GoogleTagManager } from "@next/third-parties/google";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  other: {
    "facebook-domain-verification": "nir1sumltt1te39ymgev8tte3kpt0w",
  },
};

const consentBootstrap = `
window.dataLayer = window.dataLayer || [];
window.gtag = window.gtag || function(){window.dataLayer.push(arguments);};
(function() {
  var storageKey = ${JSON.stringify(CONSENT_STORAGE_KEY)};
  var defaultConsent = ${JSON.stringify(DEFAULT_CONSENT)};
  var defaultMode = ${JSON.stringify(toConsentMode(DEFAULT_CONSENT))};
  var toMode = function(consent) {
    return {
      analytics_storage: consent.analytics ? "granted" : "denied",
      ad_storage: consent.marketing ? "granted" : "denied",
      ad_user_data: consent.marketing ? "granted" : "denied",
      ad_personalization: consent.marketing ? "granted" : "denied"
    };
  };
  var pushSnapshot = function(eventName, consent) {
    window.dataLayer.push({
      event: eventName,
      consent_analytics: consent.analytics ? "granted" : "denied",
      consent_marketing: consent.marketing ? "granted" : "denied"
    });
  };

  window.gtag("consent", "default", defaultMode);
  pushSnapshot("consent_default", defaultConsent);

  try {
    var raw = window.localStorage.getItem(storageKey);
    if (!raw) return;
    var parsed = JSON.parse(raw);
    var consent = {
      analytics: parsed.analytics === true,
      marketing: parsed.marketing === true
    };
    window.gtag("consent", "update", toMode(consent));
    pushSnapshot("consent_update", consent);
  } catch (_error) {}
})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID || "GTM-5JCQPNZ9";

  return (
    <html className={`${jakarta.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <Script id="gtm-consent-bootstrap" strategy="beforeInteractive">
          {consentBootstrap}
        </Script>
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <PlausibleProvider />
        {children}
        <ConsentBanner />
      </body>
      {gtmId ? <GoogleTagManager gtmId={gtmId} /> : null}
    </html>
  );
}
