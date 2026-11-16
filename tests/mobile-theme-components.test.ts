import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

describe("Prompt 119: Mobile Theme Tokens & Base UI Components (React Native)", () => {
  const mobileDir = path.join(process.cwd(), "apps", "mobile");
  const uiDir = path.join(mobileDir, "components", "ui");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let tokens: any;

  before(async () => {
    const tokensPath = path.join(mobileDir, "theme", "tokens.ts");
    tokens = await import(tokensPath);
  });

  test("1. Design tokens define strict LIGHT theme colors", () => {
    const { colors } = tokens;
    assert.equal(colors.primary, "#2563EB");
    assert.equal(colors.surface, "#FFFFFF");
    assert.equal(colors.background, "#F8FAFC");
    assert.equal(colors.text, "#0F172A");
    assert.equal(colors.success, "#16A34A");
    assert.equal(colors.warning, "#D97706");
    assert.equal(colors.error, "#DC2626");
    assert.equal(colors.border, "#E2E8F0");
  });

  test("2. Design tokens define typography scale and spacing", () => {
    const { typography, spacing } = tokens;
    assert.equal(typography.h1.fontSize, 24);
    assert.equal(typography.h2.fontSize, 20);
    assert.equal(typography.body.fontSize, 15);
    assert.equal(typography.caption.fontSize, 11);

    assert.equal(spacing.xs, 4);
    assert.equal(spacing.sm, 8);
    assert.equal(spacing.md, 12);
    assert.equal(spacing.lg, 16);
    assert.equal(spacing.xl, 20);
  });

  test("3. Design tokens enforce 44pt minimum touch target and 48px search field", () => {
    const { layout } = tokens;
    assert.ok(layout.minTouchTarget >= 44, "Must enforce >= 44pt touch target");
    assert.ok(layout.searchFieldHeight >= 48, "SearchField must be >= 48px");
    assert.ok(layout.buttonHeightMd >= 44, "Button MD must be >= 44pt");
    assert.ok(layout.buttonHeightLg >= 48, "Button LG must be >= 48pt");
  });

  test("4. All required base components exist in apps/mobile/components/ui", () => {
    const required = [
      "Button.tsx",
      "Card.tsx",
      "Badge.tsx",
      "Callout.tsx",
      "StepList.tsx",
      "ChecklistItem.tsx",
      "SearchField.tsx",
      "index.ts",
    ];

    for (const file of required) {
      const filePath = path.join(uiDir, file);
      assert.ok(fs.existsSync(filePath), `Component file ${file} must exist`);
      const content = fs.readFileSync(filePath, "utf-8");
      assert.ok(content.length > 100, `Component ${file} must not be empty`);
    }
  });

  test("5. Button component implements variants and 44pt minimum touch target", () => {
    const content = fs.readFileSync(path.join(uiDir, "Button.tsx"), "utf-8");
    assert.match(content, /accessibilityRole="button"/);
    assert.match(content, /minTouchTarget/);
    assert.match(content, /primary:/);
    assert.match(content, /secondary:/);
    assert.match(content, /outline:/);
    assert.match(content, /ghost:/);
    assert.match(content, /danger:/);
  });

  test("6. Card component implements light surface, 1px border, and interactive touch area", () => {
    const content = fs.readFileSync(path.join(uiDir, "Card.tsx"), "utf-8");
    assert.match(content, /colors\.surface/);
    assert.match(content, /colors\.border/);
    assert.match(content, /minTouchTarget/);
  });

  test("7. Badge component provides info, success, warning, error, neutral variants", () => {
    const content = fs.readFileSync(path.join(uiDir, "Badge.tsx"), "utf-8");
    assert.match(content, /info:/);
    assert.match(content, /success:/);
    assert.match(content, /warning:/);
    assert.match(content, /error:/);
    assert.match(content, /neutral:/);
  });

  test("8. Callout component implements 4px left accent border and status colors", () => {
    const content = fs.readFileSync(path.join(uiDir, "Callout.tsx"), "utf-8");
    assert.match(content, /borderLeftWidth:\s*4/);
    assert.match(content, /info:/);
    assert.match(content, /warning:/);
    assert.match(content, /success:/);
    assert.match(content, /error:/);
  });

  test("9. StepList component formats sequential numbered steps and connecting indicators", () => {
    const content = fs.readFileSync(path.join(uiDir, "StepList.tsx"), "utf-8");
    assert.match(content, /stepNumber/);
    assert.match(content, /circleText/);
    assert.match(content, /connector/);
    assert.match(content, /Online/);
    assert.match(content, /In-Person/);
  });

  test("10. ChecklistItem implements accessible checkbox and 44pt touch area", () => {
    const content = fs.readFileSync(path.join(uiDir, "ChecklistItem.tsx"), "utf-8");
    assert.match(content, /accessibilityRole="checkbox"/);
    assert.match(content, /minTouchTarget/);
    assert.match(content, /isMandatory/);
    assert.match(content, /onToggle/);
  });

  test("11. SearchField implements 48px height, clear button, and label above field", () => {
    const content = fs.readFileSync(path.join(uiDir, "SearchField.tsx"), "utf-8");
    assert.match(content, /searchFieldHeight/);
    assert.match(content, /styles\.label/);
    assert.match(content, /clearButton/);
    assert.match(content, /accessibilityRole="button"/);
    assert.match(content, /errorText/);
    assert.match(content, /helperText/);
  });
});
