import { Mail, Globe } from "lucide-react";
import type { Dictionary } from "@/lib/dictionary-types";
import type { Locale } from "@/lib/i18n";

export function Footer({
  lang,
  dict,
}: {
  lang: Locale;
  dict: Dictionary;
}) {
  const t = dict.footer;
  const prefix = lang === "cs" ? "" : "/en";

  const productLinks = [
    { label: t.productLinks.howItWorks, href: "#how-it-works" },
    { label: t.productLinks.features, href: "#features" },
    { label: t.productLinks.pricing, href: "#pricing" },
  ];

  const supportLinks = [
    { label: t.supportLinks.contact, href: "#cta-bottom" },
    { label: t.supportLinks.faq, href: "#faq" },
    { label: "info@anote.cz", href: "mailto:info@anote.cz" },
  ];

  const legalLinks = [
    { label: t.legalLinks.terms, href: `${prefix}/podminky` },
    { label: t.legalLinks.privacy, href: `${prefix}/ochrana-soukromi` },
    { label: t.legalLinks.impressum, href: `${prefix}/impressum` },
  ];

  return (
    <footer className="bg-dark-bg text-white/80">
      <div className="mx-auto max-w-[1200px] px-6 py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <a href={lang === "cs" ? "/" : "/en"} className="text-2xl font-extrabold text-white tracking-tight">
              AN<span className="text-primary">O</span>TE
            </a>
            <p className="mt-3 text-sm leading-relaxed text-white/60">
              {t.tagline}
            </p>
            <div className="mt-5 flex gap-4">
              <a
                href="mailto:info@anote.cz"
                className="text-white/50 hover:text-primary transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
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
                  <a href={l.href} className="text-sm text-white/60 hover:text-white transition-colors">
                    {l.label}
                  </a>
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
              {supportLinks.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="text-sm text-white/60 hover:text-white transition-colors">
                    {l.label}
                  </a>
                </li>
              ))}
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
                  <a href={l.href} className="text-sm text-white/60 hover:text-white transition-colors">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Medical disclaimer */}
        <div className="mt-12 border-t border-white/10 pt-6">
          <p className="text-xs text-white/40 leading-relaxed max-w-3xl">
            {t.disclaimer}
          </p>
        </div>

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
