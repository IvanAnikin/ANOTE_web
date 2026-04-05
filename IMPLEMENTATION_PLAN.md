# ANOTE Landing Page — Implementation Plan

> Step-by-step plan for building the ANOTE marketing website based on `LANDING_PAGE_SPEC.md`.
> Organized into phases with clear deliverables, dependencies, and acceptance criteria.

---

## Overview

| | |
|---|---|
| **Stack** | Next.js 16.2.2 (App Router, Turbopack), TypeScript, Tailwind CSS 4, Framer Motion |
| **Hosting** | Azure Static Web Apps (Free tier), West Europe |
| **Timeline** | 4 phases — Phase 1 is the MVP launch |
| **Languages** | Czech (primary), English (Phase 1.5) |

---

## Phase 1: Foundation & Core Landing Page

### 1.1 Project Scaffolding

**Goal:** Set up the repo, tooling, and project structure.

- [x] Initialize Next.js 16 project with App Router and TypeScript
- [x] Install core dependencies: framer-motion, lucide-react, react-hook-form + zod + @hookform/resolvers
- [x] Configure Tailwind CSS 4 with design system tokens (colors, shadows, fonts via @theme inline)
- [x] Set up Google Font: Plus Jakarta Sans (latin-ext) via next/font/google
- [x] Create `src/lib/constants.ts` for shared config values
- [x] Create `src/lib/fonts.ts` for font loading
- [x] Set up `globals.css` with CSS custom properties and Tailwind imports
- [x] Set up ESLint config

**Acceptance:** `npm run dev` serves blank page, Tailwind classes work, fonts load with Czech diacritics rendering correctly.

---

### 1.2 Reusable UI Components

**Goal:** Build the shared component library before page assembly.

- [x] `Button.tsx` — primary (pill, accent fill, glow hover) + secondary (ghost/outline) + loading state
- [x] `Card.tsx` — rounded corners, shadow, hover lift effect (`translateY -6px`)
- [x] `Input.tsx` — text, email, tel, textarea, select, checkbox — with label, error message, focus styles
- [x] `Accordion.tsx` — smooth height animation (CSS grid-rows), chevron rotation on toggle
- [x] `Badge.tsx` — small colored pill with icon + text
- [x] `Modal.tsx` — centered overlay, backdrop blur, close on ESC/click-outside
- [x] `SectionDivider.tsx` — SVG wave/curve divider between sections (with `flip` prop)

**Acceptance:** All components render correctly in isolation, responsive, match the design system colors/typography/spacing.

---

### 1.3 Animation Wrappers

**Goal:** Create reusable Framer Motion animation components.

- [x] `FadeInOnScroll.tsx` — fade up + `translateY 30px → 0`, triggered by Intersection Observer, `once: true`
- [x] `StaggerChildren.tsx` — parent wrapper that staggers child animations (100–200ms delay)
- [x] `ParallaxFloat.tsx` — `translateY` shifts at 0.3× scroll speed for phone mockups
- [x] `CountUp.tsx` — animated number counter (0 → target value) on scroll into view
- [x] `TypewriterText.tsx` — text appearing character by character (for report showcase)

**Acceptance:** Each wrapper animates correctly on scroll, runs once, no layout shift.

---

### 1.4 Layout Components

**Goal:** Build the global page frame (navbar + footer).

#### Navbar (`Navbar.tsx`)
- [x] Transparent on top, solid white/dark with `backdrop-filter: blur()` on scroll
- [x] Left: ANOTE wordmark/logo
- [x] Center/right: nav links — "Jak to funguje · Funkce · Cena · Kontakt" — smooth-scroll to anchors
- [x] Right: CZ/EN language pill toggle (initially CZ only, EN disabled/hidden)
- [x] Right: "Vyzkoušet demo" CTA button (primary accent, pill shape)
- [x] Mobile: hamburger icon → slide-in drawer with nav links + CTA
- [x] Hover: nav link underline slides in from left

#### Footer (`Footer.tsx`)
- [x] Dark background (`#0F172A`)
- [x] 4-column grid (desktop), stacked (mobile): Logo/tagline, Produkt links, Podpora links, Právní links
- [x] Social links row (LinkedIn, email)
- [x] Bottom bar: © 2026, tagline, "Made with ❤ in Prague"
- [x] Medical disclaimer text from spec §17.4

**Acceptance:** Navbar transitions correctly on scroll, mobile drawer works, footer is responsive, all links scroll to correct anchors.

---

### 1.5 Landing Page Sections (Main Scroll Page)

