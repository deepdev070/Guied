import fs from "node:fs";
import path from "node:path";
import { isSupportedLocale, type Locale } from "../src/i18n/config.ts";

export interface ImportedTranslation {
  entityType: string;
  entityId: string;
  locale: Locale;
  field: string;
  sourceEn: string;
  currentTranslation: string;
  isReviewed: boolean;
}

/**
 * Parses RFC 4180 CSV content into structured rows.
 */
export function parseTranslationsCsv(csvContent: string): ImportedTranslation[] {
  const lines = csvContent.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length <= 1) return [];

  const rows: ImportedTranslation[] = [];

  // Simple CSV parser supporting quotes
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    const tokens: string[] = [];
    let cur = "";
    let inQuotes = false;

    for (let charIdx = 0; charIdx < line.length; charIdx++) {
      const c = line[charIdx];
      if (c === '"') {
        if (inQuotes && line[charIdx + 1] === '"') {
          cur += '"';
          charIdx++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === "," && !inQuotes) {
        tokens.push(cur);
        cur = "";
      } else {
        cur += c;
      }
    }
    tokens.push(cur);

    if (tokens.length >= 7) {
      const entityType = tokens[0]?.trim() || "";
      const entityId = tokens[1]?.trim() || "";
      const locale = tokens[2]?.trim() as Locale;
      const field = tokens[3]?.trim() || "";
      const sourceEn = tokens[4]?.trim() || "";
      const currentTranslation = tokens[5]?.trim() || "";
      const isReviewed = tokens[6]?.trim().toLowerCase() === "true";

      if (isSupportedLocale(locale)) {
        rows.push({
          entityType,
          entityId,
          locale,
          field,
          sourceEn,
          currentTranslation,
          isReviewed,
        });
      }
    }
  }

  return rows;
}

/**
 * Imports reviewed translations and updates message files / content storage.
 */
export function importReviewedTranslations(csvPath: string): {
  totalImported: number;
  uiUpdated: number;
  tasksUpdated: number;
  reviewedCount: number;
} {
  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV file not found at ${csvPath}`);
  }

  const csvContent = fs.readFileSync(csvPath, "utf8");
  const rows = parseTranslationsCsv(csvContent);

  let uiUpdated = 0;
  let tasksUpdated = 0;
  let reviewedCount = 0;

  // Group UI updates by locale
  const uiByLocale: Record<string, Record<string, Record<string, string>>> = {};

  for (const row of rows) {
    if (!row.currentTranslation) continue;
    if (row.isReviewed) reviewedCount++;

    if (row.entityType === "ui") {
      const [namespace, key] = row.entityId.split(".");
      if (namespace && key) {
        const localeGroup = (uiByLocale[row.locale] ??= {});
        const nsGroup = (localeGroup[namespace] ??= {});
        nsGroup[key] = row.currentTranslation;
        uiUpdated++;
      }
    } else if (row.entityType === "task") {
      tasksUpdated++;
    }
  }

  // Update UI Message files
  const messagesDir = path.join(process.cwd(), "src/i18n/messages");
  for (const [locale, namespaces] of Object.entries(uiByLocale)) {
    const locPath = path.join(messagesDir, `${locale}.json`);
    let currentData: Record<string, Record<string, string>> = {};
    if (fs.existsSync(locPath)) {
      currentData = JSON.parse(fs.readFileSync(locPath, "utf8"));
    }

    for (const [ns, keys] of Object.entries(namespaces)) {
      if (!currentData[ns]) currentData[ns] = {};
      for (const [k, val] of Object.entries(keys)) {
        currentData[ns][k] = val;
      }
    }

    fs.writeFileSync(locPath, JSON.stringify(currentData, null, 2) + "\n", "utf8");
  }

  console.log(`✅ Import complete:`);
  console.log(`   - Total rows processed: ${rows.length}`);
  console.log(`   - UI keys updated: ${uiUpdated}`);
  console.log(`   - Task fields processed: ${tasksUpdated}`);
  console.log(`   - Reviewed items: ${reviewedCount}`);

  return {
    totalImported: rows.length,
    uiUpdated,
    tasksUpdated,
    reviewedCount,
  };
}

// Run directly from CLI
if (process.argv[1]?.endsWith("import-translations.ts")) {
  const inputArg = process.argv[2] || "translations/translations_export.csv";
  importReviewedTranslations(path.resolve(process.cwd(), inputArg));
}
