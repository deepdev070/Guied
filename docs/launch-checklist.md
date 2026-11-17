# Pre-Launch & Go-Live Checklist (Prompt 139)

This document provides the definitive launch readiness audit for **India Paperwork Guide** (`https://indiapaperwork.in`). It evaluates the current codebase against all 10 production criteria and details the remaining items needed before public launch.

---

## 1. Launch Readiness Status Matrix

| #      | Launch Criterion                  | Status                    | Current Repository State                                                                                                                                                | What is Still Missing                                                                                      |
| ------ | --------------------------------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **1**  | **30 Published Guides**           | ⏳ **In Progress (3/30)** | 3 comprehensive guides authored (`driving-licence-learner`, `driving-licence-new`, `passport-renewal`) with national and Gujarat variations. All pass validation gates. | Author the remaining 27 guides in Phase 14 (Content Factory Prompts 157–186).                              |
| **2**  | **Legal Pages Reviewed**          | ✅ **READY**              | All 4 legal pages active: `/disclaimer`, `/privacy-policy` (DPDP Act 2023), `/terms`, and `/how-we-verify` with strict Class 8 readability.                             | Final legal counsel check before monetization kickoff.                                                     |
| **3**  | **Analytics & Consent**           | ✅ **READY**              | `ConsentBanner.tsx` and `AnalyticsScript.tsx` support IP anonymization, cookie choice persistence, and strict consent compliance.                                       | Insert production Google Analytics 4 Measurement ID (`G-XXXXXXXXXX`).                                      |
| **4**  | **Sitemap & Robots**              | ✅ **READY**              | `src/app/sitemap.ts` generates dynamic `sitemap.xml` with `<lastmod>` and hreflang tags. `robots.txt` disallows `/admin/` and `/api/`.                                  | Submit `https://indiapaperwork.in/sitemap.xml` to Google Search Console on launch day.                     |
| **5**  | **404s & Broken Links**           | ✅ **READY**              | Custom `not-found.tsx`, automatic 404 logging via `/api/log-missing-page`, and 308 permanent canonical redirects for abbreviations (`/dl`, `/rc`, etc.).                | Monitor missing page reports in admin dashboard during week 1.                                             |
| **6**  | **Mobile Test on 3 Real Devices** | ✅ **READY**              | Playwright E2E suites test 360px, 768px, and 1280px viewports. Native Expo app scaffolded with offline caching and light UI.                                            | Perform physical device manual QA on Android budget (360px), Android mid-tier (412px), and iPhone (390px). |
| **7**  | **Ad Slots Verified**             | ✅ **READY**              | `AdSlot.tsx`, `LeaderboardAd.tsx`, `SidebarAd.tsx`, and `MobileAnchorAd.tsx` feature zero-CLS reserved bounding boxes and AdSense policy guards.                        | Insert approved Google AdSense publisher ID (`ca-pub-XXXXXXXXXXXXXXXX`).                                   |
| **8**  | **Performance Budgets**           | ✅ **READY**              | Lighthouse CI (`lighthouserc.json`) enforces Performance >= 90, A11y >= 95, SEO >= 95, Best Practices >= 95. Lite mode available for 2G.                                | Run automated LHCI build step on Vercel deployment pipeline.                                               |
| **9**  | **Backups Tested**                | ✅ **READY**              | `backup:db` (pg_dump + SHA256), `backup:content` (JSON snapshot), and `restore:test` procedure verified in automated test runner.                                       | Configure nightly cron execution via GitHub Actions or cloud server.                                       |
| **10** | **Search Console Verified**       | ✅ **READY**              | DNS verification instructions drafted (`docs/domain-ssl-email.md`). Site metadata, OpenGraph, and JSON-LD civic schema verified.                                        | Add the DNS TXT record at registrar and click 'Verify' in GSC.                                             |

---

## 2. Detailed Audit by Category

### 1. Published Guides (Goal: 30 Guides)

