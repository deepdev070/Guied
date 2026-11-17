# Error Monitoring Architecture (Prompt 135)

This document details the Sentry integration and error monitoring strategy for **India Paperwork Guide** across both Web and Mobile platforms.

---

## 1. Sentry Free-Tier Quota & Budgets

The system operates strictly within Sentry's free developer tier:

- **Error Budget**: 5,000 errors / month
- **Performance Transactions**: 10,000 transactions / month
- **Tracing Sample Rate**:
  - Development: `1.0` (100% traces for local debugging)
  - Production: `0.1` (10% sampling to prevent quota exhaustion)

---

## 2. Release Tagging & Source Maps

- **Release Tag**: Synchronized with `NEXT_PUBLIC_APP_VERSION` (default `0.1.0` for web, `v0.1.0-mobile` for Expo).
- **Source Maps**: `productionBrowserSourceMaps: true` is enabled in `next.config.ts` to allow stack trace symbolication without leaking secrets.

---

## 3. Strict Citizen PII Scrubbing

To comply with the Digital Personal Data Protection Act (DPDP Act 2023) and protect citizen privacy, all errors and breadcrumbs pass through `beforeSendScrubber` (`src/lib/sentry.ts`) prior to network transmission:

| Data Type           | Identifying Pattern              | Sanitized Value        |
| ------------------- | -------------------------------- | ---------------------- |
| **Aadhaar Number**  | `\b\d{4}[ -]?\d{4}[ -]?\d{4}\b`  | `[REDACTED_AADHAAR]`   |
| **PAN Card**        | `\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b`   | `[REDACTED_PAN]`       |
| **Mobile Number**   | `\b(?:\+91\|91)?[6-9]\d{9}\b`    | `[REDACTED_PHONE]`     |
| **Email Address**   | Standard RFC regex               | `[REDACTED_EMAIL]`     |
| **Passport Number** | `\b[A-PR-WYa-pr-wy][1-9]\d{6}\b` | `[REDACTED_PASSPORT]`  |
| **User IP Address** | Any incoming IP                  | Stripped / `undefined` |

---

## 4. Test Error Route

- Endpoint: `/api/test-error`
- Availability:
  - **Development Mode**: Accessible; emits synthetic test exception with mock citizen identifiers to verify real-time scrubbing in Sentry.
  - **Production Mode**: Returns `404 Not Found` (unless authorized via internal bypass header `x-test-error-bypass`).
