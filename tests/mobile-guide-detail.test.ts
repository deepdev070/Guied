import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

describe("Prompt 122: Guide Detail Screen (React Native)", () => {
  const mobileDir = path.join(process.cwd(), "apps", "mobile");
  const taskDetailPath = path.join(mobileDir, "app", "task", "[slug].tsx");

  test("1. Guide detail screen file exists at apps/mobile/app/task/[slug].tsx", () => {
    assert.ok(fs.existsSync(taskDetailPath), "Task detail screen file must exist");
  });

  test("2. Implements header and summary card with statutory fee, time, and doc count", () => {
    const content = fs.readFileSync(taskDetailPath, "utf-8");

    assert.match(content, /summaryCard/, "Must include summary card");
    assert.match(content, /STATUTORY FEE/i, "Must display statutory fee spec");
    assert.match(content, /ESTIMATED TIME/i, "Must display estimated time spec");
    assert.match(content, /DOCUMENTS/i, "Must display document count spec");
    assert.match(content, /Verified on/i, "Must include verification date citation");
    assert.match(
      content,
      /Source:\s*\{guide\.department\}/,
      "Must cite official government department"
    );
  });

  test("3. Implements state portal banner with official authority and launch context", () => {
    const content = fs.readFileSync(taskDetailPath, "utf-8");

    assert.match(
      content,
      /Official Portal:\s*\$\{guide\.stateName\}/,
      "Must include official state portal Callout"
    );
    assert.match(
      content,
      /verified specifically for\s*\{guide\.stateName\}/,
      "Must reference state verification context"
    );
  });

  test("4. Implements interactive documents checklist with checkable items and progress indicator", () => {
    const content = fs.readFileSync(taskDetailPath, "utf-8");

    assert.match(content, /ChecklistItem/, "Must render ChecklistItem components");
    assert.match(content, /checkedDocs/, "Must track checked document state");
    assert.match(content, /handleToggleDoc/, "Must provide check toggle handler");
    assert.match(content, /progressText/, "Must show progress count (e.g. X of Y ready)");
  });

  test("5. Implements step-by-step procedure with StepList", () => {
    const content = fs.readFileSync(taskDetailPath, "utf-8");

    assert.match(content, /StepList/, "Must render StepList component");
    assert.match(content, /Step-by-Step Procedure/i, "Must have procedure section title");
  });

  test("6. Implements statutory fees breakdown with total calculation and legal disclaimer", () => {
    const content = fs.readFileSync(taskDetailPath, "utf-8");

    assert.match(
      content,
      /Statutory Fees Breakdown/i,
      "Must include statutory fees breakdown title"
    );
    assert.match(content, /feeTotalAmount/, "Must display calculated total fee");
    assert.match(
      content,
      /Central Motor Vehicles Rules|Statutory fees are fixed/i,
      "Must include legal fee rule disclaimer"
    );
  });

  test("7. Implements common mistakes to avoid section with Callout warnings", () => {
    const content = fs.readFileSync(taskDetailPath, "utf-8");

    assert.match(
      content,
      /Common Mistakes to Avoid/i,
      "Must include common mistakes section title"
    );
    assert.match(
      content,
      /Callout[\s\S]*?variant="warning"/,
      "Must render Callouts with warning variant"
    );
  });

  test("8. Implements FAQs accordion section with expand and collapse toggle", () => {
    const content = fs.readFileSync(taskDetailPath, "utf-8");

    assert.match(content, /Frequently Asked Questions/i, "Must include FAQ title");
    assert.match(content, /expandedFaq/, "Must track expanded FAQ items");
    assert.match(content, /faqToggle/, "Must provide toggle indicator");
  });

  test("9. Implements official government links with Linking.openURL", () => {
    const content = fs.readFileSync(taskDetailPath, "utf-8");

    assert.match(
      content,
      /Official Government Links/i,
      "Must include official links section title"
    );
    assert.match(content, /Linking\.openURL/, "Must invoke Linking.openURL on link press");
  });

  test("10. Implements sticky bottom bar with Save Checklist and Share actions", () => {
    const content = fs.readFileSync(taskDetailPath, "utf-8");

    assert.match(content, /stickyBar/, "Must define sticky bottom bar");
    assert.match(content, /isSaved/, "Must track saved state");
    assert.match(
      content,
      /Save Checklist|Checklist Saved/i,
      "Must have save checklist toggle button"
    );
    assert.match(content, /Share\.share/, "Must call Share.share on share press");
  });

  test("11. Complies with design tokens, minTouchTarget >= 44pt, and strict light theme", () => {
    const content = fs.readFileSync(taskDetailPath, "utf-8");

    assert.match(content, /layout\.minTouchTarget/, "Must respect minTouchTarget layout token");
    assert.match(content, /colors\.primary/, "Must use primary token");
    assert.match(content, /colors\.surface/, "Must use light surface token");
    assert.doesNotMatch(content, /darkMode/i, "Must not reference dark mode");
  });
});