**Goal:** Implement all sections for the single-page landing experience at `/`.

Build these in order (top to bottom), integrating the animation wrappers:

#### 1.5.1 Hero Section (`Hero.tsx`) ✅
- [x] Full viewport height layout
- [x] Left: H1 heading, H2 subheading, two CTA buttons, trust badges row
- [x] Right: phone mockup image (placeholder) with 3D perspective, `margin-bottom: -80px` overlap
- [x] Animated mesh gradient background (CSS, cream → faint teal)
- [x] Page-load animation sequence: heading → subheading → CTAs → phone slide-in → badges
- [x] Trust badges: 🔒 GDPR · 🇪🇺 Data v EU · 📱 iOS & Android · ⚡ Funguje i offline

#### 1.5.2 Logo Bar (`LogoBar.tsx`) ✅
- [x] Horizontal strip, slightly overlapping hero bottom
- [x] "Používají lékaři v České republice" heading
- [x] Row of placeholder grayscale logos (use generic shapes or "Vaše klinika?" CTA)
- [x] Logos fade in + slide up on scroll, full-color on hover

#### 1.5.3 How It Works (`HowItWorks.tsx`) ✅
- [x] Section heading + subheading
- [x] 3 numbered step cards (horizontal desktop, stacked mobile)
- [x] Each card: large number watermark, icon, title, description
- [x] Staggered fade-in animation (200ms intervals)
- [x] Connecting dotted line/arrow between steps
- [x] Subtle looping micro-animations on icons (CSS keyframes)

#### 1.5.4 Features (`Features.tsx`) ✅
- [x] Section heading
- [x] 6 feature blocks in alternating left-right layout
- [x] Each block: title, body text, badge, placeholder visual area
- [x] Visuals overlap into adjacent blocks (30px bleed) for layered feel
- [x] Fade-in-on-scroll for each block

#### 1.5.5 Demo Video (`DemoVideo.tsx`) ✅
- [x] Dark/gradient background for contrast
- [x] Centered video placeholder (16:9 rounded container with custom play button)
- [x] Fallback: horizontal carousel of 5 app screenshot placeholders with captions
- [x] CTA: "Chci vyzkoušet ANOTE" scrolls to bottom form
- [x] Lazy-load video player on scroll into view

#### 1.5.6 Report Showcase (`ReportShowcase.tsx`) ✅
- [x] Full-width block, two-panel layout
- [x] Left: sample transcript (styled as conversation, typewriter effect on scroll)
- [x] Right: 12-section report with collapsible accordion
- [x] Animated arrow between panels (dashed SVG, desktop horizontal / mobile vertical)
- [x] "Vygenerováno za 12 s" floating badge with CountUp timer animation
- [x] CTA at bottom

#### 1.5.7 Visit Types (`VisitTypes.tsx`) ✅
- [x] Horizontal scroll row of 6 cards (scroll/swipe on mobile), grid on desktop
- [x] Each card: icon, title, 3–4 bullet points of key sections
- [x] Cards slide in from below with stagger
- [x] Hover: lift + shadow + border-color shift

#### 1.5.8 Privacy & Security (`Privacy.tsx`) ✅
- [x] Dark background block (deep navy) for visual contrast
- [x] Large shield icon/illustration centerpiece with pulse/glow animation
- [x] 2×3 feature grid with icons, titles, details
- [x] Staggered fade-in

#### 1.5.9 Pricing (`Pricing.tsx`) ✅
- [x] Clean centered layout
- [x] Main pricing card (ANOTE Pro — ~0.03 Kč/report, feature list, CTA)
- [x] Cost comparison table (ANOTE vs. manual vs. competitors)
- [x] Row highlight on hover in comparison table

#### 1.5.10 Testimonials (`Testimonials.tsx`) ✅
- [x] Carousel of testimonial cards (auto-scroll 6s, manual prev/next/dots)
- [x] Each card: large quote mark, quote text, doctor name/role/city
- [x] Placeholder quotes from spec (to be replaced with real ones)
- [x] Fallback: "Staňte se jedním z prvních uživatelů" with early-access CTA

#### 1.5.11 FAQ (`FAQ.tsx`) ✅
- [x] Accordion layout, centered column (max-width ~800px)
- [x] 10 questions from spec §5.12
- [x] Smooth expand/collapse with CSS grid-rows
- [x] Chevron icon rotation on toggle
- [x] Background highlight on hover

