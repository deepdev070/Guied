# Domain, SSL, and Business Email Setup Guide (Prompt 137)

This step-by-step operational guide explains how to purchase your civic domain, point DNS to Vercel, enforce SSL with canonical redirects, configure a free `contact@` business email alias, and verify indexing in Google Search Console and Bing Webmaster Tools.

---

## 1. Buying the Domain (`indiapaperwork.in`)

### Recommended Registrars

For `.in` country-code top-level domains (managed by NIXI / INRegistry):

- **Cloudflare Registrar**: Wholesale pricing (~₹450-₹550/year), free WHOIS privacy, zero markup.
- **Dynadot / Namecheap**: Accredited registrar, easy DNS dashboard, free privacy protection.
- **GoDaddy / BigRock**: Widely used in India; ensure you uncheck add-on hosting and privacy fees before checkout.

### Purchase Checklist

1. Search for domain: `indiapaperwork.in` (and optionally `indiapaperworkguide.in` as an alias).
2. Choose a 1-year or 2-year registration period.
3. Ensure contact details (name, email, phone) are valid to comply with NIXI registry validation rules.
4. Set **Auto-Renewal** to ON so the civic portal domain never expires unexpectedly.

---

## 2. Pointing DNS to Vercel

If managing DNS at your registrar or Cloudflare, configure the following DNS records:

| Record Type | Name / Host | Target / Value          | TTL          | Purpose                                                       |
| ----------- | ----------- | ----------------------- | ------------ | ------------------------------------------------------------- |
| **A**       | `@` (apex)  | `76.76.21.21`           | 300s (5 min) | Points root domain `indiapaperwork.in` to Vercel Anycast edge |
| **CNAME**   | `www`       | `cname.vercel-dns.com.` | 300s (5 min) | Points `www.indiapaperwork.in` to Vercel edge                 |

> [!NOTE]
> If using Cloudflare for DNS management:
>
> - Set Proxy status to **DNS only (Grey Cloud)** for the initial SSL verification handshake with Vercel.
> - Once Vercel issues the certificate, you may enable Cloudflare Proxy (Orange Cloud) with SSL mode set to **Full (Strict)**.

---

## 3. SSL Certificate & Canonical Redirects

### Automatic SSL Issuance

1. In Vercel Project Dashboard, navigate to **Settings > Domains**.
2. Add both domains:
   - `indiapaperwork.in`
   - `www.indiapaperwork.in`
3. Vercel automatically requests and validates a free Let's Encrypt / DigiCert certificate for both names.

### Canonical WWW to Non-WWW 308 Redirect

To consolidate search ranking equity (PageRank) and prevent duplicate content penalties:

1. In Vercel Domains tab, edit `www.indiapaperwork.in`.
2. Select **Redirect to indiapaperwork.in**.
3. Set **Status Code**: `308 Permanent Redirect`.
4. Our site configuration (`next.config.ts`) also injects the HTTP Strict Transport Security (HSTS) header:
   ```http
   Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
   ```

---

## 4. Free Business Email Alias (`contact@indiapaperwork.in`)

Citizens and government portal officers need a professional way to email `contact@indiapaperwork.in` without paying \$6/user/month for Google Workspace.

### Method: Cloudflare Email Routing (100% Free Forever)

1. In Cloudflare Dashboard, open `indiapaperwork.in` > **Email Routing**.
2. Enable Email Routing and define destination address: your personal email (e.g. `yourname@gmail.com`).
3. Add Custom Address:
   - **Custom address**: `contact`
   - **Action**: Send to `yourname@gmail.com`
4. Cloudflare will automatically add the required DNS records:

#### MX Records

| Priority | Name | Mail Server                |
| -------- | ---- | -------------------------- |
| `13`     | `@`  | `route1.mx.cloudflare.net` |
| `43`     | `@`  | `route2.mx.cloudflare.net` |
| `98`     | `@`  | `route3.mx.cloudflare.net` |

#### SPF Record (TXT)

- **Name**: `@`
- **Value**: `v=spf1 include:_spf.mx.cloudflare.net ~all`

#### DMARC Record (TXT)

- **Name**: `_dmarc`
- **Value**: `v=DMARC1; p=none; sp=none; rua=mailto:contact@indiapaperwork.in`

### Sending Outbound Replies from Gmail

To reply directly as `contact@indiapaperwork.in` from Gmail:

1. Create a free **Brevo (formerly Sendinblue)** or **Resend** account (free tier allows 300 emails/day).
2. Verify domain `indiapaperwork.in` and generate an SMTP Key.
3. In Gmail: **Settings > Accounts and Import > Send mail as > Add another email address**.
4. Enter Name: "India Paperwork Guide", Email: `contact@indiapaperwork.in`.
5. Enter Brevo SMTP server (`smtp-relay.brevo.com`, port 587), your Brevo login, and SMTP master key.
6. Verify confirmation code. You can now compose and reply as `contact@indiapaperwork.in` directly inside Gmail.

---

## 5. Google Search Console (GSC) Verification

1. Go to [Google Search Console](https://search.google.com/search-console).
2. Select **Domain** property (left box) and enter `indiapaperwork.in`.
3. Copy the TXT verification code provided by Google:
   - Record Type: `TXT`
   - Host / Name: `@`
   - Value: `google-site-verification=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`
4. Add the TXT record in your domain's DNS manager.
5. Click **Verify**. GSC verifies domain ownership for all subdomains and protocol variants (`http`, `https`, `www`, non-`www`).
6. **Submit XML Sitemap**:
   - Go to **Sitemaps** in the left sidebar.
   - Enter `sitemap.xml` (full URL: `https://indiapaperwork.in/sitemap.xml`).
   - Click **Submit**. Google will crawl all civic category and task URLs.

---

## 6. Bing Webmaster Tools Verification

1. Go to [Bing Webmaster Tools](https://www.bing.com/webmasters).
2. Click **Import from Google Search Console** (fastest, zero manual DNS configuration required).
3. Sign in with the same Google account; Bing automatically syncs verified ownership, site settings, and sitemaps.
4. Alternatively, use manual DNS verification:
   - Add CNAME record: `XXXXXXXXXXXXX.indiapaperwork.in` -> `verify.bing.com`.
5. Verify sitemap `https://indiapaperwork.in/sitemap.xml` is listed under Sitemaps.
