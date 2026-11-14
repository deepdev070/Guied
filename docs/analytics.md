# Privacy Analytics & Google Search Console Guide

This guide details the privacy-first analytics setup, custom civic events, Google Search Console (GSC) verification, and step-by-step sitemap submission instructions for **India Paperwork Guide** (Prompt 82).

---

## 1. Analytics Solution Proposal: Plausible vs. GA4

We propose and implement **Plausible Analytics** as the primary analytics solution, with a dual-mode fallback to **Google Analytics 4 (GA4)** behind consent:

| Feature                    | Plausible Analytics (Recommended)                    | Google Analytics 4 (GA4)                     |
| :------------------------- | :--------------------------------------------------- | :------------------------------------------- |
| **Data Privacy**           | 100% compliant with India's DPDP Act 2023 & GDPR     | Requires cookie consent banner & user opt-in |
| **Cookies / Storage**      | Zero cookies, zero persistent device identifiers     | Uses `_ga` cookies & client tracking IDs     |
| **Script Payload**         | `< 1 KB` (Ultra-lightweight)                         | `~45 KB` (Heavier JS execution)              |
| **Core Web Vitals Impact** | **0ms** TBT impact; keeps LCP < 2.5s and INP < 200ms | Can increase INP/TBT on low-tier smartphones |
| **Do Not Track**           | Automatically respects browser `DNT: 1` header       | Requires manual consent state mapping        |

### How to Configure

- **Plausible**: Set `NEXT_PUBLIC_PLAUSIBLE_DOMAIN="indiapaperworkguide.in"` in `.env.local`.
- **GA4**: Set `NEXT_PUBLIC_ANALYTICS_ID="G-XXXXXXXXXX"` in `.env.local`. When enabled, GA4 initializes with Consent Mode v2 default `denied` for advertising storage to protect citizen privacy.

---

## 2. Tracked Civic Events Reference

The analytics client (`src/lib/analytics.ts`) tracks standard citizen interactions without collecting Personally Identifiable Information (PII):

| Event Name           | Trigger                                 | Properties                                   | Purpose                                               |
| :------------------- | :-------------------------------------- | :------------------------------------------- | :---------------------------------------------------- |
| `page_view`          | Page load / route transition            | `path`, `title`                              | Measures page popularity and SEO landing distribution |
| `search_query`       | Autocomplete or search submission       | `query`, `results_count`, `state`            | Identifies missing paperwork guides and user demand   |
| `checklist_start`    | Citizen checks their first document     | `task_slug`, `state_slug`                    | Measures intent and user onboarding rate              |
| `checklist_complete` | Citizen checks all required documents   | `task_slug`, `state_slug`, `total_documents` | Measures successful civic task preparation            |
| `share_click`        | WhatsApp, Telegram, WebShare, Copy Link | `platform`, `task_slug`, `state_slug`        | Tracks viral word-of-mouth referral channels          |
| `pdf_download`       | Citizen downloads printable checklist   | `task_slug`, `state_slug`                    | Measures offline utility and print-ready conversions  |
| `ad_slot_impression` | Ad slot mounts into view                | `slot_id`, `format`, `placement`             | Validates ad viewability and monetization readiness   |

---

## 3. Google Search Console Verification

Google Search Console (GSC) is essential for monitoring organic Google Search rankings, index coverage, and Core Web Vitals.

### Verification via HTML Meta Tag

1. Open [Google Search Console](https://search.google.com/search-console).
2. Click **Add Property** and select **URL prefix**: `https://indiapaperworkguide.in`.
3. In the verification options, choose **HTML tag**.
4. Copy the verification string (the value inside `content="XYZ"`).
5. Add the token to your environment variables in `.env.local` or hosting provider (e.g., Vercel):
   ```bash
   NEXT_PUBLIC_GSC_VERIFICATION="your-verification-code-here"
   ```
6. Deploy the change. The application automatically injects:
   ```html
   <meta name="google-site-verification" content="your-verification-code-here" />
   ```
7. Return to Google Search Console and click **Verify**.

---

## 4. Step-by-Step Sitemap Submission Guide

Once your domain is verified in Google Search Console, submit the dynamic XML sitemap to ensure all 190+ pages are crawled and indexed.

### Step 1: Locate the Sitemap Endpoint

- Primary sitemap index: `https://indiapaperworkguide.in/sitemap.xml`
- The application automatically generates entries for all published tasks, all 36 state variants, 8 category hubs, 36 state hubs, glossary terms, and static legal/verification pages.

### Step 2: Submit in Google Search Console

1. In the Google Search Console left-hand sidebar, click on **Indexing** > **Sitemaps**.
2. Under **Add a new sitemap**, enter the path:
   ```
   sitemap.xml
   ```
3. Click **Submit**.
4. GSC will display **"Sitemap submitted successfully"**.

### Step 3: Monitor Crawl Status & Coverage

1. **Status**: Wait 24 to 48 hours for the status to change from _"Processing"_ to **"Success"**.
2. **Discovered Pages**: Verify that discovered page counts reflect all indexed routes (`~190+` URLs).
3. **Inspect URL**: Use the top search bar in Search Console to inspect priority high-traffic URLs:
   - `https://indiapaperworkguide.in/driving-licence-learner/gujarat`
   - `https://indiapaperworkguide.in/passport-renewal`
4. Click **Request Indexing** on key pages to expedite initial Google crawler discovery.
