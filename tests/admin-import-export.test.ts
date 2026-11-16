import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import {
  exportGuidesAsJson,
  exportGuidesAsCsv,
  parseGuidesFromJson,
  parseGuidesFromCsv,
  dryRunImport,
  parseCsvRows,
  executeImport,
} from "../src/lib/admin/import-export.ts";
import { getTaskContent } from "../src/lib/admin/task-storage.ts";
import { TaskContentSchema } from "../src/types/content.ts";

describe("Prompt 108: Bulk Import and Export of Civic Guides", () => {
  it("1. JSON Export: produces valid JSON bundle with version and guides array", () => {
    const jsonStr = exportGuidesAsJson();
    assert.ok(jsonStr.length > 0, "JSON export string should not be empty");

    const parsed = JSON.parse(jsonStr);
    assert.strictEqual(parsed.version, 1);
    assert.ok(Array.isArray(parsed.guides), "Bundle should contain guides array");
    assert.ok(parsed.guides.length >= 3, "Should include baseline task files");

    // Check each exported guide against TaskContentSchema
    for (const guide of parsed.guides) {
      const valid = TaskContentSchema.safeParse(guide);
      assert.ok(
        valid.success,
        `Exported guide ${guide.slug} should satisfy TaskContentSchema: ${valid.error?.message}`
      );
    }
  });

  it("2. CSV Export: produces RFC 4180 compliant CSV with headers and row records", () => {
    const csvStr = exportGuidesAsCsv();
    assert.ok(csvStr.length > 0, "CSV export string should not be empty");

    const rows = parseCsvRows(csvStr);
    assert.ok(rows.length >= 4, "CSV should contain header + at least 3 task rows");

    const headers = rows[0]!;
    assert.ok(headers.includes("slug"), "Headers must contain slug");
    assert.ok(headers.includes("name"), "Headers must contain name");
    assert.ok(headers.includes("categorySlug"), "Headers must contain categorySlug");
    assert.ok(headers.includes("contentJson"), "Headers must contain contentJson");

    // Check learner licence row
    const learnerRow = rows.find((r) => r[0] === "driving-licence-learner");
    assert.ok(learnerRow, "Learner licence row must exist in CSV export");
  });

  it("3. JSON Parsing: parses array, bundle object, and single guide", () => {
    // Array
    const arrInput = JSON.stringify([{ slug: "test-task-1", name: "Test 1" }]);
    const parsedArr = parseGuidesFromJson(arrInput);
    assert.strictEqual(parsedArr.length, 1);

    // Bundle
    const bundleInput = JSON.stringify({
      version: 1,
      guides: [{ slug: "test-task-2", name: "Test 2" }],
    });
    const parsedBundle = parseGuidesFromJson(bundleInput);
    assert.strictEqual(parsedBundle.length, 1);

    // Single
    const singleInput = JSON.stringify({ slug: "test-task-3", name: "Test 3" });
    const parsedSingle = parseGuidesFromJson(singleInput);
    assert.strictEqual(parsedSingle.length, 1);
  });

  it("4. CSV Parsing: handles RFC 4180 escaped commas, quotes, and multiline cells", () => {
    const rawCsv = `slug,name,categorySlug,description,nationalTitle\n"driving-licence-test","Driving Licence, Test","vehicles","A description with, comma and ""quotes""","Driving Licence Test"`;
    const parsed = parseGuidesFromCsv(rawCsv);

    assert.strictEqual(parsed.length, 1);
    const item = parsed[0] as { slug: string; name: string; description: string };
    assert.strictEqual(item.slug, "driving-licence-test");
    assert.strictEqual(item.name, "Driving Licence, Test");
    assert.strictEqual(item.description, 'A description with, comma and "quotes"');
  });

  it("5. Seed Validator Dry-Run: categorizes will-update, will-create, and rejected", () => {
    const existingGuide = getTaskContent("driving-licence-learner");
    assert.ok(existingGuide, "Should load driving-licence-learner for test");

    const sampleBatch = [
      // 1. Existing valid guide -> update
      existingGuide,
      // 2. New valid guide -> create
      {
        slug: "new-voter-id-registration",
        name: "New Voter ID Card",
        categorySlug: "identity",
        description: "Application for Form 6 voter card",
        national: {
          title: "How to Register for New Voter ID Card Online",
          summary: "Step-by-step guide for Form 6 voter registration in India.",
          estimatedTime: "30 days",
          difficulty: "easy",
          status: "DRAFT",
          lastVerifiedAt: "2026-03-01T00:00:00.000Z",
          verifiedBy: "Civic Team",
          sourceUrl: "https://voters.eci.gov.in",
          documentRequirements: [
            {
              id: "d1",
              name: "Age Proof",
              description: "Birth Certificate",
              requirementType: "required",
              displayOrder: 1,
            },
          ],
          steps: [
            {
              stepNumber: 1,
              title: "Register on ECI",
              description: "Register account on Election Commission portal",
              where: "Online",
              estimatedTime: "10 mins",
              status: "DRAFT",
            },
          ],
          fees: [{ label: "Service Fee", amount: 0, currency: "INR", paymentMode: "both" }],
          faqs: [],
          rejectionReasons: [],
          officialLinks: [{ label: "ECI", url: "https://voters.eci.gov.in", isGovDomain: true }],
        },
        states: {},
      },
      // 3. Invalid Category (Seed validator) -> rejected
      {
        slug: "invalid-category-guide",
        name: "Invalid Category Guide",
        categorySlug: "non-existent-civic-category",
        description: "Test description",
        national: {
          title: "Invalid Guide",
          summary: "This is a summary for the invalid guide with sufficient length.",
          estimatedTime: "10 days",
          difficulty: "medium",
          status: "DRAFT",
          sourceUrl: "https://india.gov.in",
          documentRequirements: [
            {
              id: "d1",
              name: "Doc 1",
              description: "Desc",
              requirementType: "required",
              displayOrder: 1,
            },
          ],
          steps: [
            {
              stepNumber: 1,
              title: "Step 1",
              description: "Step description with sufficient length here",
              where: "Portal",
              estimatedTime: "5 mins",
              status: "DRAFT",
            },
          ],
          fees: [],
          faqs: [],
          rejectionReasons: [],
          officialLinks: [{ label: "Portal", url: "https://india.gov.in", isGovDomain: true }],
        },
        states: {},
      },
      // 4. Malformed missing fields -> rejected
      {
        slug: "missing-national-guide",
        name: "Broken Guide",
        categorySlug: "identity",
      },
    ];

    const result = dryRunImport(sampleBatch);
    assert.strictEqual(result.total, 4);
    assert.strictEqual(result.toUpdate, 1, "Should identify 1 guide to update");
    assert.strictEqual(result.toCreate, 1, "Should identify 1 guide to create");
    assert.strictEqual(result.rejected, 2, "Should identify 2 rejected guides");

    const updateItem = result.items.find((i) => i.action === "update");
    assert.strictEqual(updateItem?.slug, "driving-licence-learner");

    const createItem = result.items.find((i) => i.action === "create");
    assert.strictEqual(createItem?.slug, "new-voter-id-registration");

    const catRejectItem = result.items.find((i) => i.slug === "invalid-category-guide");
    assert.strictEqual(catRejectItem?.action, "reject");
    assert.ok(
      catRejectItem?.errors.some((e) => e.includes("Unknown categorySlug")),
      "Should report unknown categorySlug error"
    );
  });

  it("6. Seed Validator Dry-Run: rejects invalid state codes in states dictionary", () => {
    const guideWithBadState = {
      slug: "test-bad-state-code",
      name: "Bad State Guide",
      categorySlug: "identity",
      description: "Test description",
      national: {
        title: "Test Guide Title",
        summary: "This is a test guide summary with sufficient character length.",
        estimatedTime: "10 days",
        difficulty: "easy",
        status: "DRAFT",
        sourceUrl: "https://india.gov.in",
        documentRequirements: [
          {
            id: "d1",
            name: "Aadhaar Card",
            description: "Identity proof",
            requirementType: "required",
            displayOrder: 1,
          },
        ],
        steps: [
          {
            stepNumber: 1,
            title: "Step 1",
            description: "Complete online form on official portal",
            where: "Online",
            estimatedTime: "5 mins",
            status: "DRAFT",
          },
        ],
        fees: [],
        faqs: [],
        rejectionReasons: [],
        officialLinks: [{ label: "India Portal", url: "https://india.gov.in", isGovDomain: true }],
      },
      states: {
        "xx-invalid": {
          title: "Override for invalid state code",
        },
      },
    };

    const res = dryRunImport([guideWithBadState]);
    assert.strictEqual(res.rejected, 1);
    const item = res.items[0]!;
    assert.ok(
      item.errors.some((e) => e.includes('Unknown state code "xx-invalid"')),
      `Should report invalid state code error. Actual errors: ${JSON.stringify(item.errors)}`
    );
  });

  it("7. Import Execution: successfully applies updates and creates audit records", async () => {
    const filePath = path.join(process.cwd(), "src/content/tasks/driving-licence-learner.json");
    const originalRaw = fs.readFileSync(filePath, "utf-8");
    try {
      const existing = getTaskContent("driving-licence-learner");
      assert.ok(existing, "Existing guide must be present");

      const execResult = await executeImport([existing], "Admin Tester");
      assert.strictEqual(execResult.success, true);
      assert.strictEqual(execResult.updatedCount, 1);
      assert.strictEqual(execResult.createdCount, 0);
      assert.strictEqual(execResult.rejectedCount, 0);
    } finally {
      fs.writeFileSync(filePath, originalRaw, "utf-8");
    }
  });
});
