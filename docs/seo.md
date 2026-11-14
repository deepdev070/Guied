# India Paperwork Guide — SEO Architecture & URL Standards

This document specifies the Search Engine Optimization (SEO) standards, URL architecture, canonical rules, redirect matrices, and duplicate-content mitigation strategies implemented across the **India Paperwork Guide** civic portal.

---

## 1. URL Architecture & Naming Conventions

All URLs on `indiapaperworkguide.in` strictly adhere to the following principles:

1. **Strictly Lowercase**: URLs never contain uppercase characters (`/passport-renewal`, never `/Passport-Renewal`).
2. **Kebab-Case (Hyphenated)**: Words are separated only by hyphens (`-`). No underscores (`_`), spaces, plus signs (`+`), or camelCase.
3. **No Trailing Slashes**: Configured via `trailingSlash: false` in `next.config.ts`. Any incoming request to `/path/` is automatically redirected to `/path` via a `308 Permanent Redirect`.
4. **No File Extensions**: No `.html`, `.php`, or `.jsp` suffixes.
5. **Clean Semantic Hierarchy**:

| Route Pattern      | Example URL                                                      | Purpose                               |
| :----------------- | :--------------------------------------------------------------- | :------------------------------------ |
| `/`                | `https://indiapaperworkguide.in`                                 | National portal home & search         |
| `/[task]`          | `https://indiapaperworkguide.in/passport-renewal`                | National baseline paperwork guide     |
| `/[task]/[state]`  | `https://indiapaperworkguide.in/driving-licence-learner/gujarat` | State-localized paperwork guide       |
| `/category/[slug]` | `https://indiapaperworkguide.in/category/vehicles`               | Category service hub                  |
| `/state/[slug]`    | `https://indiapaperworkguide.in/state/gujarat`                   | State-wide civic service hub          |
| `/glossary`        | `https://indiapaperworkguide.in/glossary`                        | Trilingual civic paperwork glossary   |
| `/glossary/[term]` | `https://indiapaperworkguide.in/glossary/affidavit`              | Individual civic term definition page |
| `/my-checklists`   | `https://indiapaperworkguide.in/my-checklists`                   | Client-side user document dashboard   |
| `/how-we-verify`   | `https://indiapaperworkguide.in/how-we-verify`                   | Editorial verification methodology    |

---

## 2. Redirects & Alias Matrix (`next.config.ts`)

To avoid 404 errors, consolidate search engine link equity, and assist citizens with common spelling variations (e.g., American English _"license"_ vs. Indian/British English _"licence"_), permanent 308 redirects are maintained in `src/lib/redirects.ts` and configured in `next.config.ts`.

### Common Misspellings & Legacy Aliases

- `/passport` &rarr; `/passport-renewal`
- `/passports` &rarr; `/passport-renewal`
- `/passport-apply` &rarr; `/passport-renewal`
- `/driving-licence` &rarr; `/driving-licence-learner`
- `/driving-license` &rarr; `/driving-licence-learner`
- `/driving-license-learner` &rarr; `/driving-licence-learner`
- `/driving-license-new` &rarr; `/driving-licence-new`
- `/dl-learner` &rarr; `/driving-licence-learner`
- `/learner-license` &rarr; `/driving-licence-learner`
- `/learner-licence` &rarr; `/driving-licence-learner`
- `/new-dl` &rarr; `/driving-licence-new`
- `/permanent-dl` &rarr; `/driving-licence-new`

### Category Aliases

- `/category/identity-documents` &rarr; `/category/identity`
- `/category/vehicle-services` &rarr; `/category/vehicles`
- `/categories` &rarr; `/`
- `/states` &rarr; `/`

### 2-Letter State Code Shortcuts

Short state code slugs automatically redirect to full canonical state names:

- `/:task/gj` &rarr; `/:task/gujarat`
- `/:task/mh` &rarr; `/:task/maharashtra`
- `/:task/dl` &rarr; `/:task/delhi`
- `/:task/ka` &rarr; `/:task/karnataka`
- `/:task/rj` &rarr; `/:task/rajasthan`
- `/:task/up` &rarr; `/:task/uttar-pradesh`
- `/:task/mp` &rarr; `/:task/madhya-pradesh`
- `/state/gj` &rarr; `/state/gujarat` (and all other state hubs)

---

