import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { TaskContentSchema } from "../src/types/content.ts";
import { getTaskContent, saveTaskContent } from "../src/lib/admin/task-storage.ts";

describe("Prompt 105: Guide Editor with Live Preview & Visual AppliesWhen Builder", () => {
  it("verifies AppliesWhenBuilder component exists and exports properly", () => {
    const builderPath = path.join(
      process.cwd(),
      "src/components/admin/editor/AppliesWhenBuilder.tsx"
    );
    assert.ok(fs.existsSync(builderPath), "AppliesWhenBuilder.tsx must exist");

    const content = fs.readFileSync(builderPath, "utf8");
    assert.ok(
      content.includes("export function AppliesWhenBuilder"),
      "Must export AppliesWhenBuilder"
    );
    assert.ok(content.includes("COMMON_FIELDS"), "Must define common criteria fields");
    assert.ok(content.includes("OPERATORS"), "Must define comparison operators");
    assert.ok(!content.includes("JSON.parse"), "Must not force users to input raw JSON");
  });

  it("verifies DocumentsEditor supports add, reorder, and remove", () => {
    const compPath = path.join(process.cwd(), "src/components/admin/editor/DocumentsEditor.tsx");
    assert.ok(fs.existsSync(compPath), "DocumentsEditor.tsx must exist");

    const content = fs.readFileSync(compPath, "utf8");
    assert.ok(content.includes("handleAddDoc"), "Must support adding documents");
    assert.ok(content.includes("handleRemoveDoc"), "Must support removing documents");
    assert.ok(content.includes("handleMove"), "Must support reordering documents");
    assert.ok(content.includes("AppliesWhenBuilder"), "Must integrate AppliesWhenBuilder");
  });

  it("verifies StepsEditor supports add, reorder, remove, and callouts", () => {
    const compPath = path.join(process.cwd(), "src/components/admin/editor/StepsEditor.tsx");
    assert.ok(fs.existsSync(compPath), "StepsEditor.tsx must exist");

    const content = fs.readFileSync(compPath, "utf8");
    assert.ok(content.includes("handleAddStep"), "Must support adding steps");
    assert.ok(content.includes("handleRemoveStep"), "Must support removing steps");
    assert.ok(content.includes("handleMove"), "Must support reordering steps");
    assert.ok(content.includes("calloutType"), "Must support callout types");
  });

  it("verifies GuideLivePreview uses the real portal components", () => {
    const previewPath = path.join(
      process.cwd(),
      "src/components/admin/editor/GuideLivePreview.tsx"
    );
    assert.ok(fs.existsSync(previewPath), "GuideLivePreview.tsx must exist");

    const content = fs.readFileSync(previewPath, "utf8");
    assert.ok(content.includes("AtAGlance"), "Must render real AtAGlance component");
    assert.ok(content.includes("DocumentSection"), "Must render real DocumentSection component");
    assert.ok(content.includes("StepsSection"), "Must render real StepsSection component");
    assert.ok(content.includes("FeesSection"), "Must render real FeesSection component");
    assert.ok(content.includes("MistakesSection"), "Must render real MistakesSection component");
    assert.ok(content.includes("FaqSection"), "Must render real FaqSection component");
    assert.ok(
      content.includes("OfficialLinksSection"),
      "Must render real OfficialLinksSection component"
    );
  });

  it("validates guides using Zod and produces friendly errors", () => {
    // Valid minimal guide
    const validGuide = {
      slug: "test-editor-slug",
      name: "Test Editor Service",
      categorySlug: "identity",
      national: {
        title: "Test Editor Guide Title",
        summary: "This is a comprehensive overview of the testing procedure for citizens.",
        estimatedTime: "15 days",
        difficulty: "easy",
        status: "DRAFT",
        steps: [
          {
            stepNumber: 1,
            title: "Step 1 Title",
            description: "Step 1 description details.",
            status: "PUBLISHED",
          },
        ],
        documentRequirements: [
          {
            name: "Document 1",
            requirementType: "required",
            status: "PUBLISHED",
          },
        ],
        fees: [{ label: "Test Fee", amount: 100, status: "PUBLISHED" }],
        officialLinks: [{ label: "Portal", url: "https://india.gov.in", status: "PUBLISHED" }],
        faqItems: [],
        rejectionReasons: [],
        sourceRefs: [],
      },
    };

    const parsed = TaskContentSchema.safeParse(validGuide);
    assert.equal(parsed.success, true, "Valid guide must pass Zod schema validation");

    // Invalid guide missing title and steps
    const invalidGuide = {
      slug: "INVALID SLUG WITH SPACES",
      name: "",
      categorySlug: "",
      national: {
        title: "",
        summary: "too short",
        steps: [],
        documentRequirements: [],
        officialLinks: [],
      },
    };

    const invalidParsed = TaskContentSchema.safeParse(invalidGuide);
    assert.equal(invalidParsed.success, false, "Invalid guide must fail Zod validation");
    assert.ok(invalidParsed.error && invalidParsed.error.issues.length >= 3);
  });

  it("verifies task storage reads real content and handles updates", async () => {
    const existing = getTaskContent("driving-licence-learner");
    assert.ok(existing, "driving-licence-learner.json must be loaded successfully");
    assert.equal(existing?.slug, "driving-licence-learner");
    assert.ok(existing?.national.steps.length >= 5);
    assert.ok(existing?.national.documentRequirements.length >= 5);

    const nonExistent = getTaskContent("non-existent-guide-xyz");
    assert.equal(nonExistent, null, "Non-existent guide must return null");

    // Test validation failure on invalid save
    const invalidSave = await saveTaskContent({ invalid: true });
    assert.equal(invalidSave.success, false, "Invalid payload must fail save");
    assert.ok(invalidSave.errors && invalidSave.errors.length > 0);
  });

  it("verifies admin editor pages exist and are protected", () => {
    const editPagePath = path.join(process.cwd(), "src/app/admin/guides/[slug]/page.tsx");
    assert.ok(fs.existsSync(editPagePath), "Edit guide page must exist");
    const editContent = fs.readFileSync(editPagePath, "utf8");
    assert.ok(editContent.includes("requireAdminSession"), "Must require admin session");

    const newPagePath = path.join(process.cwd(), "src/app/admin/guides/new/page.tsx");
    assert.ok(fs.existsSync(newPagePath), "New guide page must exist");
    const newContent = fs.readFileSync(newPagePath, "utf8");
    assert.ok(newContent.includes("requireAdminSession"), "Must require admin session");

    const apiSlugPath = path.join(process.cwd(), "src/app/api/admin/guides/[slug]/route.ts");
    assert.ok(fs.existsSync(apiSlugPath), "Guides slug API route must exist");

    const apiIndexPath = path.join(process.cwd(), "src/app/api/admin/guides/route.ts");
    assert.ok(fs.existsSync(apiIndexPath), "Guides index API route must exist");
  });
});
