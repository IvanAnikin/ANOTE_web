# ANOTE Web — Multi-Page Restructure

> Tech spec & implementation plan for converting the single-page landing into a multi-page site.

---

## 1. Goal

Convert the current single-scroll landing page into a multi-page site with:
- A focused homepage (hero + key value propositions)
- Dedicated pages for pricing, report types, contacts, FAQ, and legal content
- A live browser demo page (Phase 4 — separate implementation)
- Cleaner navigation with flat top-level links
- Full CZ + EN i18n on all pages

---

## 2. Current State (single-page)

The homepage at `/` (cs) and `/en` currently renders **12 sections** in one scroll:

| # | Section | Component | Stays on Homepage? |
|---|---------|-----------|-------------------|
| 1 | Hero | `Hero.tsx` | **Yes** |
| 2 | Logo Bar | `LogoBar.tsx` | **Yes** |
| 3 | How It Works | `HowItWorks.tsx` | **Yes** |
| 4 | Features | `Features.tsx` | **Yes** |
| 5 | Demo Video | `DemoVideo.tsx` | **Yes** |
| 6 | Report Showcase | `ReportShowcase.tsx` | No → `/report-types` |
| 7 | Visit Types | `VisitTypes.tsx` | No → `/report-types` |
| 8 | Privacy & Security | `Privacy.tsx` | No → condensed version on homepage |
| 9 | Pricing | `Pricing.tsx` | No → `/pricing` |
| 10 | Testimonials | `Testimonials.tsx` | **Yes** |
| 11 | FAQ | `FAQ.tsx` | No → `/faq` |
| 12 | Bottom CTA | `BottomCTA.tsx` | **Yes** (compact version) |

Existing standalone pages: `/kontakt`, `/podminky`, `/ochrana-soukromi`, `/impressum`

---

## 3. Target Page Structure

### 3.1 Homepage (`/` and `/en`)

Focused conversion page — quick overview, then CTAs pointing to deeper pages.

| Order | Section | Notes |
|-------|---------|-------|
| 1 | Hero | As-is (primaryCTA → `/kontakt`, secondaryCTA → `/demo`) |
| 2 | LogoBar | As-is |
| 3 | HowItWorks | As-is |
| 4 | Features | As-is |
| 5 | DemoVideo | As-is (play button + screenshot carousel) |
| 6 | Testimonials | As-is |
| 7 | Trust Strip | **New** — compact 1-row version of Privacy section (shield + 3–4 key points) with "Více o bezpečnosti" link to `/report-types#security` |
| 8 | Bottom CTA Strip | Simplified — heading + subheading + single CTA button linking to `/kontakt`. No inline form. |

### 3.2 Pricing Page (`/[lang]/cenik`)

Dedicated page for pricing details.

| Section | Content |
|---------|---------|
| Header | Page title + subtitle |
| Pricing Card | ANOTE Pro card with feature list (reuse `Pricing.tsx` card) |
| Comparison Table | ANOTE vs. manual vs. competitors (reuse from `Pricing.tsx`) |
| FAQ (pricing-specific) | 3–4 pricing-related questions from current FAQ |
| CTA | "Vyzkoušet ANOTE" → `/kontakt` |

Route: `/cenik` (cs), `/en/pricing` (en) — uses localized slugs.

### 3.3 Report Types Page (`/[lang]/typy-zprav`)

Showcases what ANOTE generates — combines ReportShowcase + VisitTypes + security info.

| Section | Content |
|---------|---------|
| Header | Page title + subtitle |
| Report Showcase | Full transcript → report demo (reuse `ReportShowcase.tsx`) |
| Visit Types | Full card grid (reuse `VisitTypes.tsx`) |
| Security Block | Full Privacy & Security section (reuse `Privacy.tsx`) |
| CTA | "Vyzkoušet demo" → `/demo` |

Route: `/typy-zprav` (cs), `/en/report-types` (en)

### 3.4 FAQ Page (`/[lang]/faq`)

| Section | Content |
|---------|---------|
| Header | Page title |
| Accordion | Full FAQ list (reuse `FAQ.tsx` / `Accordion.tsx`) |
| CTA | "Máte další otázky?" → `/kontakt` |

Route: `/faq` (cs + en, same slug)

### 3.5 Contact Page (`/[lang]/kontakt`) — existing, keep as-is

Already has the full contact form + direct contact info. No changes needed.

### 3.6 Demo Page (`/[lang]/demo`) — **Phase 4, placeholder for now**

