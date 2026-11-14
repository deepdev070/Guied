import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { DocumentSpecSchema } from "../src/types/content.ts";

describe("Prompt 67: Document Specification Cards & Technical Rules", () => {
  it("validates DocumentSpecSchema with technical rules and official URL", () => {
    const validSpec = {
      dimensions: "35mm × 45mm (80% face coverage)",
      backgroundColor: "Plain white background without shadows",
      maxFileSizeBytes: 204800,
      maxFileSizeLabel: "20 KB to 200 KB",
      acceptedFormats: ["JPEG", "JPG"],
      diagramType: "photo" as const,
      guidanceUrl: "https://www.passportindia.gov.in",
      instructions: [
        "Face should take up 70% to 80% of the vertical frame",
        "Both ears must be clearly visible without hair covering them",
      ],
    };

    const parsed = DocumentSpecSchema.safeParse(validSpec);
    assert.strictEqual(parsed.success, true, "Valid spec should pass validation");
    if (parsed.success) {
      assert.strictEqual(parsed.data.diagramType, "photo");
      assert.strictEqual(parsed.data.acceptedFormats.length, 2);
    }
  });

  it("verifies task content JSON files include document specifications", () => {
    const passportRaw = fs.readFileSync(
      path.join(process.cwd(), "src/content/tasks/passport-renewal.json"),
      "utf-8"
    );
    const passportTask = JSON.parse(passportRaw);
    const photoDoc = passportTask.national.documentRequirements.find(
      (d: { specs?: { diagramType?: string } }) => d.specs?.diagramType === "photo"
    );

    assert.ok(photoDoc, "Passport renewal must include a photo document with specs");
    assert.ok(photoDoc.specs.dimensions.includes("35mm"), "Must specify 35mm photo width");
    assert.ok(photoDoc.specs.backgroundColor.includes("white"), "Must specify white background");
    assert.ok(
      photoDoc.specs.guidanceUrl.includes("passportindia.gov.in"),
      "Must link to official portal"
    );

    const dlRaw = fs.readFileSync(
      path.join(process.cwd(), "src/content/tasks/driving-licence-learner.json"),
      "utf-8"
    );
    const dlTask = JSON.parse(dlRaw);
    const signatureDoc = dlTask.national.documentRequirements.find(
      (d: { specs?: { diagramType?: string } }) => d.specs?.diagramType === "signature"
    );

    assert.ok(signatureDoc, "Learner licence must include a signature document with specs");
    assert.ok(signatureDoc.specs.maxFileSizeLabel, "Must specify max file size label");
    assert.strictEqual(signatureDoc.specs.diagramType, "signature");
  });

  it("verifies SpecCard component source implements diagram, details, and official guidance link", () => {
    const cardPath = path.join(process.cwd(), "src/components/ui/SpecCard.tsx");
    assert.ok(fs.existsSync(cardPath), "SpecCard.tsx must exist");

    const content = fs.readFileSync(cardPath, "utf-8");
    assert.ok(content.includes("spec-diagram-photo"), "Must implement photo diagram");
    assert.ok(content.includes("spec-diagram-signature"), "Must implement signature diagram");
    assert.ok(content.includes("dimensions"), "Must render dimensions");
    assert.ok(content.includes("backgroundColor"), "Must render background color");
    assert.ok(content.includes("guidanceUrl"), "Must render link to official upload guidance");
  });

  it("verifies ChecklistItem and DocumentSection integrate SpecCard", () => {
    const checklistItemPath = path.join(process.cwd(), "src/components/ui/ChecklistItem.tsx");
    const docSectionPath = path.join(process.cwd(), "src/components/task/DocumentSection.tsx");

    assert.ok(
      fs.readFileSync(checklistItemPath, "utf-8").includes("<SpecCard"),
      "ChecklistItem must render SpecCard when specs is provided"
    );
    assert.ok(
      fs.readFileSync(docSectionPath, "utf-8").includes("specs={doc.specs}"),
      "DocumentSection must forward specs to ChecklistItem"
    );
  });
});
