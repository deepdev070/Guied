import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { buildWhatsAppShareUrl, getWhatsAppShareMessage, buildShareUrl } from "../src/lib/share.ts";

test("PROMPT 143: WhatsApp-first Sharing Copy & Multilingual Templates", async (t) => {
  const contentPath = path.join(process.cwd(), "src/content/whatsapp-templates.json");

  await t.test("1. whatsapp-templates.json exists and is valid JSON", () => {
    assert.ok(fs.existsSync(contentPath), "src/content/whatsapp-templates.json must exist");
    const raw = fs.readFileSync(contentPath, "utf-8");
    const data = JSON.parse(raw);
    assert.ok(data.templates, "Must contain templates object");
    assert.equal(data.version, "1.0");
  });

  await t.test("2. All 10 civic categories + default have exactly 3 templates per language", () => {
    const raw = fs.readFileSync(contentPath, "utf-8");
    const data = JSON.parse(raw);
    const expectedCategories = [
      "default",
      "identity",
      "vehicles",
      "money-and-tax",
      "property-and-land",
      "family-and-certificates",
      "business-and-licences",
      "education-and-scholarships",
      "health-and-welfare",
      "jobs-and-pension",
      "utilities-and-connections",
    ];

    for (const cat of expectedCategories) {
      const catTemplates = data.templates[cat];
      assert.ok(catTemplates, `Category '${cat}' must exist in templates`);
      for (const lang of ["en", "hi", "gu"] as const) {
        const langList = catTemplates[lang];
        assert.ok(Array.isArray(langList), `Category '${cat}' must have '${lang}' templates array`);
        assert.equal(
          langList.length,
          3,
          `Category '${cat}' in '${lang}' must contain exactly 3 templates (got ${langList.length})`
        );

        // Check each template structure
        for (const tmpl of langList) {
          assert.ok(
            typeof tmpl === "string" && tmpl.length > 20,
            `Template in '${cat}' (${lang}) must be a meaningful non-empty string`
          );
          assert.ok(
            tmpl.includes("{title}"),
            `Template in '${cat}' (${lang}) must include '{title}' placeholder`
          );
          assert.ok(
            tmpl.includes("{url}"),
            `Template in '${cat}' (${lang}) must include '{url}' placeholder`
          );
          // Verify non-spammy concise length (under 250 characters before URL expansion)
          assert.ok(
            tmpl.length < 250,
            `Template in '${cat}' (${lang}) must be concise (<250 chars) to prevent spam flags`
          );
        }
      }
    }
  });

  await t.test("3. getWhatsAppShareMessage correctly substitutes placeholders in English", () => {
    const msg = getWhatsAppShareMessage({
      taskTitle: "Learner's Driving Licence",
      stateName: "Gujarat",
      pageUrl: "https://indiapaperworkguide.in/driving-licence-learner/gj",
      categorySlug: "vehicles",
      locale: "en",
      templateIndex: 0,
    });

    assert.ok(msg.includes("Learner's Driving Licence"));
    assert.ok(msg.includes("Gujarat"));
    assert.ok(msg.includes("utm_source=whatsapp"));
    assert.ok(msg.includes("utm_campaign=checklist_share"));
    assert.ok(!msg.includes("{title}"));
    assert.ok(!msg.includes("{state}"));
    assert.ok(!msg.includes("{url}"));
  });

  await t.test("4. getWhatsAppShareMessage returns authentic Hindi and Gujarati copy", () => {
    const hiMsg = getWhatsAppShareMessage({
      taskTitle: "पासपोर्ट नवीनीकरण",
      stateName: "गुजरात",
      pageUrl: "https://indiapaperworkguide.in/hi/passport-renewal",
      categorySlug: "identity",
      locale: "hi",
      templateIndex: 1,
    });
    assert.ok(hiMsg.includes("पासपोर्ट नवीनीकरण"));
    assert.ok(hiMsg.includes("सरकारी फीस"));

    const guMsg = getWhatsAppShareMessage({
      taskTitle: "ડ્રાઇવિંગ લાયસન્સ રિન્યુઅલ",
      stateName: "ગુજરાત",
      pageUrl: "https://indiapaperworkguide.in/gu/driving-licence-new",
      categorySlug: "vehicles",
      locale: "gu",
      templateIndex: 0,
    });
    assert.ok(guMsg.includes("ડ્રાઇવિંગ લાયસન્સ રિન્યુઅલ"));
    assert.ok(guMsg.includes("RTO"));
    assert.ok(guMsg.includes("ગુજરાત"));
  });

  await t.test("5. buildWhatsAppShareUrl creates valid wa.me URL with encoded message", () => {
    const url = buildWhatsAppShareUrl(
      "Vehicle RC Transfer",
      "Gujarat",
      "https://indiapaperworkguide.in/vehicle-rc-transfer",
      "vehicles",
      "en",
      2
    );

    assert.ok(url.startsWith("https://wa.me/?text="));
    const decoded = decodeURIComponent(url.replace("https://wa.me/?text=", ""));
    assert.ok(decoded.includes("Vehicle RC Transfer"));
    assert.ok(decoded.includes("Parivahan"));
    assert.ok(decoded.includes("utm_source=whatsapp"));
  });

  await t.test("6. Fallback mechanism handles unknown category or invalid index safely", () => {
    const fallbackMsg = getWhatsAppShareMessage({
      taskTitle: "Custom Civic Task",
      stateName: "All India",
      pageUrl: "https://indiapaperworkguide.in/custom-task",
      categorySlug: "unknown-non-existent-category",
      locale: "unknown-locale",
      templateIndex: 999,
    });

    assert.ok(fallbackMsg.includes("Custom Civic Task"));
    assert.ok(fallbackMsg.includes("All India"));
    assert.ok(fallbackMsg.includes("utm_source=whatsapp"));
  });
});
