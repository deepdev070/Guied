import fs from "node:fs";
import path from "node:path";
import { SITE_REDIRECTS } from "../src/lib/redirects.ts";
import { SEARCH_CATALOG } from "../src/data/search-catalog.ts";
import { STATES_SEED_DATA } from "../prisma/data/states.ts";
import { TASK_JOURNEYS } from "../src/data/task-journeys.ts";
import { FALLBACK_POPULAR_TASKS } from "../src/lib/queries.ts";

export interface SeoAuditPageResult {
  filePath: string;
  urlPath: string;
  sizeBytes: number;
  title?: string;
  description?: string;
  canonical?: string;
  h1Count: number;
  h1Texts: string[];
  imagesWithoutAlt: string[];
  internalLinks: string[];
  isIndexable: boolean;
}

export interface SeoAuditReport {
  totalPagesScanned: number;
  missingTitles: string[];
  missingDescriptions: string[];
  duplicateTitles: Record<string, string[]>;
  h1Issues: Array<{ path: string; count: number; h1s: string[] }>;
  brokenInternalLinks: Array<{ from: string; to: string }>;
  imagesWithoutAlt: Array<{ page: string; imgTag: string }>;
  pagesOver2MB: Array<{ page: string; sizeBytes: number }>;
  missingCanonicals: string[];
  passed: boolean;
}

/**
 * Normalizes an HTML file path under .next/server/app into a web URL path.
 */
function fileToUrlPath(relativeFilePath: string): string {
  // e.g. "driving-licence-learner.html" -> "/driving-licence-learner"
  // e.g. "driving-licence-learner/gujarat.html" -> "/driving-licence-learner/gujarat"
  // e.g. "index.html" -> "/"
  let normalized = relativeFilePath.replace(/\\/g, "/");
  if (normalized.endsWith(".html")) {
    normalized = normalized.slice(0, -5);
  }
  if (normalized === "index") {
    return "/";
  }
  return `/${normalized}`;
}

/**
 * Recursively retrieves all HTML files under a directory.
 */
function getHtmlFiles(dir: string, baseDir: string = dir): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...getHtmlFiles(fullPath, baseDir));
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      results.push(path.relative(baseDir, fullPath));
    }
  }
  return results;
}

/**
 * Runs the comprehensive local SEO audit across the production build.
 */
