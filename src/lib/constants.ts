export const siteConfig = {
  name: "ANOTE",
  url: "https://anote.cz",
  description:
    "Přepisujte rozhovory s pacienty a generujte strukturované lékařské zprávy pomocí AI. On-device přepis, GDPR compliant, česká terminologie.",
  contactEmail: "info@anote.cz",
};

export const navLinks = [
  { label: "Jak to funguje", href: "#how-it-works" },
  { label: "Funkce", href: "#features" },
  { label: "Cena", href: "#pricing" },
  { label: "Kontakt", href: "#cta-bottom" },
] as const;

export const colors = {
  primary: "#0D9488",
  primaryDark: "#0F766E",
  secondary: "#F97316",
  background: "#FAFAF9",
  surface: "#FFFFFF",
  textPrimary: "#1C1917",
  textSecondary: "#78716C",
  border: "#E7E5E4",
  darkBg: "#0F172A",
  success: "#22C55E",
  error: "#EF4444",
} as const;
