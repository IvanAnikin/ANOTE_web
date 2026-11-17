"use client";

import Link from "next/link";
import { Mail, Globe } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import type { Dictionary } from "@/lib/dictionary-types";
import type { Locale } from "@/lib/i18n";

export const FACEBOOK_URL = "https://www.facebook.com/profile.php?id=61590339076321";
export const INSTAGRAM_URL = "https://www.instagram.com/anote.cz/";

export function Footer({
  lang,
  dict,
}: {
  lang: Locale;
  dict: Dictionary;
}) {
  const t = dict.footer;
  const prefix = lang === "cs" ? "" : "/en";
  const homeHref = lang === "cs" ? "/" : "/en";

  // Localized slugs
  const reportTypesHref =
    lang === "cs" ? `${prefix}/typy-zprav` : "/en/report-types";
  const pricingHref = lang === "cs" ? `${prefix}/cenik` : "/en/pricing";
  const kontaktHref = lang === "cs" ? `${prefix}/kontakt` : "/en/contact";
  const demoHref = `${prefix}/demo`;
  const faqHref = `${prefix}/faq`;
  const termsHref = lang === "cs" ? `${prefix}/podminky` : "/en/terms";
  const privacyHref =
    lang === "cs" ? `${prefix}/ochrana-soukromi` : "/en/privacy";

  const productLinks = [
    { label: t.productLinks.howItWorks, href: `${homeHref}#how-it-works` },
    { label: t.productLinks.reportTypes, href: reportTypesHref },
    { label: t.productLinks.pricing, href: pricingHref },
    { label: t.productLinks.demo, href: demoHref },
  ];

  const supportLinks = [
    { label: t.supportLinks.faq, href: faqHref },
    { label: t.supportLinks.contact, href: kontaktHref },
    { label: "anote-appka@outlook.com", href: "mailto:anote-appka@outlook.com" },
    { label: "+420 735 852 353", href: "tel:+420735852353" },
  ];

  const legalLinks = [
    { label: t.legalLinks.terms, href: termsHref },
    { label: t.legalLinks.privacy, href: privacyHref },
  ];

  return (
    <footer className="bg-dark-bg text-white/80">
      <div className="mx-auto max-w-[1200px] px-6 py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href={lang === "cs" ? "/" : "/en"} className="text-2xl font-extrabold text-white tracking-tight">
              AN<span className="text-primary">O</span>TE
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-white/60">
              {t.tagline}
            </p>
            <div className="mt-5 flex gap-4">
              <a
                href="mailto:anote-appka@outlook.com"
                onClick={() => trackEvent("email_click", { location: "footer" })}
                className="text-white/50 hover:text-primary transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
              <a
                href={FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent("social_click", { network: "facebook", location: "footer" })}
                className="text-white/50 hover:text-primary transition-colors"
                aria-label="Facebook"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
                  <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.52 1.49-3.91 3.78-3.91 1.1 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.44 2.91h-2.34V22c4.78-.76 8.43-4.92 8.43-9.94Z" />
                </svg>
              </a>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent("social_click", { network: "instagram", location: "footer" })}
                className="text-white/50 hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="4.2" />
                  <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
                </svg>
              </a>
              <a
                href="#"
                className="text-white/50 hover:text-primary transition-colors"
                aria-label="LinkedIn"
              >
                <Globe className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
              {t.product}
            </h4>
            <ul className="mt-4 flex flex-col gap-3">
              {productLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-white/60 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
              {t.support}
            </h4>
            <ul className="mt-4 flex flex-col gap-3">
              {supportLinks.map((l) =>
                l.href.startsWith("mailto:") || l.href.startsWith("tel:") ? (
                  <li key={l.href}>
                    <a
                      href={l.href}
                      onClick={() =>
                        trackEvent(
                          l.href.startsWith("mailto:") ? "email_click" : "phone_click",
                          { location: "footer" },
                        )
                      }
                      className="text-sm text-white/60 hover:text-white transition-colors"
                    >
                      {l.label}
                    </a>
                  </li>
                ) : (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-white/60 hover:text-white transition-colors">
                      {l.label}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
              {t.legal}
            </h4>
            <ul className="mt-4 flex flex-col gap-3">
              {legalLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-white/60 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Medical disclaimer */}
        {t.disclaimer && (
          <div className="mt-12 border-t border-white/10 pt-6">
            <p className="text-xs text-white/40 leading-relaxed max-w-3xl">
              {t.disclaimer}
            </p>
          </div>
        )}

        {/* Bottom bar */}
        <div className="mt-6 flex flex-col items-center justify-between gap-2 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-xs text-white/40">
            {t.copyright.replace("{year}", String(new Date().getFullYear()))}
          </p>
          <p className="text-xs text-white/40">Made with ❤️ in Prague</p>
        </div>
      </div>
    </footer>
  );
}
