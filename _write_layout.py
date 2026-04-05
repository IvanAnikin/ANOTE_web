#!/usr/bin/env python3
"""Write Navbar.tsx and Footer.tsx with i18n support."""

base = '/Users/ivananikin/Documents/ANOTE-web/src/components/layout'

NAVBAR = '''"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import type { Dictionary } from "@/lib/dictionary-types";
import type { Locale } from "@/lib/i18n";

export function Navbar({
  lang,
  dict,
}: {
  lang: Locale;
  dict: Dictionary;
}) {
  const t = dict.nav;
  const navLinks = [
    { label: t.howItWorks, href: "#how-it-works" },
    { label: t.features, href: "#features" },
    { label: t.pricing, href: "#pricing" },
    { label: t.contact, href: "#cta-bottom" },
  ];

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const otherLocale = lang === "cs" ? "en" : "cs";
  const localePrefix = otherLocale === "cs" ? "/" : "/en";

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/80 backdrop-blur-lg shadow-[var(--shadow-sm)]"
          : "bg-transparent",
      )}
    >
      <nav className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4">
        {/* Logo */}
        <a href={lang === "cs" ? "/" : "/en"} className="text-2xl font-extrabold text-text-primary tracking-tight">
          AN<span className="text-primary">O</span>TE
        </a>

        {/* Desktop nav links */}
        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="relative text-sm font-medium text-text-secondary hover:text-text-primary transition-colors group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-primary transition-all duration-300 group-hover:w-full" />
              </a>
            </li>
          ))}
        </ul>

        {/* Desktop CTA + Language toggle */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href={localePrefix}
            className="text-xs font-semibold px-2.5 py-1 rounded-full border border-border text-text-secondary hover:text-text-primary hover:border-primary/40 transition-colors"
          >
            {otherLocale.toUpperCase()}
          </a>
          <Button
            size="default"
            onClick={() => {
              document.getElementById("cta-bottom")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            {t.tryDemo}
          </Button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-text-primary cursor-pointer"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? t.closeMenu : t.openMenu}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile drawer */}
      <div
        className={cn(
          "md:hidden fixed inset-0 top-[72px] bg-white/95 backdrop-blur-lg transition-transform duration-300 z-40",
          mobileOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <ul className="flex flex-col items-center gap-6 pt-12">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-lg font-semibold text-text-primary"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <a
              href={localePrefix}
              className="text-sm font-semibold px-3 py-1.5 rounded-full border border-border text-text-secondary"
            >
              {otherLocale.toUpperCase()}
            </a>
          </li>
          <li className="pt-4">
            <Button
              size="lg"
              onClick={() => {
                setMobileOpen(false);
                document.getElementById("cta-bottom")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              {t.tryDemo}
            </Button>
          </li>
        </ul>
      </div>
    </header>
  );
}
'''

FOOTER = '''import { Mail, Globe } from "lucide-react";
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
          <p className="text-xs text-white/40">Made with \\u2764\\uFE0F in Prague</p>
        </div>
      </div>
    </footer>
  );
}
'''

import os
for name, content in [('Navbar.tsx', NAVBAR), ('Footer.tsx', FOOTER)]:
    with open(os.path.join(base, name), 'w') as f:
        f.write(content)
    print(f'Wrote {name}')
print('All done')
