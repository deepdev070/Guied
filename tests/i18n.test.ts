import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  LOCALES_META,
  isSupportedLocale,
  parseLocaleFromPath,
  getLocalizedPath,
  getMessages,
  t,
  formatCurrency,
} from "../src/i18n/index.ts";
import { getTaskTranslation } from "../src/lib/i18n/content-translations.ts";

describe("Prompt 95: Internationalisation (i18n) Setup for en, hi, gu", () => {
  it("1. Config: supports en (default), hi, and gu with native names and metadata", () => {
    assert.deepEqual(SUPPORTED_LOCALES, ["en", "hi", "gu"]);
    assert.strictEqual(DEFAULT_LOCALE, "en");

    assert.strictEqual(LOCALES_META.en.nativeName, "English");
    assert.strictEqual(LOCALES_META.hi.nativeName, "हिन्दी");
    assert.strictEqual(LOCALES_META.gu.nativeName, "ગુજરાતી");

    assert.strictEqual(isSupportedLocale("en"), true);
    assert.strictEqual(isSupportedLocale("hi"), true);
    assert.strictEqual(isSupportedLocale("gu"), true);
    assert.strictEqual(isSupportedLocale("fr"), false);
  });

  it("2. Routing: parses and formats routes correctly for / (en), /hi, and /gu", () => {
    // English default is prefixless at root
    assert.deepEqual(parseLocaleFromPath("/"), { locale: "en", pathWithoutLocale: "/" });
    assert.deepEqual(parseLocaleFromPath("/driving-licence-learner"), {
      locale: "en",
      pathWithoutLocale: "/driving-licence-learner",
    });

    // Hindi prefix
    assert.deepEqual(parseLocaleFromPath("/hi"), { locale: "hi", pathWithoutLocale: "/" });
    assert.deepEqual(parseLocaleFromPath("/hi/driving-licence-learner"), {
      locale: "hi",
      pathWithoutLocale: "/driving-licence-learner",
    });

    // Gujarati prefix
    assert.deepEqual(parseLocaleFromPath("/gu"), { locale: "gu", pathWithoutLocale: "/" });
    assert.deepEqual(parseLocaleFromPath("/gu/driving-licence-learner/gujarat"), {
      locale: "gu",
      pathWithoutLocale: "/driving-licence-learner/gujarat",
    });

    // Localization switcher URL formatting
    assert.strictEqual(
      getLocalizedPath("/driving-licence-learner", "hi"),
      "/hi/driving-licence-learner"
    );
    assert.strictEqual(
      getLocalizedPath("/hi/driving-licence-learner", "gu"),
      "/gu/driving-licence-learner"
    );
    assert.strictEqual(
      getLocalizedPath("/gu/driving-licence-learner", "en"),
      "/driving-licence-learner"
    );
    assert.strictEqual(getLocalizedPath("/", "hi"), "/hi");
    assert.strictEqual(getLocalizedPath("/hi", "en"), "/");
  });

  it("3. Message Catalogs: en, hi, gu json files exist and contain required namespaces", () => {
    const requiredNamespaces = [
      "common",
      "nav",
      "task",
      "checklist",
      "search",
      "consent",
      "translation",
      "footer",
    ];

    for (const locale of SUPPORTED_LOCALES) {
      const messages = getMessages(locale);
      for (const ns of requiredNamespaces) {
        assert.ok(
          messages[ns] && Object.keys(messages[ns]).length > 0,
          `Namespace '${ns}' must exist in '${locale}.json'`
        );
      }
    }
  });

  it("4. Translation function: translates keys and interpolates variables", () => {
    assert.strictEqual(t("en", "common.siteTitle"), "India Paperwork Guide");
    assert.strictEqual(t("hi", "common.siteTitle"), "भारत कागजी कार्रवाई गाइड");
    assert.strictEqual(t("gu", "common.siteTitle"), "ભારત દસ્તાવેજ માર્ગદર્શિકા");

    // Variable interpolation
    assert.strictEqual(t("en", "task.documentsCount", { count: 5 }), "5 Documents Required");
    assert.strictEqual(t("hi", "task.documentsCount", { count: 5 }), "5 दस्तावेज़ आवश्यक");
    assert.strictEqual(t("gu", "task.documentsCount", { count: 5 }), "5 જરૂરી દસ્તાવેજો");

    // Fallback to English for unknown keys
    assert.strictEqual(t("hi", "nav.unknownKey"), "nav.unknownKey");
  });

  it("5. Currency formatting: formats INR currency per locale conventions", () => {
    assert.strictEqual(formatCurrency(0, "en"), "Free (₹0)");
    assert.strictEqual(formatCurrency(0, "hi"), "निःशुल्क (₹0)");
    assert.strictEqual(formatCurrency(0, "gu"), "મફત (₹0)");

    const formattedHi = formatCurrency(1500, "hi");
    assert.ok(formattedHi.includes("1,500") || formattedHi.includes("१,५००"));
  });

  it("6. Database Schema: TaskVariantTranslation and ContentTranslation exist with locale field", () => {
    const schemaPath = path.join(process.cwd(), "prisma/schema.prisma");
    const schemaContent = fs.readFileSync(schemaPath, "utf8");

    assert.ok(
      schemaContent.includes("model TaskVariantTranslation"),
      "Prisma schema must define model TaskVariantTranslation"
    );
    assert.ok(
      schemaContent.includes("model ContentTranslation"),
      "Prisma schema must define model ContentTranslation"
    );
    assert.ok(
      schemaContent.includes("locale              String"),
      "Translation models must contain a 'locale' field"
    );
    assert.ok(
      schemaContent.includes("isMachineTranslated Boolean"),
      "Translation models must track 'isMachineTranslated'"
    );
    assert.ok(
      schemaContent.includes("isReviewed          Boolean"),
      "Translation models must track 'isReviewed'"
    );
  });

  it("7. Content Translations: getTaskTranslation returns localized content and review status", async () => {
    // English returns null (uses primary variant)
    const enTrans = await getTaskTranslation("driving-licence-learner", "en");
    assert.strictEqual(enTrans, null);

    // Hindi translation
    const hiTrans = await getTaskTranslation("driving-licence-learner", "hi");
    assert.ok(hiTrans, "Hindi translation must exist for learner driving licence");
    assert.strictEqual(hiTrans.locale, "hi");
    assert.strictEqual(hiTrans.isReviewed, false);
    assert.ok(hiTrans.title.includes("लर्नर लाइसेंस"));
    assert.ok(hiTrans.steps && hiTrans.steps.length >= 5);

    // Gujarati translation
    const guTrans = await getTaskTranslation("driving-licence-learner", "gu");
    assert.ok(guTrans, "Gujarati translation must exist for learner driving licence");
    assert.strictEqual(guTrans.locale, "gu");
    assert.strictEqual(guTrans.isReviewed, false);
    assert.ok(guTrans.title.includes("લર્નર લાયસન્સ"));
    assert.ok(guTrans.steps && guTrans.steps.length >= 5);
  });
});