For this restructure, create a **placeholder page** with:
- "Připravujeme" / "Coming soon" messaging
- Brief description of what the demo will do
- CTA to `/kontakt` for early access

The actual live demo implementation is a separate task.

### 3.7 Legal Pages — existing, keep as-is

- `/podminky` — Terms
- `/ochrana-soukromi` — Privacy Policy
- `/impressum` — Legal imprint

---

## 4. Navigation

### 4.1 Navbar Links

| Label (CS) | Label (EN) | Target | Type |
|------------|------------|--------|------|
| Jak to funguje | How it works | `/#how-it-works` | Anchor (homepage only) |
| Typy zpráv | Report Types | `/typy-zprav` | Page link |
| Ceník | Pricing | `/cenik` | Page link |
| Demo | Demo | `/demo` | Page link |
| FAQ | FAQ | `/faq` | Page link |
| Kontakt | Contact | `/kontakt` | Page link |

**CTA button** (right side): "Vyzkoušet demo" / "Try Demo" → `/demo`

### 4.2 Anchor Link Behavior

- "Jak to funguje" scrolls to `#how-it-works` when already on homepage
- When on another page, navigate to `/{lang}#how-it-works`

### 4.3 Footer Links

Update footer to use page links instead of anchor links:

**Produkt column:** Jak to funguje (homepage anchor), Typy zpráv, Ceník, Demo
**Podpora column:** FAQ, Kontakt
**Právní column:** Podmínky, Ochrana soukromí, Impressum

---

## 5. Localized Route Slugs

| Page | CS slug | EN slug |
|------|---------|---------|
| Pricing | `/cs/cenik` (displayed as `/cenik`) | `/en/pricing` |
| Report Types | `/cs/typy-zprav` (displayed as `/typy-zprav`) | `/en/report-types` |
| FAQ | `/cs/faq` | `/en/faq` |
| Demo | `/cs/demo` | `/en/demo` |
| Contact | `/cs/kontakt` | `/en/contact` |
| Terms | `/cs/podminky` | `/en/terms` |
| Privacy | `/cs/ochrana-soukromi` | `/en/privacy` |
| Impressum | `/cs/impressum` | `/en/impressum` |

The existing pages (`kontakt`, `podminky`, `ochrana-soukromi`) currently use CS slugs even for English. This restructure will add EN slug aliases.

**Implementation:** Each page directory uses the CS slug (filesystem convention), and `proxy.ts` maps EN slugs to the correct CS directory.

---

## 6. New Components

### 6.1 Trust Strip (`TrustStrip.tsx`)

Compact single-row security summary for the homepage. Extracted from `Privacy.tsx`.

- Dark background strip (matches Privacy section styling)
- Shield icon + 3–4 key trust points in a horizontal row
- "Více →" link to `/report-types#security`
- Responsive: horizontal on desktop, 2×2 grid on mobile

### 6.2 Page Header (`PageHeader.tsx`)

Reusable page header with title + optional subtitle + optional breadcrumb.

- Gradient background (subtle, matches hero style)
- H1 title, optional H2 subtitle
- Consistent padding/spacing across all pages
- FadeInOnScroll animation

---

## 7. Dictionary Changes

### 7.1 New Keys

Add to `cs.json` / `en.json`:

```
nav.reportTypes      — "Typy zpráv" / "Report Types"
nav.pricing          — "Ceník" / "Pricing"  
nav.demo             — "Demo" / "Demo"
nav.faq              — "FAQ" / "FAQ"

trustStrip.heading   — heading text
trustStrip.points[]  — 3-4 trust point labels
trustStrip.link      — "Více o bezpečnosti" / "More about security"

pricingPage.title    — page title
pricingPage.subtitle — page subtitle

reportTypesPage.title    — page title
reportTypesPage.subtitle — page subtitle

faqPage.title        — page title

demoPage.title       — "Vyzkoušejte ANOTE" / "Try ANOTE"
demoPage.comingSoon  — coming soon text
demoPage.description — what the demo will do
demoPage.cta         — CTA text
```

### 7.2 Updated Keys

```
nav — add new link labels, update existing
footer — update link structure to use page routes
bottomCta — simplify to heading + subheading + single CTA (no form)
hero — update CTA targets (secondary → /demo)
```

---

## 8. SEO Updates

Each new page gets:
- `generateMetadata` with unique title, description, OG tags
- Canonical URL + `alternates.languages` (cs ↔ en)
- JSON-LD where appropriate (`FAQPage` schema for `/faq`, `Product` with offers for `/cenik`)

Update `sitemap.ts` to include all new routes with dual-locale alternates.

