"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { trackEvent } from "@/lib/analytics";
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
            onClick={() => trackEvent("language_toggle", { to: otherLocale })}
            className="text-xs font-semibold px-2.5 py-1 rounded-full border border-border text-text-secondary hover:text-text-primary hover:border-primary/40 transition-colors"
          >
            {otherLocale.toUpperCase()}
          </a>
          <Button
            size="default"
            onClick={() => {
              trackEvent("cta_click_nav");
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
              onClick={() => trackEvent("language_toggle", { to: otherLocale })}
              className="text-sm font-semibold px-3 py-1.5 rounded-full border border-border text-text-secondary"
            >
              {otherLocale.toUpperCase()}
            </a>
          </li>
          <li className="pt-4">
            <Button
              size="lg"
              onClick={() => {
                trackEvent("cta_click_nav");
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