#### 1.5.12 Bottom CTA & Contact Form (`BottomCTA.tsx`) ✅
- [x] Full-width gradient background (teal → teal-dark)
- [x] Section heading + subheading
- [x] Contact form (React Hook Form + Zod 4 validation):
  - Jméno (required), Email (required), Telefon, Typ praxe (select), Zpráva, GDPR checkbox (required)
- [x] Inline error messages, loading spinner on submit
- [x] Success state: green checkmark + "Děkujeme! Ozveme se vám do 24 hodin."
- [x] Alternative contact info: email + phone number

**Acceptance:** Full single-page scroll experience works end-to-end, all sections render responsively, animations fire correctly, form validates and shows success state (backend wired in Phase 1.3).

---

### 1.6 Contact Form API

**Goal:** Wire up the form submission backend.

- [x] Create `src/app/api/contact/route.ts` — POST endpoint
- [x] Validate request body with Zod (same schema as client)
- [x] Rate limiting: basic IP-based throttle (e.g., max 5 submissions/hour)
- [ ] Send notification email to `CONTACT_EMAIL_TO` (via SMTP or Resend) — **deferred until SMTP/Resend configured**
- [ ] Optional: send confirmation email to the lead — **deferred**
- [x] Return JSON success/error response
- [x] Wire `BottomCTA.tsx` form to POST to `/api/contact`
- [x] Handle network errors gracefully in the UI

**Acceptance:** Form submits, team receives email notification, user sees success message. Rate limiting prevents abuse.

---

### 1.7 Static Pages

**Goal:** Create the legal/contact pages.

- [x] `/kontakt` — contact page with embedded form (reuse BottomCTA form component) + direct contact info
- [x] `/podminky` — terms of service (placeholder content, legal text to be provided)
- [x] `/ochrana-soukromi` — privacy policy (placeholder content, legal text to be provided)
- [x] `/impressum` — legal imprint (placeholder: entity name, address, IČO)

**Acceptance:** All pages accessible, linked from footer and navbar, basic content renders.

---

### 1.8 SEO & Metadata

**Goal:** Optimize for search engines and social sharing.

- [x] Root `layout.tsx`: metadata object with title, description, keywords, Open Graph, Twitter card
- [x] JSON-LD structured data (`SoftwareApplication` schema) in the head
- [x] `robots.txt` and `sitemap.xml` generation (Next.js built-in or plugin)
- [x] Canonical URLs set
- [ ] Proper heading hierarchy (single H1 per page, semantic HTML) — **verify during perf audit**
- [ ] Alt text on all images — **no real images yet (placeholders)**
- [x] Open Graph image placeholder (1200×630)
- [ ] Favicon set (16, 32, 180) — **deferred until brand assets available**

**Acceptance:** Lighthouse SEO score ≥95, social sharing preview renders correctly.

---

### 1.9 Performance Optimization

**Goal:** Hit the performance targets from spec §13.1.

- [x] Configure Next.js for static generation (SSG) on all pages
- [x] Use `next/image` with WebP/AVIF for all images, responsive `srcset` — **config enabled; no real images yet**
- [x] Dynamic import Framer Motion and Lottie with `ssr: false` — **below-fold sections use `next/dynamic` code splitting; `optimizePackageImports` for framer-motion tree-shaking**
- [x] Preconnect to Google Fonts
- [x] Verify Tailwind purges unused CSS — **Tailwind 4 handles automatically**
- [x] Lazy-load below-fold sections and video — **10 sections lazy-loaded via `next/dynamic`; video is placeholder only**
- [ ] Test: Lighthouse Performance ≥95, LCP <2.5s, CLS <0.05, TBT <200ms — **requires running dev server + Lighthouse**

**Acceptance:** All Lighthouse metrics green on desktop and mobile.

---

## Phase 1.5: Internationalization (English) ✅

**Goal:** Add English language support.

**Implementation:** Uses Next.js 16 built-in `[lang]` dynamic route segment with JSON dictionary files — no `next-intl`.