---

## 9. What Does NOT Change

- All existing section components remain — they're reused on new pages
- Animation wrappers, UI components, design system — untouched
- API routes (`/api/contact`, `/api/admin/submissions`) — untouched
- Admin page — untouched
- Analytics tracking — works as-is (events fire from the same components)
- Azure SWA config, GitHub Actions workflow — untouched
- `proxy.ts` locale detection logic — extended but not rewritten

---

## 10. Implementation Plan

### Step 1: Route Infrastructure

- [x] Extend `proxy.ts` to handle EN slug → CS slug mapping for new pages
- [x] Update `src/lib/i18n.ts` with route slug mappings if needed
- [x] Create page directories under `src/app/[lang]/`:
  - `cenik/page.tsx`
  - `typy-zprav/page.tsx`
  - `faq/page.tsx`
  - `demo/page.tsx`

### Step 2: New Shared Components

- [x] Create `src/components/layout/PageHeader.tsx`
- [x] Create `src/components/sections/TrustStrip.tsx` (compact privacy strip)

### Step 3: Dictionary Updates

- [x] Add new keys to `src/dictionaries/cs.json`
- [x] Add new keys to `src/dictionaries/en.json`
- [x] Update `src/lib/dictionary-types.ts` if needed (auto-inferred from JSON)
- [x] Update existing nav/footer/hero/bottomCta keys

### Step 4: Build New Pages

- [x] `/cenik` — Pricing page with `PageHeader` + `Pricing` + pricing FAQ + CTA
- [x] `/typy-zprav` — Report Types page with `PageHeader` + `ReportShowcase` + `VisitTypes` + `Privacy` + CTA
- [x] `/faq` — FAQ page with `PageHeader` + `FAQ` + CTA
- [x] `/demo` — Placeholder page with `PageHeader` + coming soon content + CTA

### Step 5: Update Homepage

- [x] Remove sections moved to other pages (ReportShowcase, VisitTypes, Privacy, Pricing, FAQ)
- [x] Add `TrustStrip` section
- [x] Simplify `BottomCTA` — heading + CTA button only (no inline form)
- [x] Update Hero CTA targets (secondary → `/demo`)

### Step 6: Update Navigation

- [x] Rewrite `Navbar.tsx` — replace anchor links with page links, update mobile drawer
- [x] Update `Footer.tsx` — replace anchor links with page links
- [x] Handle "Jak to funguje" anchor: scroll on homepage, navigate+hash on other pages

### Step 7: Update Existing Pages

- [x] Extend EN slug support for existing pages (`/en/contact`, `/en/terms`, `/en/privacy`)
- [x] Update `sitemap.ts` with all new routes + alternates
- [x] Update `generateMetadata` on all new pages

### Step 8: Verify & Ship

- [x] Run `npm run build` — all routes generate successfully
- [ ] Test navigation between all pages in both locales
- [ ] Test anchor scrolling ("Jak to funguje") from homepage and other pages
- [ ] Verify analytics events still fire correctly
- [ ] Push to `multi-page` branch

---

## 11. File Changes Summary

| Action | File |
|--------|------|
| **Create** | `src/app/[lang]/cenik/page.tsx` |
| **Create** | `src/app/[lang]/typy-zprav/page.tsx` |
| **Create** | `src/app/[lang]/faq/page.tsx` |
| **Create** | `src/app/[lang]/demo/page.tsx` |
| **Create** | `src/components/layout/PageHeader.tsx` |
| **Create** | `src/components/sections/TrustStrip.tsx` |
| **Edit** | `src/app/[lang]/page.tsx` — slim down to homepage sections |
| **Edit** | `src/components/layout/Navbar.tsx` — page links |
| **Edit** | `src/components/layout/Footer.tsx` — page links |
| **Edit** | `src/components/sections/Hero.tsx` — update CTA targets |
| **Edit** | `src/components/sections/BottomCTA.tsx` — simplify to CTA strip |
| **Edit** | `src/proxy.ts` — add EN slug routing |
| **Edit** | `src/app/sitemap.ts` — add new routes |
| **Edit** | `src/dictionaries/cs.json` — add new keys |
| **Edit** | `src/dictionaries/en.json` — add new keys |
| ~15 files total | |

---

## 12. Out of Scope

- **Live demo implementation** — `/demo` gets a placeholder only; real functionality is a separate task
- **Media assets** (photos, videos, real testimonials, logo) — Phase 3, done last
- **Plausible account setup** — manual step, code already in place
- **New section designs** — reusing existing components, no visual redesign
