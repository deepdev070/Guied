import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildTaskTitle, buildTaskDescription, generateTaskSeoMetadata } from "../src/lib/seo.ts";
import { loadAllTaskFiles, getAllStates } from "../src/lib/queries.ts";

describe("Prompt 73: Metadata Generator & Uniqueness Verification", () => {
  it("enforces title length <= 60 characters for national tasks", () => {
    const title = buildTaskTitle({
      taskName: "Driving Licence (Learner)",
      year: 2026,
    });

    assert.ok(title.length <= 60, `Title must be <= 60 chars, got ${title.length}`);
    assert.ok(title.includes("Driving Licence (Learner)"));
    assert.ok(title.includes("(2026)"));
  });

  it("enforces title length <= 60 characters for task + state combinations", () => {
    const title = buildTaskTitle({
      taskName: "Passport Renewal",
      stateName: "Gujarat",
      year: 2026,
    });

    assert.ok(title.length <= 60, `Title must be <= 60 chars, got ${title.length}`);
    assert.ok(title.includes("Passport Renewal in Gujarat"));
    assert.ok(title.includes("(2026)"));
  });

  it("handles unusually long task names without exceeding 60 characters", () => {
    const title = buildTaskTitle({
      taskName: "Application for Renewal of Expired Commercial Driving Licence",
      stateName: "Andaman and Nicobar Islands",
      year: 2026,
    });

    assert.ok(
      title.length <= 60,
      `Long title must never exceed 60 characters, got length ${title.length}: "${title}"`
    );
  });

  it("enforces meta description contains a number, a benefit, and length <= 155 chars", () => {
    const desc = buildTaskDescription({
      taskName: "Passport Renewal",
      stateName: "Gujarat",
      documentCount: 6,
      mandatoryFeeTotal: 1500,
    });

    assert.ok(desc.length <= 155, `Description must be <= 155 chars, got ${desc.length}`);
    // Must contain a number (either document count or fee in rupees)
    assert.ok(/\d+/.test(desc), "Meta description must contain a number");
    assert.ok(desc.includes("6") || desc.includes("1,500"), "Must include doc count or fee");
    // Must contain citizen benefit
    assert.ok(
      desc.toLowerCase().includes("avoid") ||
        desc.toLowerCase().includes("save") ||
        desc.toLowerCase().includes("zero"),
      "Meta description must highlight a citizen benefit"
    );
  });

  it("generates complete metadata object with canonical, OpenGraph, and Twitter tags", () => {
    const meta = generateTaskSeoMetadata({
      taskSlug: "passport-renewal",
      taskName: "Passport Renewal",
      stateSlug: "gujarat",
      stateName: "Gujarat",
      documentCount: 6,
      mandatoryFeeTotal: 1500,
      hasStateOverride: true,
      year: 2026,
    });

    assert.ok(meta.title, "Must generate title");
    assert.ok(meta.description, "Must generate description");
    assert.equal(
      meta.alternates?.canonical,
      "https://indiapaperworkguide.in/passport-renewal/gujarat"
    );
    assert.equal((meta.openGraph as Record<string, unknown>)?.type, "article");
    assert.equal((meta.openGraph as Record<string, unknown>)?.locale, "en_IN");
    assert.equal((meta.twitter as Record<string, unknown>)?.card, "summary_large_image");
  });

  it("FAILS ON DUPLICATES: all task and task+state titles and descriptions must be 100% unique", () => {
    const allTasks = loadAllTaskFiles();
    const allStates = getAllStates();

    const seenTitles = new Map<string, string>();
    const seenDescriptions = new Map<string, string>();

    let totalChecked = 0;

    for (const task of allTasks) {
      // 1. Check national page
      const nationalTitle = buildTaskTitle({ taskName: task.name, year: 2026 });
      const nationalDesc = buildTaskDescription({
        taskName: task.name,
        documentCount: task.national.documentRequirements.length,
        mandatoryFeeTotal: task.national.fees.reduce(
          (acc, f) => acc + (f.isOptional ? 0 : f.amount),
          0
        ),
      });

      const nationalPageUrl = `/${task.slug}`;

      assert.ok(
        nationalTitle.length <= 60,
        `National title too long for ${nationalPageUrl}: "${nationalTitle}"`
      );
      assert.ok(
        nationalDesc.length <= 155,
        `National description too long for ${nationalPageUrl}: "${nationalDesc}"`
      );

      if (seenTitles.has(nationalTitle)) {
        assert.fail(
          `Duplicate title detected!\nTitle: "${nationalTitle}"\nFirst seen on: ${seenTitles.get(nationalTitle)}\nDuplicate on: ${nationalPageUrl}`
        );
      }
      seenTitles.set(nationalTitle, nationalPageUrl);

      if (seenDescriptions.has(nationalDesc)) {
        assert.fail(
          `Duplicate description detected!\nDescription: "${nationalDesc}"\nFirst seen on: ${seenDescriptions.get(nationalDesc)}\nDuplicate on: ${nationalPageUrl}`
        );
      }
      seenDescriptions.set(nationalDesc, nationalPageUrl);
      totalChecked++;

      // 2. Check all 36 state variants
      for (const state of allStates) {
        const statePageUrl = `/${task.slug}/${state.slug}`;
        const stateTitle = buildTaskTitle({
          taskName: task.name,
          stateName: state.name,
          year: 2026,
        });
        const stateDesc = buildTaskDescription({
          taskName: task.name,
          stateName: state.name,
          documentCount: task.national.documentRequirements.length,
          mandatoryFeeTotal: task.national.fees.reduce(
            (acc, f) => acc + (f.isOptional ? 0 : f.amount),
            0
          ),
        });

        assert.ok(
          stateTitle.length <= 60,
          `State title too long (${stateTitle.length} > 60) for ${statePageUrl}: "${stateTitle}"`
        );
        assert.ok(
          stateDesc.length <= 155,
          `State description too long (${stateDesc.length} > 155) for ${statePageUrl}: "${stateDesc}"`
        );

        if (seenTitles.has(stateTitle)) {
          assert.fail(
            `Duplicate title detected!\nTitle: "${stateTitle}"\nFirst seen on: ${seenTitles.get(stateTitle)}\nDuplicate on: ${statePageUrl}`
          );
        }
        seenTitles.set(stateTitle, statePageUrl);

        if (seenDescriptions.has(stateDesc)) {
          assert.fail(
            `Duplicate description detected!\nDescription: "${stateDesc}"\nFirst seen on: ${seenDescriptions.get(stateDesc)}\nDuplicate on: ${statePageUrl}`
          );
        }
        seenDescriptions.set(stateDesc, statePageUrl);
        totalChecked++;
      }
    }

    // Verify we tested all 3 tasks * (1 national + 36 states) = 111 unique pages
    assert.equal(totalChecked, 3 * (1 + 36));
    assert.equal(seenTitles.size, totalChecked, "All titles must be unique");
    assert.equal(seenDescriptions.size, totalChecked, "All descriptions must be unique");
  });
});