- [x] Set up i18n infrastructure: `src/lib/i18n.ts` (locale routing helpers), `src/lib/dictionary-types.ts` (typed dict from JSON)
- [x] Set up routing: `src/proxy.ts` for locale detection/routing — `/` rewrites to Czech (default), `/en/` prefix for English
- [x] Restructure app under `src/app/[lang]/` with `generateStaticParams` for cs/en
- [x] Create dictionary files: `src/dictionaries/cs.json` and `src/dictionaries/en.json` (~300 lines each)
- [x] Extract all hardcoded Czech strings — all 12 sections, nav, footer, 4 static pages, form labels, error messages, FAQ
- [x] Update all 12 section components to accept `dict` prop (icons stay in code, all text from dict)
- [x] Update Navbar with `lang`/`dict` props + CZ/EN toggle pill that switches locale
- [x] Update Footer with `lang`/`dict` props + locale-prefixed legal links
- [x] Update 4 static pages (kontakt, podminky, ochrana-soukromi, impressum) with async params + `generateMetadata` + dict-driven content
- [x] Update `sitemap.ts` with dual-locale entries + `alternates.languages`
- [x] `hreflang` tags and locale-specific metadata via `generateMetadata` in `[lang]/layout.tsx`
- [x] JSON-LD structured data in `[lang]/layout.tsx`
- [x] Build passes with all routes for cs and en statically generated

**Acceptance:** ✅ Full site available in CZ and EN, toggle works, SEO hreflang set, build passes.

---

## Phase 2: Deployment & Analytics

### 2.1 Azure Static Web Apps Setup

- [ ] Create Azure resource group `anote-rg` in West Europe — **manual step via Azure Portal/CLI**
- [ ] Create Azure Static Web App (Free tier) — **manual step via Azure Portal/CLI**
- [x] Connect GitHub repo for auto-deploy on push to `main` — **`.github/workflows/azure-static-web-apps.yml` created**
- [x] Verify GitHub Actions workflow (auto-generated) builds and deploys — **workflow includes `npm ci`, type-check, build, then SWA deploy**
- [ ] Set environment variables via `az staticwebapp appsettings set` — **manual step; `.env.example` documents required vars**
- [ ] Configure custom domain `anote.cz` (CNAME/A record) — **manual DNS step**
- [x] Redirect `www.anote.cz` → `anote.cz` — **handled via `staticwebapp.config.json` config**
- [ ] Verify SSL certificate is provisioned — **automatic once custom domain is configured**
- [x] `staticwebapp.config.json` with security headers, navigation fallback, cache rules, CSP
- [x] `.env.example` with all required environment variables documented

**Acceptance:** Site live at `anote.cz`, auto-deploys on push, SSL working.

### 2.2 Analytics

- [x] Set up Plausible Analytics — `PlausibleProvider.tsx` component using `next/script`
- [x] Add tracking script via `next/script` with `afterInteractive` strategy
- [x] Configure custom events from spec §14.2:
  - `cta_click_hero`, `cta_click_nav`, `video_play`, `video_complete`
  - `faq_expand`, `form_start`, `form_submit`, `form_error`
  - `visit_type_click`, `report_section_expand`, `language_toggle`
- [x] Support UTM parameter tracking — **Plausible handles UTM params automatically**
- [ ] Verify dashboard shows data — **requires Plausible account + `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` env var**

**Acceptance:** Analytics dashboard shows pageviews and custom events, no cookie banner needed.

---

## Phase 3: Media Assets & Polish

**Goal:** Replace all placeholder content with real assets.

### 3.1 Brand & Visual Assets
- [ ] Finalize ANOTE logo (SVG) — horizontal wordmark + square icon
- [ ] Create favicon set (16, 32, 180, 192, 512)
- [ ] Create Open Graph image (1200×630)
- [ ] Design hero phone mockup (3D perspective, transparent PNG) with real app screenshot

### 3.2 App Screenshots
- [ ] Home/recording screen
- [ ] Live transcript screen
- [ ] Generated report screen
- [ ] Settings / visit type selection screen
- [ ] Recording history screen
- [ ] Email/copy workflow screen

### 3.3 Lottie Animations
- [ ] Microphone pulse animation (`mic-pulse.json`)
- [ ] Waveform → text transformation (`waveform.json`)
- [ ] Report checkmark animation (`checkmark.json`)
- [ ] Confetti burst for form success
- [ ] Replace CSS keyframe placeholders with Lottie where specified

### 3.4 Video Production
- [ ] Record product demo video (90–120s) — full workflow walkthrough
- [ ] Quick teaser video (15–30s) — for hero background or social
- [ ] Host on CDN or embed from a privacy-friendly provider

### 3.5 Content
- [ ] Collect real testimonials from beta users (replace placeholders)
- [ ] Get partner/clinic logos for logo bar (or keep "Vaše klinika?" CTA)
- [ ] Finalize legal text: terms of service, privacy policy, impressum
- [ ] Create background gradient mesh texture for hero

**Acceptance:** All placeholder content replaced, site looks production-ready.

---

