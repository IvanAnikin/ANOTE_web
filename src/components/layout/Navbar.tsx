"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
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
  const prefix = lang === "cs" ? "" : "/en";
  const pathname = usePathname();

  // Localized slugs for EN
  const reportTypesHref =
    lang === "cs" ? `${prefix}/typy-zprav` : "/en/report-types";
  const pricingHref = lang === "cs" ? `${prefix}/cenik` : "/en/pricing";
  const kontaktHref = lang === "cs" ? `${prefix}/kontakt` : "/en/contact";
  const demoHref = `${prefix}/demo`;
  const faqHref = `${prefix}/faq`;

  // "Jak to funguje" — anchor on homepage, navigate+hash on other pages
  const isHomepage = pathname === "/" || pathname === "/en" || pathname === "/cs";
  const howItWorksHref = isHomepage
    ? "#how-it-works"
    : `${prefix || "/"}#how-it-works`;

  const navLinks = [
    { label: t.howItWorks, href: howItWorksHref },
    { label: t.reportTypes, href: reportTypesHref },
    { label: t.pricing, href: pricingHref },
    { label: t.demo, href: demoHref },
    { label: t.faq, href: faqHref },
    { label: t.contact, href: kontaktHref },
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
        <Link href={lang === "cs" ? "/" : "/en"} className="text-2xl font-extrabold text-text-primary tracking-tight">
          AN<span className="text-primary">O</span>TE
        </Link>

        {/* Desktop nav links */}
        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isAnchor = link.href.startsWith("#");
            if (isAnchor) {
              return (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="relative text-sm font-medium text-text-secondary hover:text-text-primary transition-colors group"
                  >
                    {link.label}
                    <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-primary transition-all duration-300 group-hover:w-full" />
                  </a>
                </li>
              );
            }
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="relative text-sm font-medium text-text-secondary hover:text-text-primary transition-colors group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-primary transition-all duration-300 group-hover:w-full" />
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Desktop CTA + Language toggle */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href={localePrefix}
            onClick={() => trackEvent("language_toggle", { to: otherLocale })}
            className="text-xs font-semibold px-2.5 py-1 rounded-full border border-border text-text-secondary hover:text-text-primary hover:border-primary/40 transition-colors"
          >
            {otherLocale.toUpperCase()}
          </Link>
          <Link href={demoHref}>
            <Button
              size="default"
              onClick={() => trackEvent("cta_click_nav")}
            >
              {t.tryDemo}
            </Button>
          </Link>
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
          {navLinks.map((link) => {
            const isAnchor = link.href.startsWith("#");
            if (isAnchor) {
              return (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-lg font-semibold text-text-primary"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </a>
                </li>
              );
            }
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-lg font-semibold text-text-primary"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
          <li>
            <Link
              href={localePrefix}
              onClick={() => trackEvent("language_toggle", { to: otherLocale })}
              className="text-sm font-semibold px-3 py-1.5 rounded-full border border-border text-text-secondary"
            >
              {otherLocale.toUpperCase()}
            </Link>
          </li>
          <li className="pt-4">
            <Link href={demoHref} onClick={() => setMobileOpen(false)}>
              <Button
                size="lg"
                onClick={() => trackEvent("cta_click_nav")}
              >
                {t.tryDemo}
              </Button>
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
}
