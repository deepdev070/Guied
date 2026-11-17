import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

describe("Phase 13: Troubleshooting Prompts Reference Playbook", () => {
  const filePath = path.resolve(process.cwd(), "docs/troubleshooting-prompts.md");

  it("ensures docs/troubleshooting-prompts.md exists", () => {
    assert.ok(fs.existsSync(filePath), "Troubleshooting playbook must exist");
  });

  it("documents all 10 troubleshooting prompts (Prompts 147–156)", () => {
    const content = fs.readFileSync(filePath, "utf-8");

    const requiredPrompts = [
      "PROMPT 147: Fix a build or type error",
      "PROMPT 148: UI looks wrong",
      "PROMPT 149: Review before I commit",
      "PROMPT 150: Refactor safely",
      "PROMPT 151: Explain this code to me",
      "PROMPT 152: Make it faster",
      "PROMPT 153: Mobile layout bug",
      "PROMPT 154: Database migration help",
      "PROMPT 155: Content accuracy double-check",
      "PROMPT 156: Plan before coding",
    ];

    for (const prompt of requiredPrompts) {
      assert.ok(content.includes(prompt), `Must document "${prompt}" in troubleshooting guide`);
    }
  });

  it("includes resolution procedures and light-theme / accessibility guidelines", () => {
    const content = fs.readFileSync(filePath, "utf-8");
    assert.ok(content.includes("Standard Resolution Procedure"));
    assert.ok(content.includes("light theme"));
    assert.ok(content.includes("WCAG 2.2 AA"));
    assert.ok(content.includes("NEEDS VERIFICATION"));
  });
});
