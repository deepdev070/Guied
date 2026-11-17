# Vercel Production Deployment Runbook (Prompt 136)

This runbook provides the complete step-by-step procedure for deploying the **India Paperwork Guide** monorepo to Vercel with automated database migrations, preview environments, and domain mapping.

---

## 1. Quick Setup & Architecture

- **Hosting Platform**: Vercel (Edge & Serverless Node.js 22 runtime)
- **Framework**: Next.js 16 (App Router)
- **Monorepo Engine**: Turborepo (`apps/web`, `apps/mobile`, `packages/types`, `packages/utils`)
- **Database**: Managed Serverless PostgreSQL (Neon, Supabase, or AWS RDS) with Prisma ORM
- **Target Domain**: `https://indiapaperwork.in` (with `www.` redirecting to apex)

---

## 2. Step-by-Step Vercel Setup

### Step 2.1: Import GitHub Repository

1. Log in to [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New...** > **Project**.
3. Select your GitHub repository: `India-Paperwork-Guide`.
4. Leave **Root Directory** as `.` (root of monorepo).
5. Framework Preset will auto-detect as **Next.js**.

### Step 2.2: Build and Output Settings

Under **Build and Output Settings**, verify:

- **Build Command**: `npm run vercel-build` (overrides default to run `prisma generate && prisma migrate deploy && turbo run build`)
- **Output Directory**: Next.js default (`.next`)
- **Install Command**: `npm install --legacy-peer-deps`

---

## 3. Environment Variables Checklist

Add the following environment variables in **Project Settings > Environment Variables**:

| Variable                        | Target Environments | Description                                     | Example / Format                                                                |
| ------------------------------- | ------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------- |
| `DATABASE_URL`                  | Production, Preview | PostgreSQL connection pool URL                  | `postgresql://user:pass@ep-xyz.neon.tech/neondb?sslmode=require&pgbouncer=true` |
| `DIRECT_URL`                    | Production, Preview | Direct unpooled connection URL (for migrations) | `postgresql://user:pass@ep-xyz.neon.tech/neondb?sslmode=require`                |
| `ADMIN_SESSION_SECRET`          | Production, Preview | 64-char crypto session secret                   | Generate via `openssl rand -hex 32`                                             |
| `NEXT_PUBLIC_APP_URL`           | Production          | Canonical site origin                           | `https://indiapaperwork.in`                                                     |
| `NEXT_PUBLIC_APP_VERSION`       | Production, Preview | Semver version identifier                       | `0.1.0`                                                                         |
| `NEXT_PUBLIC_SENTRY_DSN`        | Production, Preview | Sentry error monitoring DSN                     | `https://xxxx@o1234.ingest.sentry.io/5678`                                      |
| `NEXT_PUBLIC_GA_ID`             | Production          | Google Analytics 4 Measurement ID               | `G-XXXXXXXXXX`                                                                  |
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID` | Production          | Google AdSense Publisher ID                     | `ca-pub-XXXXXXXXXXXXXXXX`                                                       |

---

## 4. Database Migrations on Build

The automated `vercel-build` script runs:

```bash
prisma generate && prisma migrate deploy && turbo run build
```

- **Zero-Downtime Schema Evolution**: Every deployment applies pending Prisma migration files in `prisma/migrations/` before starting the Next.js bundle compilation.
- If any migration fails, the Vercel build terminates immediately, preventing broken code from serving live traffic.

---

## 5. Preview Deployments Strategy

- Every Pull Request and feature branch receives an automatic ephemeral preview URL (e.g. `india-paperwork-guide-git-feat-xyz.vercel.app`).
- **Database Isolation for Previews**:
  - When using **Neon PostgreSQL**, activate the Neon Vercel Integration to automatically spawn ephemeral copy-on-write database branches per pull request.
  - When using traditional PostgreSQL, ensure test data mutations in previews do not alter production tables by utilizing separate database schemas (`preview_pr_123`).

---

## 6. Custom Domain & DNS Mapping

1. Navigate to **Project Settings > Domains** in Vercel.
2. Enter `indiapaperwork.in`:
   - Vercel will recommend adding both `indiapaperwork.in` and `www.indiapaperwork.in`.
   - Set `indiapaperwork.in` as the **Canonical Domain**.
   - Set `www.indiapaperwork.in` to **Redirect to indiapaperwork.in** with status **308 Permanent Redirect**.
3. Configure DNS records at your registrar (e.g. Cloudflare, Namecheap, GoDaddy):
   - **Type A**: Name `@` -> Value `76.76.21.21`
   - **Type CNAME**: Name `www` -> Value `cname.vercel-dns.com.`
4. Vercel automatically provisions and renews a free Let's Encrypt TLS/SSL certificate.

---

## 7. Post-Deploy Smoke Verification

After the first deployment succeeds:

1. **Health Endpoint**:
   ```bash
   curl -I https://indiapaperwork.in/health
   # Expected: HTTP/2 200 OK with database connection healthy
   ```
2. **Security Headers**:
   ```bash
   curl -I https://indiapaperwork.in/
   # Verify presence of Content-Security-Policy, Strict-Transport-Security, X-Content-Type-Options: nosniff
   ```
3. **Citizen Journey Smoke Test**:
   - Open `https://indiapaperwork.in/`
   - Search for "Learner Licence"
   - Check off a document in the checklist; verify localStorage saves state
   - Verify zero layout shifts (CLS < 0.1) and Light Theme rendering.
