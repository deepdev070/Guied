import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  extractUntranslatedStrings,
  formatTranslationsCsv,
} from "../scripts/export-translations.ts";
import {
  parseTranslationsCsv,
  importReviewedTranslations,
} from "../scripts/import-translations.ts";

describe("Prompt 96: Translation Workflow (Export/Import, Machine Notice & Noindex)", () => {
  it("1. Export: extracts all untranslated/unreviewed strings across UI and task content", () => {
    const rows = extractUntranslatedStrings(["hi", "gu"]);
    assert.ok(rows.length > 0, "Should extract translation rows");

    // Must contain both UI and task entities
    const uiRows = rows.filter((r) => r.entityType === "ui");
    const taskRows = rows.filter((r) => r.entityType === "task");
    const stepRows = rows.filter((r) => r.entityType === "step");

    assert.ok(uiRows.length > 0, "Must extract UI message rows");
    assert.ok(taskRows.length > 0, "Must extract task rows");
    assert.ok(stepRows.length > 0, "Must extract step rows");

    // Check fields presence
    for (const r of rows.slice(0, 20)) {
      assert.ok(r.entityId, "Row must have entityId");
      assert.ok(["hi", "gu"].includes(r.locale), "Locale must be hi or gu");
      assert.ok(r.sourceEn, "Row must have sourceEn text");
      assert.strictEqual(typeof r.isReviewed, "boolean");
    }
  });

  it("2. CSV Formatting and Parsing: preserves special characters and quotes per RFC 4180", () => {
    const testRows = [
      {
        entityType: "ui" as const,
        entityId: "test.greeting",
        locale: "hi" as const,
        field: "label",
        sourceEn: 'Hello, "Citizen" of India!',
        currentTranslation: 'नमस्ते, भारत के "नागरिक"!',
        isReviewed: true,
      },
      {
        entityType: "task" as const,
        entityId: "driving-licence-learner",
        locale: "gu" as const,
        field: "title",
        sourceEn: "Learner's Licence in Gujarat",
        currentTranslation: "ગુજરાતમાં લર્નર લાયસન્સ",
        isReviewed: false,
      },
    ];

    const csv = formatTranslationsCsv(testRows);
    assert.ok(
      csv.includes("entity_type,entity_id,locale,field,source_en,current_translation,is_reviewed")
    );

    const parsed = parseTranslationsCsv(csv);
    assert.strictEqual(parsed.length, 2);
    assert.strictEqual(parsed[0]?.sourceEn, 'Hello, "Citizen" of India!');
    assert.strictEqual(parsed[0]?.currentTranslation, 'नमस्ते, भारत के "नागरिक"!');
    assert.strictEqual(parsed[0]?.isReviewed, true);
    assert.strictEqual(parsed[1]?.isReviewed, false);
  });

  it("3. Import: processes CSV and records reviewed translations count", () => {
    const tempCsvPath = path.join(process.cwd(), "translations/temp_test_import.csv");
    const testCsv = [
      "entity_type,entity_id,locale,field,source_en,current_translation,is_reviewed",
      'ui,common.loading,hi,label,"Loading...","लोड हो रहा है...",true',
      'ui,common.loading,gu,label,"Loading...","લોડ થઈ રહ્યું છે...",true',
    ].join("\n");

    fs.writeFileSync(tempCsvPath, testCsv, "utf8");

    try {
      const stats = importReviewedTranslations(tempCsvPath);
      assert.strictEqual(stats.totalImported, 2);
      assert.strictEqual(stats.reviewedCount, 2);
      assert.strictEqual(stats.uiUpdated, 2);
    } finally {
      if (fs.existsSync(tempCsvPath)) {
        fs.unlinkSync(tempCsvPath);
      }
    }
  });

  it("4. Translation Notice Component: verifies notice text and unreviewed banner requirements", () => {
    const noticeFilePath = path.join(process.cwd(), "src/components/i18n/TranslationNotice.tsx");
    assert.ok(fs.existsSync(noticeFilePath), "TranslationNotice.tsx must exist");

    const content = fs.readFileSync(noticeFilePath, "utf8");
    assert.ok(
      content.includes("data-translation-notice"),
      "Notice must contain data-translation-notice attribute"
    );
    assert.ok(
      content.includes("translation.machineNotice"),
      "Must use i18n translation key for machineNotice"
    );
    assert.ok(
      content.includes("translation.reviewHelp"),
      "Must offer link to review/report mistake"
    );
    assert.ok(
      content.includes('if (locale === "en" || isReviewed)'),
      "Notice must hide on English or reviewed pages"
    );
  });

  it("5. Unreviewed Noindex Guard: non-English pages stay noindex until human review", () => {
    const hiPagePath = path.join(process.cwd(), "src/app/hi/[task]/page.tsx");
    const guPagePath = path.join(process.cwd(), "src/app/gu/[task]/page.tsx");

    const hiContent = fs.readFileSync(hiPagePath, "utf8");
    const guContent = fs.readFileSync(guPagePath, "utf8");

    assert.ok(
      hiContent.includes("index: isReviewed"),
      "Hindi task page must dynamically set robots.index to isReviewed"
    );
    assert.ok(
      guContent.includes("index: isReviewed"),
      "Gujarati task page must dynamically set robots.index to isReviewed"
    );
  });
});
