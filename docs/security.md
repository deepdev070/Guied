# Security Checklist & Hardening Guide

This document outlines the security architecture and hardening measures implemented across the **India Paperwork Guide** web portal and mobile applications to safeguard citizen privacy and portal integrity.

---

## 1. Security Headers & Content Security Policy (CSP)

Configured at edge / reverse proxy via `next.config.ts`:

- **Content-Security-Policy (CSP)**:
  - `default-src 'self'`
  - `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://*.googlesyndication.com https://*.google.com https://*.googletagmanager.com https://*.google-analytics.com https://*.sentry.io`
  - `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`
  - `img-src 'self' data: blob: https: *.gov.in *.nic.in https://pagead2.googlesyndication.com`
  - `connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://pagead2.googlesyndication.com https://*.sentry.io https://*.ingest.sentry.io`
  - `frame-src 'self' https://googleads.g.doubleclick.net https://*.googlesyndication.com`
  - `frame-ancestors 'none'` (prevents framing & clickjacking)
  - `form-action 'self'`
  - `object-src 'none'`
  - `base-uri 'self'`
  - `upgrade-insecure-requests`
- **HSTS (HTTP Strict Transport Security)**:
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- **MIME Sniffing Prevention**:
  - `X-Content-Type-Options: nosniff`
- **Referrer Policy**:
  - `Referrer-Policy: strict-origin-when-cross-origin`
- **Permissions Policy**:
  - `Permissions-Policy: camera=(), microphone=(), geolocation=(), browsing-topics=()`
- **Clickjacking Protection**:
  - `X-Frame-Options: DENY`

---

## 2. Input Sanitisation & Safe URL Handling

Implemented in `src/lib/sanitize.ts`:

- **Text Inputs (`sanitizeText`)**:
  - Strips `<script>` tags, inline event handlers, and HTML markup.
  - Removes non-printable control characters (`\x00-\x1F\x7F`) and zero-width spaces (`\u200B-\u200D\uFEFF`).
- **Email Inputs (`sanitizeEmail`)**:
  - Trims, lowercases, and enforces RFC-compliant relaxed email regex validation.
- **URL Sanitisation (`sanitizeUrl`, `isSafeUrl`)**:
  - Strictly restricts protocols to `http:` and `https:` (and relative paths `/...`).
  - Blocks `javascript:`, `data:`, `vbscript:`, `file:`, `blob:`.
- **External Links (`getSafeExternalLinkProps`)**:
  - All external hyperlinks to official government portals (`.gov.in`, `.nic.in`) mandate:
    ```html
    <a href="..." target="_blank" rel="noopener noreferrer"></a>
    ```
  - Prevents reverse tab-nabbing (`window.opener` exploits).

---

## 3. Rate Limiting

Implemented via in-memory sliding window algorithm (`src/lib/rate-limiter.ts`):

- **Error Reports & Feedback**:
  - Limit: 5 requests per 60 seconds per IP on `/api/report-mistake`.
  - Limit: 10 requests per 60 seconds per IP on `/api/page-feedback`.
  - Honeypot form field (`honeypot`) traps automated spam bots silently.
- **Admin Authentication**:
  - Limit: 5 login attempts per 15 minutes per IP on `/api/admin/login`.
  - Brute force protection returns HTTP 429 with remaining retry duration.

---

## 4. Authentication & CSRF Hardening

- **Session Tokens**:
  - HMAC-SHA256 encrypted stateless session tokens.
  - Stored in `HttpOnly`, `SameSite=Lax`, `Secure` (production) cookies.
- **CSRF Token Validation**:
  - Double-submit CSRF cookie token required on state-mutating requests (`POST`, `PUT`, `DELETE`).
- **Timing-Safe Credential Verification**:
  - Constant-time string comparison (`crypto.timingSafeEqual`) prevents timing attack side-channels.

---

## 5. Citizen Privacy & DPDP Act 2023 Compliance

- **Zero PII Storage**:
  - No Aadhaar numbers, PAN cards, passport numbers, voter IDs, or uploaded identity scans are ever requested, processed, or persisted.
  - Personalisation wizard choices (age, vehicle type) are stored strictly in client-side `localStorage` or React Native `AsyncStorage`.
- **Telemetry & Analytics Scrubbing**:
  - Google Analytics configured with IP anonymization (`anonymize_ip: true`).
  - Sentry configured with sensitive field scrubbing before transmission.

---

## 6. Dependency & Secrets Management

- **Secrets Policy**:
  - Zero plain-text credentials or API secrets in Git history.
  - `.env` and `.env.local` are explicitly ignored in `.gitignore`.
  - Runtime validation verifies presence of `ADMIN_SESSION_SECRET` in production.
- **Dependency Audit**:
  - Run `npm audit` prior to each production release.
  - Automated Renovate / Dependabot dependency updates with lockfile integrity checks (`package-lock.json`).

---

## 7. Pre-Deployment Security Checklist

Before deploying any version to production:

- [x] Security headers validated in HTTP response (CSP, HSTS, X-Content-Type-Options, Referrer-Policy).
- [x] All external links verified with `rel="noopener noreferrer"`.
- [x] Input sanitisation active on all form and feedback endpoints.
- [x] Rate limiting active on authentication and feedback endpoints.
- [x] Honeypot fields present on public submission forms.
- [x] No sensitive files or `.env` files tracked in git (`git ls-files | grep .env`).
- [x] Unit test suite covering security helpers passes (`npm test`).
