import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  SUPPORTED_LOCALES,
  LOCALES_META,
  getLocalizedPath,
  CIVIC_LOCALE_COOKIE,
  CIVIC_LOCALE_STORAGE_KEY,
} from "../src/i18n/index.ts";

describe("Prompt 97: Language Switcher (Header, Footer, Native Names & Page Preservation)", () => {
  it("1. Native Names: verifies native names English, हिन्दी, ગુજરાતી are registered", () => {
    assert.strictEqual(LOCALES_META.en.nativeName, "English");
    assert.strictEqual(LOCALES_META.hi.nativeName, "हिन्दी");
    assert.strictEqual(LOCALES_META.gu.nativeName, "ગુજરાતી");
    assert.deepEqual(SUPPORTED_LOCALES, ["en", "hi", "gu"]);
  });

  it("2. Page Preservation: keeps user on the exact same page across all 3 languages", () => {
    const testCases = [
      {
        original: "/driving-licence-learner",
        toHi: "/hi/driving-licence-learner",
        toGu: "/gu/driving-licence-learner",
        toEn: "/driving-licence-learner",
      },
      {
        original: "/driving-licence-learner/gujarat",
        toHi: "/hi/driving-licence-learner/gujarat",
        toGu: "/gu/driving-licence-learner/gujarat",
        toEn: "/driving-licence-learner/gujarat",
      },
      {
        original: "/category/vehicles",
        toHi: "/hi/category/vehicles",
        toGu: "/gu/category/vehicles",
        toEn: "/category/vehicles",
      },
      {
        original: "/search",
        toHi: "/hi/search",
        toGu: "/gu/search",
        toEn: "/search",
      },
      {
        original: "/",
        toHi: "/hi",
        toGu: "/gu",
        toEn: "/",
      },
    ];

    for (const tc of testCases) {
      assert.strictEqual(getLocalizedPath(tc.original, "hi"), tc.toHi);
      assert.strictEqual(getLocalizedPath(tc.original, "gu"), tc.toGu);
      assert.strictEqual(getLocalizedPath(tc.toHi, "gu"), tc.toGu);
      assert.strictEqual(getLocalizedPath(tc.toGu, "en"), tc.toEn);
    }
  });

  it("3. Component Source: LanguageSwitcher satisfies accessibility and small screen requirements", () => {
    const componentPath = path.join(process.cwd(), "src/components/layout/LanguageSwitcher.tsx");
    assert.ok(fs.existsSync(componentPath), "LanguageSwitcher.tsx must exist");

    const content = fs.readFileSync(componentPath, "utf8");

    // Native names
    assert.ok(content.includes("meta.nativeName"), "Must display nativeName");

    // Variants
    assert.ok(content.includes('variant === "footer"'), "Must support footer variant");
    assert.ok(content.includes('variant === "mobile"'), "Must support mobile variant");

    // Touch targets >= 44px
    assert.ok(
      content.includes("min-h-[44px]"),
      "Must enforce minimum 44px height touch targets for mobile accessibility"
    );

    // Context integration
    assert.ok(content.includes("useLanguage"), "Must consume useLanguage hook");
    assert.ok(content.includes("setLocale"), "Must trigger setLocale to persist choice");
  });

  it("4. Layout Integration: Header and Footer render LanguageSwitcher", () => {
    const headerContent = fs.readFileSync(
      path.join(process.cwd(), "src/components/layout/Header.tsx"),
      "utf8"
    );
    const footerContent = fs.readFileSync(
      path.join(process.cwd(), "src/components/layout/Footer.tsx"),
      "utf8"
    );
    const mobileNavContent = fs.readFileSync(
      path.join(process.cwd(), "src/components/layout/MobileNav.tsx"),
      "utf8"
    );

    assert.ok(headerContent.includes("<LanguageSwitcher"), "Header must render LanguageSwitcher");
    assert.ok(footerContent.includes("<LanguageSwitcher"), "Footer must render LanguageSwitcher");
    assert.ok(
      mobileNavContent.includes("<LanguageSwitcher"),
      "MobileNav must render LanguageSwitcher"
    );
  });

  it("5. Persistence: uses civic_locale storage and cookie keys", () => {
    assert.strictEqual(CIVIC_LOCALE_STORAGE_KEY, "civic_locale");
    assert.strictEqual(CIVIC_LOCALE_COOKIE, "civic_locale");
  });
});
