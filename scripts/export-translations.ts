import fs from "node:fs";
import path from "node:path";
import { DEFAULT_LOCALE, type Locale } from "../src/i18n/config.ts";
import { loadAllTaskFiles } from "../src/lib/queries.ts";
import { STATIC_TASK_TRANSLATIONS } from "../src/lib/i18n/content-translations.ts";

export interface TranslationRow {
  entityType: "ui" | "task" | "step" | "document" | "faq";
  entityId: string;
  locale: Locale;
  field: string;
  sourceEn: string;
  currentTranslation: string;
  isReviewed: boolean;
}

function escapeCsvField(field: string): string {
  if (field.includes(",") || field.includes('"') || field.includes("\n") || field.includes("\r")) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

/**
 * Extracts all untranslated or unreviewed strings and task content into structured rows.
 */
export function extractUntranslatedStrings(
  targetLocales: Locale[] = ["hi", "gu"]
): TranslationRow[] {
  const rows: TranslationRow[] = [];

  // 1. Scan UI Message JSONs
  const messagesDir = path.join(process.cwd(), "src/i18n/messages");
  const enMessagesPath = path.join(messagesDir, "en.json");
  const enMessages = JSON.parse(fs.readFileSync(enMessagesPath, "utf8"));

  for (const locale of targetLocales) {
    if (locale === DEFAULT_LOCALE) continue;

    const locMessagesPath = path.join(messagesDir, `${locale}.json`);
    let locMessages: Record<string, Record<string, string>> = {};
    if (fs.existsSync(locMessagesPath)) {
      locMessages = JSON.parse(fs.readFileSync(locMessagesPath, "utf8"));
    }

    for (const [namespace, keys] of Object.entries(enMessages)) {
      if (typeof keys !== "object" || !keys) continue;
      for (const [key, sourceEn] of Object.entries(keys as Record<string, string>)) {
        const fullKey = `${namespace}.${key}`;
        const translated = locMessages[namespace]?.[key] || "";
        const isTranslated = Boolean(translated && translated !== sourceEn);

        rows.push({
          entityType: "ui",
          entityId: fullKey,
          locale,
          field: "label",
          sourceEn,
          currentTranslation: translated,
          isReviewed: isTranslated,
        });
      }
    }
  }

  // 2. Scan Task Content Files
  const allTasks = loadAllTaskFiles();
  for (const task of allTasks) {
    for (const locale of targetLocales) {
      if (locale === DEFAULT_LOCALE) continue;

      const staticTrans = STATIC_TASK_TRANSLATIONS[task.slug]?.[locale];
      const isTaskReviewed = staticTrans?.isReviewed ?? false;

      // Task Title
      rows.push({
        entityType: "task",
        entityId: task.slug,
        locale,
        field: "title",
        sourceEn: task.national.title,
        currentTranslation: staticTrans?.title || "",
        isReviewed: isTaskReviewed,
      });

      // Task Summary
      rows.push({
        entityType: "task",
        entityId: task.slug,
        locale,
        field: "summary",
        sourceEn: task.national.summary,
        currentTranslation: staticTrans?.summary || "",
        isReviewed: isTaskReviewed,
      });

      // Task Steps
      task.national.steps.forEach((step) => {
        const transStep = staticTrans?.steps?.find((s) => s.stepNumber === step.stepNumber);
        rows.push({
          entityType: "step",
          entityId: `${task.slug}:step:${step.stepNumber}`,
          locale,
          field: "title",
          sourceEn: step.title,
          currentTranslation: transStep?.title || "",
          isReviewed: isTaskReviewed,
        });
        rows.push({
          entityType: "step",
          entityId: `${task.slug}:step:${step.stepNumber}`,
          locale,
          field: "description",
          sourceEn: step.description,
          currentTranslation: transStep?.description || "",
          isReviewed: isTaskReviewed,
        });
      });

      // Document Requirements
      task.national.documentRequirements.forEach((doc) => {
        const transDoc = staticTrans?.documents?.find((d) => d.name === doc.name);
        rows.push({
          entityType: "document",
          entityId: `${task.slug}:doc:${doc.name}`,
          locale,
          field: "name",
          sourceEn: doc.name,
          currentTranslation: transDoc?.name || "",
          isReviewed: isTaskReviewed,
        });
      });

      // FAQs
      task.national.faqItems.forEach((faq, idx) => {
        const transFaq = staticTrans?.faqs?.[idx];
        rows.push({
          entityType: "faq",
          entityId: `${task.slug}:faq:${idx + 1}`,
          locale,
          field: "question",
          sourceEn: faq.question,
          currentTranslation: transFaq?.question || "",
          isReviewed: isTaskReviewed,
        });
      });
    }
  }

  return rows;
}

/**
 * Converts translation rows to RFC 4180 CSV string.
 */
export function formatTranslationsCsv(rows: TranslationRow[]): string {
  const headers = [
    "entity_type",
    "entity_id",
    "locale",
    "field",
    "source_en",
    "current_translation",
    "is_reviewed",
  ];

  const lines = [headers.join(",")];

  for (const row of rows) {
    const line = [
      escapeCsvField(row.entityType),
      escapeCsvField(row.entityId),
      escapeCsvField(row.locale),
      escapeCsvField(row.field),
      escapeCsvField(row.sourceEn),
      escapeCsvField(row.currentTranslation),
      row.isReviewed ? "true" : "false",
    ].join(",");
    lines.push(line);
  }

  return lines.join("\n");
}

/**
 * CLI execution entrypoint
 */
export function runExport(outputPath?: string): string {
  const targetPath = outputPath || path.join(process.cwd(), "translations/translations_export.csv");
  const dir = path.dirname(targetPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const rows = extractUntranslatedStrings(["hi", "gu"]);
  const csv = formatTranslationsCsv(rows);
  fs.writeFileSync(targetPath, csv, "utf8");

  const unreviewedCount = rows.filter((r) => !r.isReviewed).length;
  console.log(`✅ Exported ${rows.length} total translation items to ${targetPath}`);
  console.log(`ℹ️  ${unreviewedCount} items need human review and translation.`);

  return targetPath;
}

// Run directly from CLI
if (process.argv[1]?.endsWith("export-translations.ts")) {
  runExport();
}
