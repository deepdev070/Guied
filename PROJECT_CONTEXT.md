# PROJECT_CONTEXT.md: India Paperwork Guide

## 1. Product Overview

**India Paperwork Guide** is a free website and mobile app designed to help Indian citizens navigate everyday government paperwork (passport, driving licence, PAN, ration card, property registration, etc.) with clarity and confidence. It delivers exact checklists of required documents, step-by-step procedures, fee structures, and direct official portal links—personalized by task and state.

## 2. Core Goals

1. **Organic SEO Growth:** Maximize search traffic from Google through dedicated, high-intent SEO pages tailored per task and per state (e.g., `/driving-licence/maharashtra`, `/ration-card/delhi`).
2. **Gold Standard Clarity:** Provide the clearest, easiest-to-follow civic guide in India, removing bureaucracy jargon.
3. **Monetization Readiness:** Generate ad revenue sustainably by reserving and clearly labelling dedicated ad slots across all page layouts without compromising usability.

## 3. Design System & UX Rules

- **Theme:** **LIGHT THEME ONLY** (strict: never dark mode).
- **Color Palette:**
  - Surfaces: Clean white and soft blue-grey neutral backgrounds.
  - Primary: One strong, trustworthy blue.
  - Accent: Saffron accent for key highlights and badges.
  - Status/Feedback: Clear green for success, approvals, and verified statuses.
- **Typography & Readability:**
  - Minimum body font size: `16px`.
  - Readability: Plain language pitched at a Class 8 reading level. Avoid bureaucratic English and complex legal jargon.
- **Layout & Ergonomics:**
  - Mobile-first responsive design.
  - Generous spacing and padding.
  - Minimum touch/tap target size: `44px x 44px`.
  - Step-by-step numbering and clear visual hierarchy.
  - Icons paired with descriptive labels.

## 4. Technology Stack

- **Frontend / Framework:** Next.js (App Router), TypeScript, Tailwind CSS.
- **Database & ORM:** PostgreSQL with Prisma ORM.
- **Schema & Validation:** Zod schema validation for API inputs, server actions, and form handling.
- **Deployment & Hosting:** Vercel.
- **Roadmap:**
  - Phase 1: Next.js responsive web application.
  - Phase 2: Progressive Web App (PWA) capabilities for offline caching and fast mobile access.
  - Phase 3: Expo (React Native) mobile application consuming the shared Next.js backend API routes.

## 5. Content & Accuracy Rules

- **Fact-Checking & Integrity:** Never invent fees, processing timelines, criteria, or government rules.
- **Citations:** Every single fact, fee, and requirement must link to an official source URL and state a "Last Verified" date.
- **Fallback for Unconfirmed Data:** If any information cannot be authoritatively corroborated, explicitly mark it as `"NEEDS VERIFICATION"`—never guess.
- **Mandatory Disclaimer:** Every view must feature a prominent legal disclaimer:
  > _"This site is not an official government website and is not affiliated with, endorsed by, or associated with any government body or department."_

## 6. Engineering & Working Rules

- **Iterative Changes:** Make small, reviewable, self-contained changes.
- **Change Summaries:** Provide a concise 3-5 line explanation of changes after each task.
- **Verification:** Run type-check (`tsc --noEmit`) and linter (`eslint`) after each modification.
- **Dependency Discipline:** Do not install new third-party libraries or dependencies without explicit rationale and justification.
- **Accessibility & Quality:** Ensure all components are reusable, modular, semantic, and adhere strictly to WCAG AA accessibility standards.