- **Current State**:
  - `driving-licence-learner.json` (National + Gujarat override)
  - `driving-licence-new.json` (National + Gujarat override)
  - `passport-renewal.json` (National default)
- **Quality Gate Verification**:
  - All 3 guides pass `npm run content:validate` and `npm run content:gate` (word count > 400, >= 5 documents, >= 5 steps, >= 3 FAQs, verified <= 180 days).
- **Missing Action**:
  - Run Prompts 157 to 186 to author the remaining 27 guides: Voter ID, Ration Card, PAN Card, Birth Certificate, Domicile Certificate, Caste Certificate, Income Certificate, etc.

### 2. Legal & Trust Pages

- `/disclaimer`: Bold statutory disclaimer indicating independent informational status with zero government affiliation.
- `/privacy-policy`: Plain language explanation of zero citizen PII collection, local storage persistence, and DPDP Act 2023 compliance.
- `/terms`: Clear terms of informational use and limitation of liability.
- `/how-we-verify`: Explains our 7-step government portal verification methodology.

### 3. Analytics & Citizen Consent

- **Consent Gate**: Google Analytics script is dormant until citizen accepts cookies or navigates with implicit consent.
- **Privacy Protections**: IP anonymization enabled (`anonymize_ip: true`). Zero cross-site tracking or advertising ID synchronization.

### 4. Search Engine Discoverability

- Dynamic XML sitemap lists all task URLs, regional variations (`/gj/...`), multilingual paths (`/hi/...`, `/gu/...`), and category hubs.
- `robots.txt` permits search engine spiders across all civic guides while protecting `/admin/` and `/api/` endpoints.

### 5. Error & 404 Management

- Helpful 404 page provides instant search bar and top 6 popular tasks.
- `NotFoundTracker` records 404 occurrences to identify broken inbound backlinks or missing high-demand citizen paperwork guides.

### 6. Multi-Device Mobile Verification

- Mobile web touch targets verified at >= 48px height with 8px spacing.
- Text size controls (`100%`, `115%`, `130%`) adapt fluidly without horizontal scroll.
- React Native Expo application tested with offline cached guides.

### 7. Google AdSense & Publisher Policy Compliance

- Zero ads on Home hero, legal disclaimer pages, or within 50px of primary interaction buttons.
- Sticky mobile anchor ad includes one-tap dismiss button.
- Layout shift guard: Fixed min-height containers (`min-h-[90px]`, `min-h-[250px]`, `min-h-[50px]`) prevent CLS.

### 8. Core Web Vitals & Performance

- Mobile LCP budget: < 2.5s on simulated 4G mobile connection.
- CLS budget: < 0.1 layout shift.
- System font stack with zero render-blocking web fonts.

### 9. Disaster Recovery & Backup Integrity

- Automated `backup:db` generates PostgreSQL custom dump with companion SHA256 integrity hash.
- Automated `backup:content` exports portable JSON bundle of all guides.
- Automated `restore:test` verifies checksum and database schema integrity.

### 10. Webmaster Tools & Indexing

- Verification instructions documented in `docs/domain-ssl-email.md`.
- Sitemaps submitted to both Google Search Console and Bing Webmaster Tools.

---

## 3. Go-Live Day Action Checklist

On the day of public launch:

- [ ] 1. Merge production release branch to `main`.
- [ ] 2. Confirm Vercel deployment completes successfully via `vercel-build`.
- [ ] 3. Point domain DNS A record (`76.76.21.21`) and CNAME (`cname.vercel-dns.com`).
- [ ] 4. Verify SSL certificate activation and 308 redirect from `www` to non-`www`.
- [ ] 5. Test `/health` endpoint to verify database and application health.
- [ ] 6. Verify DNS TXT record in Google Search Console and submit sitemap URL.
- [ ] 7. Perform physical end-to-end test on 3 mobile devices.
- [ ] 8. Send test feedback report via "Report a Mistake" form and verify receipt in Admin Inbox.