## 3. Canonical URLs & Hreflang Alternates

1. **Self-Referencing Canonicals**:
   - Every page outputs its own absolute canonical URL:
     `https://indiapaperworkguide.in/${path}`
   - Canonical tags prevent query parameter fragmentation (e.g. tracking parameters `?utm_source=whatsapp` do not create duplicate URLs).

2. **Hreflang Multi-Language Alternates**:
   Each guide outputs valid `<link rel="alternate" hreflang="..." />` tags for:
   - `en`: Canonical English version (`https://indiapaperworkguide.in/passport-renewal`)
   - `hi`: Hindi translation (`https://indiapaperworkguide.in/passport-renewal?lang=hi`)
   - `gu`: Gujarati translation (`https://indiapaperworkguide.in/passport-renewal?lang=gu`)
   - `x-default`: Fallback English canonical version

---

## 4. Duplicate Content Prevention & `noindex` Policy

A central challenge in state-level civic portals is that some procedures (e.g. Passport Renewal) are governed by the central Ministry of External Affairs and do not vary significantly between states, whereas other procedures (e.g. Learner's Licence in Gujarat with computer-based online LL test exemptions) have genuine statutory state differences.

To protect the portal from Google "thin content" or "duplicate content" penalties:

- **National Tasks (`/[task]`)**: Always set to `robots: { index: true, follow: true }`.
- **State Overridden Guides (`/[task]/[state]` with unique local rules)**: Set to `robots: { index: true, follow: true }`.
- **Verbatim State Copies (`/[task]/[state]` with no state override)**: Set to `robots: { index: false, follow: true }`.
  - Search crawlers still follow all links on the page (`follow: true`), but do not index duplicate pages.
  - This ensures search engine crawl budget is spent exclusively on high-value, unique content.

A unit test in `tests/canonical-duplicate-control.test.ts` audits and asserts the exact list of all noindexed pages.

---

## 5. Structured Data (JSON-LD Schema.org)

Every guide renders type-safe JSON-LD structured data via `<JsonLd>`:

- **Organization**: Site branding, logo, and official identity.
- **WebSite with SearchAction**: Enables Google Sitelinks Searchbox (`/?q={search_term_string}`).
- **BreadcrumbList**: Hierarchical navigation chain (`Home` &rarr; `Category` &rarr; `Task` &rarr; `State`).
- **HowTo**: Procedure steps with statutory fees (`MonetaryAmount`), estimated completion time, and official URLs. _Crucial rule: Only emitted when steps are visibly rendered on the page._
- **FAQPage**: Verified citizen frequently asked questions and official answers. _Crucial rule: Only emitted when FAQs are visibly rendered on the page._

---

## 6. Sitemaps & Robots (`app/sitemap.ts`, `app/robots.ts`)

- **Sitemap (`/sitemap.xml`)**:
  - Dynamically builds entries for home, all categories, all states, all published tasks, task+state pairs, and glossary terms.
  - `lastModified` is populated from the actual government verification timestamp `lastVerifiedAt`.
  - Automatically splits into multiple sitemaps if total URLs exceed 5,000.
- **Robots (`/robots.txt`)**:
  - Allows search crawlers across all public guide routes (`Allow: /`).
  - Disallows internal administrative and utility routes: `/admin`, `/api/`, `/design`, `/my-checklists`, and parameterized search results (`/search?*`).

---

## 7. Internal Link Mesh & Orphan Page Prevention

Every guide page is integrated into a multi-dimensional internal link mesh:

1. **Vertical Hierarchy**: Links up to category hub and national task page.
2. **Horizontal Proximity**: Links to the same procedure across neighboring states via `NearbyStatesSection` (e.g. Gujarat links to Rajasthan, Maharashtra, Madhya Pradesh).
3. **Sequential Journey**: Links to next regulatory steps via `TaskJourney` (e.g. Learner DL &rarr; Permanent DL).
4. **Related Demand**: Links to top tasks in the same category via `RelatedTasks`.
5. **State Service Hub**: Links to other popular services within the same state via `PopularInStateBlock`.
6. **Civic Glossary**: Automated regex tooltips linking civic terms (_Affidavit_, _Tatkal_, _Notary_, _Annexure_) directly to `/glossary/[term]`.

An automated audit script (`npm run seo:orphans`) validates that **0 orphan pages** exist across the entire domain.