export function runSeoAudit(): SeoAuditReport {
  const appBuildDir = path.join(process.cwd(), ".next/server/app");

  if (!fs.existsSync(appBuildDir)) {
    throw new Error(
      "Production build not found in .next/server/app. Run 'npm run build' before running 'npm run seo:audit'."
    );
  }

  const htmlRelativePaths = getHtmlFiles(appBuildDir);
  const knownValidPaths = new Set<string>();
  const redirectSources = new Set<string>(SITE_REDIRECTS.map((r) => r.source));

  // Build known valid web paths
  for (const relPath of htmlRelativePaths) {
    const url = fileToUrlPath(relPath);
    knownValidPaths.add(url);
  }

  // Common dynamic API routes & static assets that may be linked
  knownValidPaths.add("/api/revalidate");
  knownValidPaths.add("/api/log-missing-page");
  knownValidPaths.add("/api/page-feedback");
  knownValidPaths.add("/api/report-mistake");
  knownValidPaths.add("/robots.txt");
  knownValidPaths.add("/sitemap.xml");
  knownValidPaths.add("/health");

  // Add all catalog service paths and state variants (Prompt 70 missing page flow)
  for (const item of SEARCH_CATALOG) {
    knownValidPaths.add(`/${item.slug}`);
    for (const st of STATES_SEED_DATA) {
      knownValidPaths.add(`/${item.slug}/${st.slug}`);
    }
  }

  // Add all citizen journey steps and state variants
  for (const journey of TASK_JOURNEYS) {
    for (const step of journey.steps) {
      knownValidPaths.add(`/${step.taskSlug}`);
      for (const st of STATES_SEED_DATA) {
        knownValidPaths.add(`/${step.taskSlug}/${st.slug}`);
      }
    }
  }

  // Add all catalog task summaries and state variants
  for (const task of FALLBACK_POPULAR_TASKS) {
    knownValidPaths.add(`/${task.slug}`);
    for (const st of STATES_SEED_DATA) {
      knownValidPaths.add(`/${task.slug}/${st.slug}`);
    }
  }

  const pageResults: SeoAuditPageResult[] = [];
  const titleMap = new Map<string, string[]>();

  const missingTitles: string[] = [];
  const missingDescriptions: string[] = [];
  const h1Issues: Array<{ path: string; count: number; h1s: string[] }> = [];
  const imagesWithoutAlt: Array<{ page: string; imgTag: string }> = [];
  const pagesOver2MB: Array<{ page: string; sizeBytes: number }> = [];
  const missingCanonicals: string[] = [];
  const brokenInternalLinks: Array<{ from: string; to: string }> = [];

  for (const relPath of htmlRelativePaths) {
    // Skip internal Next.js error fallback templates
    if (relPath.includes("_global-error") || relPath.includes("_not-found")) {
      continue;
    }

    const fullPath = path.join(appBuildDir, relPath);
    const html = fs.readFileSync(fullPath, "utf8");
    const stat = fs.statSync(fullPath);
    const urlPath = fileToUrlPath(relPath);

    // 1. Page Size (<= 2MB)
    if (stat.size > 2 * 1024 * 1024) {
      pagesOver2MB.push({ page: urlPath, sizeBytes: stat.size });
    }

    // 2. Title
    const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
    const title = titleMatch ? titleMatch[1]?.trim() : undefined;
    if (!title) {
      missingTitles.push(urlPath);
    } else {
      const existing = titleMap.get(title) || [];
      existing.push(urlPath);
      titleMap.set(title, existing);
    }

    // 3. Meta Description
    const descMatch =
      html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) ||
      html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i);
    const description = descMatch ? descMatch[1]?.trim() : undefined;
    if (!description) {
      missingDescriptions.push(urlPath);
    }

    // 4. Canonical Tag
    const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i);
    const canonical = canonicalMatch ? canonicalMatch[1]?.trim() : undefined;
    if (!canonical) {
      missingCanonicals.push(urlPath);
    }

    // 5. H1 Count
    const h1Matches = [...html.matchAll(/<h1\b[^>]*>(.*?)<\/h1>/gi)];
    const h1Texts = h1Matches.map((m) => m[1]?.replace(/<[^>]*>/g, "").trim() || "");
    if (h1Matches.length !== 1) {
      h1Issues.push({ path: urlPath, count: h1Matches.length, h1s: h1Texts });
    }

    // 6. Image Alt Tags
    const imgMatches = [...html.matchAll(/<img\b([^>]*)>/gi)];
    const missingAltForThisPage: string[] = [];
    for (const match of imgMatches) {
      const tagContent = match[1] || "";
      if (!tagContent.includes("alt=") || /alt=["']\s*["']/.test(tagContent)) {
        missingAltForThisPage.push(match[0]);
        imagesWithoutAlt.push({ page: urlPath, imgTag: match[0] });
      }
    }

    // 7. Internal Links
    const linkMatches = [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi)];
    const internalLinks: string[] = [];
    for (const match of linkMatches) {
      const href = match[1]?.trim() || "";
      // Ignore anchors, external protocols, mailto, tel
      if (
        href.startsWith("#") ||
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:")
      ) {
        continue;
      }

      // Clean query parameters and hashes for route verification
      const cleanHref = href.split("?")[0]?.split("#")[0] || href;
      if (!cleanHref.startsWith("/")) continue;

      internalLinks.push(cleanHref);

      // Verify route existence (or valid redirect / dynamic pattern like /api/pdf/...)
      const exists =
        cleanHref === "/" ||
        knownValidPaths.has(cleanHref) ||
        redirectSources.has(cleanHref) ||
        cleanHref.startsWith("/api/pdf/") ||
        cleanHref.startsWith("/search");

      if (!exists) {
        brokenInternalLinks.push({ from: urlPath, to: href });
      }
    }

    // Robots index status
    const robotsMatch = html.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']*)["']/i);
    const isIndexable = !robotsMatch || !robotsMatch[1]?.includes("noindex");

    pageResults.push({
      filePath: fullPath,
      urlPath,
      sizeBytes: stat.size,
      title,
      description,
      canonical,
      h1Count: h1Matches.length,
      h1Texts,
      imagesWithoutAlt: missingAltForThisPage,
      internalLinks,
      isIndexable,
    });
  }

  // Filter duplicate titles among indexed pages
  const duplicateTitles: Record<string, string[]> = {};
  for (const [title, pages] of titleMap.entries()) {
    if (pages.length > 1) {
      duplicateTitles[title] = pages;
    }
  }

  const passed =
    missingTitles.length === 0 &&
    missingDescriptions.length === 0 &&
    Object.keys(duplicateTitles).length === 0 &&
    h1Issues.length === 0 &&
    brokenInternalLinks.length === 0 &&
    imagesWithoutAlt.length === 0 &&
    pagesOver2MB.length === 0 &&
    missingCanonicals.length === 0;

  return {
    totalPagesScanned: pageResults.length,
    missingTitles,
    missingDescriptions,
    duplicateTitles,
    h1Issues,
    brokenInternalLinks,
    imagesWithoutAlt,
    pagesOver2MB,
    missingCanonicals,
    passed,
  };
}

