# `src/app/` — Routing & Pages

This folder contains the Next.js App Router route hierarchy:

- **Root Layout & Error Handling:** `layout.tsx`, `not-found.tsx`, `error.tsx`, `loading.tsx`.
- **Top-Level Pages:** Homepage (`page.tsx`), static informational pages (about, disclaimer, privacy policy).
- **Task & State Dynamic Routes:** Canonical SEO pages structured by task and state (e.g., `/[task]/[state]/page.tsx` for `/driving-licence/maharashtra`).
- **API Route Handlers:** Server-side API endpoints (`api/` directory) serving web clients and future Expo/React Native apps.
