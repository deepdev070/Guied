# Progressive Web App (PWA) & Service Worker Architecture

## 1. Architectural Choice & Justification

The goal of the offline strategy for **India Paperwork Guide** is to provide resilient, instant citizen access to complex documentation checklists, required papers, and statutory fee schedules even on spotty 2G/3G mobile networks across rural and semi-urban India.

### Why not `next-pwa`?

1. **Outdated & Incompatible**: `next-pwa` was architected for Next.js Pages Router and relies on Webpack compiler hooks. Next.js 15+ and 16+ default to **Turbopack**, which does not support legacy Webpack compiler monkey-patches.
2. **Streaming App Router Incompatibility**: Next.js App Router utilizes React Server Components (RSC) with selective streaming (`_rsc` payloads). Heavy build-time wrappers like `next-pwa` frequently corrupt or miscache streaming payloads and server-rendered HTML.
3. **Bloat and Maintenance Risk**: The package is largely unmaintained, introducing external dependency vulnerabilities and build-time fragility.

### Why a Standalone Vanilla / Web-Standard Service Worker (`public/sw.js`)?

1. **Zero Build Interference**: Completely decoupled from Turbopack, SWC, and Next.js compiler toolchains.
2. **Explicit Cache Isolation**: We maintain strict program-level control over cache rules. Admin routes (`/admin/*`), admin APIs (`/api/admin/*`), and mutation endpoints (POST/PUT/PATCH/DELETE) are guaranteed to bypass caching with zero risk of misconfiguration.
3. **Stale-While-Revalidate (SWR)**: High-priority citizen guides and checklist pages serve instantly from cache if previously visited, while revalidating and refreshing silently in the background.
4. **Reliable Navigation Fallback**: If an uncached route is requested while offline, the browser catches the network failure and gracefully serves `/offline`.

---

## 2. Caching Strategies

| Resource Type                    | Pattern                                                      | Strategy                    | Behavior                                                                      |
| :------------------------------- | :----------------------------------------------------------- | :-------------------------- | :---------------------------------------------------------------------------- |
| **App Shell**                    | `/offline`, `/my-checklists`, `/manifest.webmanifest`, icons | **Cache-First / Precached** | Downloaded during Service Worker install; guaranteed available offline.       |
| **Opened Guides & Checklists**   | `/[task]`, `/[task]/[state]`, `/hi/*`, `/gu/*`, categories   | **Stale-While-Revalidate**  | Instant cache response, background fetch to refresh cache with fresh content. |
| **Static Assets**                | `/_next/static/*`, `/fonts/*`, `/icons/*`, `.css`, `.js`     | **Stale-While-Revalidate**  | Cached on demand; serves instant assets without network latency.              |
| **Admin Pages & APIs**           | `/admin/*`, `/api/admin/*`                                   | **Network Only (NO CACHE)** | **NEVER cached**. Bypasses Service Worker cache completely.                   |
| **API Mutations**                | Non-GET requests (POST, PUT, DELETE, PATCH)                  | **Network Only (NO CACHE)** | Bypasses Service Worker cache completely.                                     |
| **Uncached Offline Navigations** | Any page not yet in cache                                    | **Fallback to `/offline`**  | Friendly civic guidance with access to saved local checklists.                |

---

## 3. Security & Admin Protection Invariants

Per civic portal security principles:

1. No administrative session, token, CSRF secret, or moderation report is ever written to CacheStorage.
2. If an administrative user loses internet connection while on `/admin`, the browser displays standard network connection status rather than an outdated, vulnerable administrative cache.