if (process.argv[1]?.includes("seo-audit")) {
  console.log("🔍 Running Comprehensive Local SEO Audit (Prompt 84)...\n");

  try {
    const report = runSeoAudit();

    console.log(`Audited ${report.totalPagesScanned} static pages in .next/server/app.\n`);

    const summaryData = [
      {
        Check: "1. Missing Titles",
        Status:
          report.missingTitles.length === 0
            ? "✅ 0 issues"
            : `❌ ${report.missingTitles.length} missing`,
      },
      {
        Check: "2. Missing Meta Descriptions",
        Status:
          report.missingDescriptions.length === 0
            ? "✅ 0 issues"
            : `❌ ${report.missingDescriptions.length} missing`,
      },
      {
        Check: "3. Duplicate Titles",
        Status:
          Object.keys(report.duplicateTitles).length === 0
            ? "✅ 0 duplicates"
            : `❌ ${Object.keys(report.duplicateTitles).length} duplicates`,
      },
      {
        Check: "4. Single H1 per Page",
        Status:
          report.h1Issues.length === 0 ? "✅ 0 issues" : `❌ ${report.h1Issues.length} issues`,
      },
      {
        Check: "5. Broken Internal Links",
        Status:
          report.brokenInternalLinks.length === 0
            ? "✅ 0 broken"
            : `❌ ${report.brokenInternalLinks.length} broken`,
      },
      {
        Check: "6. Images Missing Alt Text",
        Status:
          report.imagesWithoutAlt.length === 0
            ? "✅ 0 issues"
            : `❌ ${report.imagesWithoutAlt.length} missing`,
      },
      {
        Check: "7. Pages Over 2MB",
        Status:
          report.pagesOver2MB.length === 0
            ? "✅ 0 pages > 2MB"
            : `❌ ${report.pagesOver2MB.length} oversized`,
      },
      {
        Check: "8. Missing Canonical Tags",
        Status:
          report.missingCanonicals.length === 0
            ? "✅ 0 missing"
            : `❌ ${report.missingCanonicals.length} missing`,
      },
    ];

    console.table(summaryData);

    if (!report.passed) {
      console.error("\n❌ SEO AUDIT FAILED: Please resolve the issues above before releasing.");
      if (report.missingTitles.length > 0) {
        console.error("Missing Titles in:", report.missingTitles);
      }
      if (report.missingDescriptions.length > 0) {
        console.error("Missing Descriptions in:", report.missingDescriptions);
      }
      if (Object.keys(report.duplicateTitles).length > 0) {
        console.error("Duplicate Titles:", report.duplicateTitles);
      }
      if (report.h1Issues.length > 0) {
        console.error("H1 Issues in:", report.h1Issues);
      }
      if (report.brokenInternalLinks.length > 0) {
        console.error("Broken Internal Links:", report.brokenInternalLinks);
      }
      if (report.imagesWithoutAlt.length > 0) {
        console.error("Images Missing Alt in:", report.imagesWithoutAlt);
      }
      if (report.pagesOver2MB.length > 0) {
        console.error("Pages Over 2MB in:", report.pagesOver2MB);
      }
      if (report.missingCanonicals.length > 0) {
        console.error("Missing Canonicals in:", report.missingCanonicals);
      }
      process.exit(1);
    } else {
      console.log("\n🎉 PERFECT SEO HEALTH: All pages pass 100% of technical SEO standards!\n");
    }
  } catch (err) {
    console.error("Audit error:", err);
    process.exit(1);
  }
}
