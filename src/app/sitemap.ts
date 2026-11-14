import type { MetadataRoute } from "next";
import { getAllSitemapEntries } from "../lib/sitemap.ts";

/**
 * Generates sitemap.xml with all published tasks, task+state pairs,
 * categories, states, civic guides, and glossary terms.
 * Supports chunking via chunkSitemapEntries if URLs exceed 5,000.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return getAllSitemapEntries();
}