## Phase 4: Live Browser Demo

> As specified in spec §15 — self-serve demo at `/demo`.

### 4.1 Demo Page UI
- [ ] Build `/demo` page layout: record button, transcript panel, report panel
- [ ] Microphone access via `navigator.mediaDevices.getUserMedia()`
- [ ] Session limit: max 60s recording per demo
- [ ] "DEMO" watermark on generated reports
- [ ] Disclaimer: "Nepoužívejte pro skutečné pacientské údaje."

### 4.2 Speech-to-Text Integration
- [ ] Integrate Azure Speech SDK for JavaScript (recommended approach C from spec)
- [ ] Stream PCM audio to Azure Speech service
- [ ] Display live transcript in real-time

### 4.3 Report Generation
- [ ] POST transcript to existing ANOTE `/report` backend endpoint
- [ ] Render structured report in collapsible accordion UI
- [ ] Dedicated demo API token with rate limiting (max 5 demos/IP/hour)

### 4.4 Analytics
- [ ] Track `demo_start`, `demo_complete`, `demo_to_signup` events
- [ ] CTA: "Chcete plnou verzi? Stáhnout aplikaci"

**Acceptance:** Users can record voice in browser, see transcript, get sample report, with rate limiting and disclaimers in place.

---

## Dependency Graph

```
Phase 1.1 (Scaffolding)
    ├── Phase 1.2 (UI Components)
    │       └── Phase 1.5 (All Landing Page Sections)
    ├── Phase 1.3 (Animation Wrappers)
    │       └── Phase 1.5 (All Landing Page Sections)
    └── Phase 1.4 (Layout: Navbar + Footer)
            └── Phase 1.5 (All Landing Page Sections)
                    ├── Phase 1.6 (Contact Form API)
                    ├── Phase 1.7 (Static Pages)
                    ├── Phase 1.8 (SEO & Metadata)
                    └── Phase 1.9 (Performance Optimization)

Phase 1.5 (i18n / English) — can run in parallel after Phase 1.5

Phase 2.1 (Azure Deployment) — after Phase 1 complete
Phase 2.2 (Analytics) — after Phase 2.1

Phase 3 (Assets & Polish) — ongoing, plugs into any phase

Phase 4 (Live Demo) — after Phase 2, requires ANOTE backend access
```

---

## Tech Stack Summary

| Dependency | Version | Purpose |
|-----------|---------|---------|
| `next` | 16.2.2 | Framework (App Router, Turbopack, SSG) |
| `react` / `react-dom` | 19+ | UI library |
| `typescript` | 5+ | Type safety |
| `tailwindcss` | 4 | Utility-first CSS |
| `framer-motion` | 12+ | Scroll, hover, layout animations |
| `react-hook-form` | 7.72+ | Form state management |
| `zod` | 4.3+ | Schema validation (forms, API) |
| `@hookform/resolvers` | 5.2+ | Zod resolver for react-hook-form |
| `lucide-react` | 1.7+ | Icon set |
| `@azure/static-web-apps-cli` | latest | Local dev/deploy tooling (Phase 2) |

---

## Key Decisions & Notes

1. **SSG over SSR** — The marketing site has no dynamic per-request data. Static generation gives the best performance and works on the Free tier of Azure SWA.

2. **Framer Motion over GSAP** — Better React integration, smaller bundle when tree-shaken, `whileInView` API maps cleanly to the spec's scroll-trigger requirements.

3. **Plausible over Google Analytics** — No cookies = no cookie banner = better UX + GDPR simplicity. Aligns with the product's privacy-first branding.

4. **Azure SWA Free Tier first** — $0/month covers 100 GB bandwidth. Upgrade to Standard ($9/mo) only if staging environments or bandwidth demand it. Container Apps ($5–15/mo) reserved for Phase 4 if SSR is needed.

5. **Placeholder-first approach** — Every section ships with placeholder content/images. Real assets (screenshots, video, testimonials, logos) are plugged in during Phase 3 without code changes.

6. **Contact form API in-repo** — Uses Next.js API routes (serverless functions via Azure SWA). No separate backend needed for the marketing site.

7. **Built-in i18n over next-intl** — Next.js 16 supports `[lang]` dynamic segments with JSON dictionary files natively. No third-party i18n library needed. Icons/visual config stay in component code; all translatable text comes from typed JSON dictionaries.

8. **proxy.ts over middleware.ts** — Next.js 16 uses `proxy.ts` (replacing deprecated `middleware.ts`) for locale routing at the edge.
