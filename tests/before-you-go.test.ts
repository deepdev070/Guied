import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { BeforeYouGoSchema, type BeforeYouGo } from "../src/types/content.ts";
import { getDefaultBeforeYouGoItems } from "../src/lib/before-you-go.ts";

describe("Prompt 72: Smart 'Before You Go' Summary Mini Card", () => {
  it("validates BeforeYouGoSchema with 5 checks", () => {
    const sample: BeforeYouGo = {
      title: "Before you leave home",
      subtitle: "5 final checks before heading to the official centre",
      items: [
        {
          id: "originals",
          title: "Original Documents",
          description: "Carry original Aadhaar and marksheets.",
        },
        { id: "photocopies", title: "Self-Attested Photocopies", description: "2 signed copies." },
        { id: "photos", title: "Passport Photos", description: "35x45mm photographs." },
        { id: "payment", title: "Payment Mode", description: "Active UPI / Debit card." },
        {
          id: "printout",
          title: "Appointment Slip",
          description: "Printed slot booking confirmation.",
        },
      ],
    };

    const parsed = BeforeYouGoSchema.parse(sample);
    assert.equal(parsed.items?.length, 5);
  });

  it("generates exactly 5 sensible default checks covering originals, photocopies, photos, payment, printout", () => {
    const defaults = getDefaultBeforeYouGoItems("Driving Licence");
    assert.equal(defaults.length, 5, "Must provide exactly 5 checks");

    const ids = defaults.map((d) => d.id);
    assert.ok(ids.includes("originals"), "Must include originals check");
    assert.ok(ids.includes("photocopies"), "Must include photocopies check");
    assert.ok(ids.includes("photos"), "Must include photos check");
    assert.ok(ids.includes("payment"), "Must include payment check");
    assert.ok(ids.includes("printout"), "Must include appointment printout check");

    for (const item of defaults) {
      assert.ok(item.title.length > 5, "Check title must be informative");
      assert.ok(item.description.length > 15, "Check description must provide actionable guidance");
      assert.ok(item.icon, "Check must have an icon identifier");
    }
  });

  it("verifies task content JSON files support custom beforeYouGo overrides", () => {
    const passportData = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), "src/content/tasks/passport-renewal.json"), "utf-8")
    );
    assert.ok(passportData.national.beforeYouGo, "passport-renewal.json must have beforeYouGo");
    assert.equal(passportData.national.beforeYouGo.items.length, 5);
    assert.ok(passportData.national.beforeYouGo.title.includes("Passport Seva Kendra"));
  });

  it("verifies BeforeYouGoCard component implementation", () => {
    const cardPath = path.join(process.cwd(), "src/components/task/BeforeYouGoCard.tsx");
    assert.ok(fs.existsSync(cardPath), "BeforeYouGoCard.tsx must exist");

    const code = fs.readFileSync(cardPath, "utf-8");
    assert.ok(code.includes("getDefaultBeforeYouGoItems"), "Must implement default checks");
    assert.ok(code.includes("toggleCheck"), "Must support interactive checklist ticking");
    assert.ok(code.includes("Checked"), "Must show checked progress");
    assert.ok(code.includes("Reset checks"), "Must allow resetting checks");
  });

  it("verifies TaskPageView renders BeforeYouGoCard at the end of each guide", () => {
    const taskPageCode = fs.readFileSync(
      path.join(process.cwd(), "src/components/task/TaskPageView.tsx"),
      "utf-8"
    );
    assert.ok(
      taskPageCode.includes("BeforeYouGoCard"),
      "TaskPageView must import and render BeforeYouGoCard"
    );
    assert.ok(
      taskPageCode.includes("beforeYouGo={variant.beforeYouGo}"),
      "TaskPageView must pass variant.beforeYouGo"
    );
  });
});
