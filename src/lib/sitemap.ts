import type { MetadataRoute } from "next";
import { CATEGORIES_SEED_DATA } from "../../prisma/data/categories.ts";
import { STATES_SEED_DATA } from "../../prisma/data/states.ts";
import { GLOSSARY_TERMS } from "../data/glossary.ts";
import { loadAllTaskFiles } from "./queries.ts";

export const SITEMAP_MAX_URLS = 5000;
export const DEFAULT_SITE_URL = "https://indiapaperworkguide.in";

export interface SitemapConfig {
  siteUrl?: string;
}

/**
 * Returns all sitemap entries for the entire website.
 * Includes:
 * - Root homepage
 * - Static civic pages
 * - Published tasks
 * - Published task + state pairs
 * - Category listing hubs
 * - State hubs
 * - Civic glossary terms
 */
export async function getAllSitemapEntries(
  config: SitemapConfig = {}
): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (config.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL).replace(
    /\/$/,
    ""
  );

  const tasks = loadAllTaskFiles().filter((t) => t.national.status === "PUBLISHED");
  const entries: MetadataRoute.Sitemap = [];

  // 1. Determine most recent verification timestamp across tasks for homepage / hub fallbacks
  let mostRecentTimestamp = new Date("2026-01-01T00:00:00.000Z");
  for (const task of tasks) {
    const rawDate = task.national.lastVerifiedAt;
    if (rawDate) {
      const d = new Date(rawDate);
      if (d > mostRecentTimestamp) {
        mostRecentTimestamp = d;
      }
    }
  }

  // 2. Root Home Page
  entries.push({
    url: `${baseUrl}`,
    lastModified: mostRecentTimestamp,
    changeFrequency: "daily",
    priority: 1.0,
  });

  // 3. Static Civic Info Pages
  const staticCivicPages = [
    { path: "/about", priority: 0.5, changeFrequency: "monthly" as const },
    { path: "/how-we-verify", priority: 0.5, changeFrequency: "monthly" as const },
    { path: "/disclaimer", priority: 0.4, changeFrequency: "monthly" as const },
    { path: "/privacy-policy", priority: 0.4, changeFrequency: "monthly" as const },
    { path: "/terms", priority: 0.4, changeFrequency: "monthly" as const },
    { path: "/glossary", priority: 0.6, changeFrequency: "weekly" as const },
  ];

  for (const page of staticCivicPages) {
    entries.push({
      url: `${baseUrl}${page.path}`,
      lastModified: mostRecentTimestamp,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    });
  }

  // 4. Categories
  for (const cat of CATEGORIES_SEED_DATA) {
    entries.push({
      url: `${baseUrl}/category/${cat.slug}`,
      lastModified: mostRecentTimestamp,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  // 5. States
  for (const state of STATES_SEED_DATA) {
    entries.push({
      url: `${baseUrl}/state/${state.slug}`,
      lastModified: mostRecentTimestamp,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  // 6. Published Tasks and Task+State Pages
  for (const task of tasks) {
    const national = task.national;
    const taskLastVerified = national.lastVerifiedAt
      ? new Date(national.lastVerifiedAt)
      : mostRecentTimestamp;

    // National task page
    entries.push({
      url: `${baseUrl}/${task.slug}`,
      lastModified: taskLastVerified,
      changeFrequency: "weekly",
      priority: 0.9,
    });

    // Task + State pages
    for (const state of STATES_SEED_DATA) {
      const override = task.states?.[state.code];
      const stateLastVerified = override?.lastVerifiedAt
        ? new Date(override.lastVerifiedAt)
        : taskLastVerified;

      entries.push({
        url: `${baseUrl}/${task.slug}/${state.slug}`,
        lastModified: stateLastVerified,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  }

  // 7. Civic Glossary Terms
  for (const term of GLOSSARY_TERMS) {
    entries.push({
      url: `${baseUrl}/glossary/${term.slug}`,
      lastModified: mostRecentTimestamp,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  return entries;
}

/**
 * Splits sitemap entries into slices of maximum chunkSize (default 5,000).
 */
export function chunkSitemapEntries(
  entries: MetadataRoute.Sitemap,
  chunkSize = SITEMAP_MAX_URLS
): MetadataRoute.Sitemap[] {
  if (entries.length <= chunkSize) {
    return [entries];
  }

  const chunks: MetadataRoute.Sitemap[] = [];
  for (let i = 0; i < entries.length; i += chunkSize) {
    chunks.push(entries.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Returns the IDs array for generateSitemaps if splitting is needed.
 */
export function calculateSitemapIds(
  totalCount: number,
  chunkSize = SITEMAP_MAX_URLS
): { id: number }[] {
  if (totalCount <= chunkSize) {
    return [{ id: 0 }];
  }
  const chunkCount = Math.ceil(totalCount / chunkSize);
  return Array.from({ length: chunkCount }, (_, i) => ({ id: i }));
}

/**
 * Retrieves a single chunk of sitemap entries by chunk index.
 */
export function getSitemapChunk(
  entries: MetadataRoute.Sitemap,
  chunkIndex: number,
  chunkSize = SITEMAP_MAX_URLS
): MetadataRoute.Sitemap {
  const chunks = chunkSitemapEntries(entries, chunkSize);
  return chunks[chunkIndex] ?? [];
}
