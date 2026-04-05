# Phase 2 Handoff Prompt — Deployment & Analytics

> Copy this prompt into a new agentic coding session to implement Phase 2.

---

## Context

You are continuing work on the **ANOTE landing page** — a medical dictation product's marketing website. All Phase 1 work is complete:

- **Next.js 16.2.2** (App Router, Turbopack), TypeScript, Tailwind CSS 4, Framer Motion 12
- **12 landing page sections** fully implemented with scroll animations
- **i18n** using `[lang]` dynamic route segment + JSON dictionaries (`src/dictionaries/cs.json`, `src/dictionaries/en.json`). Czech (`cs`) is default locale at `/`, English at `/en/`. Routing via `src/proxy.ts`.
- **4 static pages**: `/kontakt`, `/podminky`, `/ochrana-soukromi`, `/impressum` — all i18n-enabled
- **Contact form API** at `src/app/api/contact/route.ts` with Zod validation + rate limiting (email sending deferred)
- **SEO**: `generateMetadata` per locale, JSON-LD, `robots.ts`, `sitemap.ts` (dual locale with alternates)
- **Performance**: 10 below-fold sections lazy-loaded via `next/dynamic`, `optimizePackageImports` for framer-motion
- **Build passes cleanly** with SSG for all routes (cs + en)

Reference files:
- `LANDING_PAGE_SPEC.md` — full product specification (§12 for Azure deployment, §14 for analytics)
- `IMPLEMENTATION_PLAN.md` — implementation status (Phase 2 section has checklist)
- `AGENTS.md` — read the Next.js 16 docs in `node_modules/next/dist/docs/` before making framework decisions

---

## Task: Implement Phase 2 (both sections)

### Phase 2.1 — Azure Static Web Apps Deployment

Set up the Azure SWA deployment pipeline. The site should be hostable on Azure SWA Free tier.

**Deliverables:**

1. **`staticwebapp.config.json`** in project root — Azure SWA configuration file:
   - Route rules for the Next.js app (navigation fallback)
   - Locale routing: ensure `/` serves Czech, `/en/` serves English (coordinate with `proxy.ts`)
   - Custom headers: security headers (X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Content-Security-Policy)
   - Platform configuration: `apiRuntime` set to Node.js 20
   - Cache rules: long cache for `/_next/static/`, short for HTML

2. **`.github/workflows/azure-static-web-apps.yml`** — GitHub Actions CI/CD workflow:
   - Trigger on push to `main` and PRs to `main`
   - Uses `Azure/static-web-apps-deploy@v1`
   - `app_location: "/"`, `output_location: ".next"`
   - The `AZURE_STATIC_WEB_APPS_API_TOKEN` comes from repo secrets
   - Include a build step that runs `npm ci && npm run build` before deploy
   - Add a step for `npm run build` type-check verification

3. **Update `next.config.ts`**:
   - Ensure `output: "standalone"` is NOT set (SWA uses default Next.js output)
   - Verify the config is compatible with Azure SWA deployment

4. **`www` redirect**: Add a redirect rule in `staticwebapp.config.json` from `www.anote.cz` to `anote.cz`

5. **Environment variables documentation**: Create or update a `.env.example` file listing all required env vars:
   - `CONTACT_EMAIL_TO` — recipient for contact form
   - `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` — for future email sending
   - Any analytics-related env vars from Phase 2.2

**Reference:** `LANDING_PAGE_SPEC.md` §12.2–12.5 for Azure SWA details, deployment commands, and cost estimates.

**Important notes:**
- Do NOT actually run `az` CLI commands — just set up the config files and CI/CD workflow
- The Azure resource creation (resource group, SWA resource) will be done manually via Azure Portal or CLI
- Keep it compatible with SWA Free tier ($0/month, 100 GB bandwidth)
- Region: West Europe

---

### Phase 2.2 — Privacy-Friendly Analytics

Integrate **Plausible Analytics** (cloud-hosted or self-hosted) into the site. Plausible is chosen because it's privacy-friendly (no cookies → no cookie banner), GDPR-compliant, and aligns with ANOTE's privacy-first branding.

**Deliverables:**

1. **Analytics provider component** (`src/components/analytics/PlausibleProvider.tsx`):
   - Use `next/script` with `strategy="afterInteractive"` to load the Plausible script
   - Domain configured via env var `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` (e.g., `anote.cz`)
   - Optional self-hosted URL via `NEXT_PUBLIC_PLAUSIBLE_HOST` (defaults to `https://plausible.io`)
   - Include the component in `src/app/[lang]/layout.tsx`

2. **Custom event tracking utility** (`src/lib/analytics.ts`):
   - Export a `trackEvent(name: string, props?: Record<string, string>)` function
   - Use `window.plausible` API (with type declaration for TypeScript)
   - No-op gracefully if Plausible is not loaded (dev mode, ad blockers)
   - Events to support (from spec §14.2):

     | Event | Trigger |
     |-------|---------|
     | `cta_click_hero` | Hero CTA button click |
     | `cta_click_nav` | Nav CTA button click |
     | `video_play` | Demo video play button |
     | `video_complete` | Demo video finishes |
     | `faq_expand` | FAQ question opened |
     | `form_start` | First form field focused |
     | `form_submit` | Form successfully submitted |
     | `form_error` | Form validation error |
     | `visit_type_click` | Visit type card clicked |
     | `report_section_expand` | Report showcase section opened |
     | `language_toggle` | CZ/EN toggle clicked |

3. **Integrate tracking calls into existing components**:
   - `Hero.tsx` — track `cta_click_hero` on primary CTA button click
   - `Navbar.tsx` — track `cta_click_nav` on nav CTA button, `language_toggle` on locale switch
   - `DemoVideo.tsx` — track `video_play` on play button click
   - `FAQ.tsx` — track `faq_expand` when accordion item opens (pass question title as prop)
   - `BottomCTA.tsx` — track `form_start` on first field focus, `form_submit` on success, `form_error` on validation failure
   - `VisitTypes.tsx` — track `visit_type_click` on card click (pass type name as prop)
   - `ReportShowcase.tsx` — track `report_section_expand` on accordion open (pass section title as prop)

4. **UTM parameter tracking**: Plausible handles UTM parameters automatically — verify it works by documenting example URLs:
   - `https://anote.cz?utm_source=linkedin&utm_medium=social&utm_campaign=launch`
   - `https://anote.cz/en?utm_source=conference&utm_medium=qr&utm_campaign=medica2026`

5. **Update `.env.example`** with:
   - `NEXT_PUBLIC_PLAUSIBLE_DOMAIN=anote.cz`
   - `NEXT_PUBLIC_PLAUSIBLE_HOST=https://plausible.io` (optional, for self-hosted)

**Reference:** `LANDING_PAGE_SPEC.md` §14 for full analytics spec.

**Important notes:**
- Components that call `trackEvent` are `"use client"` components — all the section components already have this directive
- The `trackEvent` function should work both in CSR and be safely importable in SSR (guard with `typeof window !== "undefined"`)
- Do NOT add a cookie banner — Plausible doesn't use cookies
- The Plausible cloud script is `https://plausible.io/js/script.js` — use the custom events extension: `https://plausible.io/js/script.tagged-events.js` or the `data-api` attribute

---

## After Implementation

1. Run `npm run build` and verify clean build with no errors
2. Update `IMPLEMENTATION_PLAN.md` — mark all Phase 2.1 and 2.2 items as `[x]`
3. Summarize what was done and any manual steps remaining (Azure resource creation, DNS configuration, Plausible account setup)
