import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  splitIntoSentences,
  countWords,
  suggestSimplerWording,
  reviewPlainLanguage,
} from "../scripts/check-plain-language.ts";

describe("Prompt 100: Text Size Control and Plain-Language Readability", () => {
  it("1. TextSizeControl: exports 3 scales (A- 100%, A 115%, A+ 130%) and accessible controls", () => {
    const compPath = path.join(process.cwd(), "src/components/layout/TextSizeControl.tsx");
    assert.ok(fs.existsSync(compPath), "TextSizeControl.tsx must exist");

    const content = fs.readFileSync(compPath, "utf8");
    assert.ok(content.includes('role="group"'), "Must define role='group'");
    assert.ok(
      content.includes('aria-label="Text size control"'),
      "Must have accessible group aria-label"
    );
    assert.ok(content.includes('"100"'), "Must support 100% scale (A-)");
    assert.ok(content.includes('"115"'), "Must support 115% scale (A)");
    assert.ok(content.includes('"130"'), "Must support 130% scale (A+)");
    assert.ok(content.includes("aria-pressed="), "Must set aria-pressed state on scale buttons");
    assert.ok(
      content.includes("civic_text_scale"),
      "Must persist choice in localStorage and cookie"
    );
    assert.ok(
      content.includes('setAttribute("data-text-scale"'),
      "Must set data-text-scale attribute on root html element"
    );
  });

  it("2. CSS Typography Scaling: globals.css scales text up to 130% via data-text-scale", () => {
    const cssPath = path.join(process.cwd(), "src/app/globals.css");
    const content = fs.readFileSync(cssPath, "utf8");

    assert.ok(content.includes("--text-scale: 1;"), "Must define default --text-scale: 1");
    assert.ok(
      content.includes('html[data-text-scale="115"]') && content.includes("--text-scale: 1.15;"),
      "Must scale to 1.15 for 115%"
    );
    assert.ok(
      content.includes('html[data-text-scale="130"]') && content.includes("--text-scale: 1.3;"),
      "Must scale to 1.3 for 130%"
    );
    assert.ok(
      content.includes("calc(17px * var(--text-scale, 1))"),
      "Body font size must scale with var(--text-scale, 1)"
    );
    assert.ok(
      content.includes(".text-h1") && content.includes("var(--text-scale, 1)"),
      "Headings must scale proportionally with text scale"
    );
  });

  it("3. Header and MobileNav Integration: TextSizeControl is available on both desktop and mobile", () => {
    const headerPath = path.join(process.cwd(), "src/components/layout/Header.tsx");
    const mobilePath = path.join(process.cwd(), "src/components/layout/MobileNav.tsx");
    const layoutPath = path.join(process.cwd(), "src/app/layout.tsx");

    const headerContent = fs.readFileSync(headerPath, "utf8");
    const mobileContent = fs.readFileSync(mobilePath, "utf8");
    const layoutContent = fs.readFileSync(layoutPath, "utf8");

    assert.ok(headerContent.includes("<TextSizeControl"), "Header must include TextSizeControl");
    assert.ok(mobileContent.includes("<TextSizeControl"), "MobileNav must include TextSizeControl");
    assert.ok(
      layoutContent.includes("civic_text_scale"),
      "Root layout must restore data-text-scale in <head> to eliminate FOUC"
    );
  });

  it("4. Plain-Language Review Script: sentence splitting and word count logic", () => {
    // Sentence splitting with abbreviations
    const sample =
      "Visit passportindia.gov.in (e.g. online portal). Pay Rs. 1500 fee. Do not delay!";
    const sentences = splitIntoSentences(sample);
    assert.equal(sentences.length, 3);
    assert.equal(sentences[0], "Visit passportindia.gov.in (e.g. online portal).");
    assert.equal(sentences[1], "Pay Rs. 1500 fee.");
    assert.equal(sentences[2], "Do not delay!");

    // Word counting
    assert.equal(countWords("Pay Rs. 1500 fee."), 4);
    assert.equal(countWords("This is a simple civic paperwork sentence for citizens."), 9);
  });

  it("5. Simpler Wording Suggestions: identifies bureaucratic phrases and suggests splitting points", () => {
    const bureaucratic =
      "In order to obtain a licence prior to the deadline, the citizen is required to furnish proof.";
    const suggestions = suggestSimplerWording(bureaucratic);

    assert.ok(
      suggestions.some((s) => s.includes('Replace "in order to" with simpler word "to"')),
      "Must suggest replacing 'in order to'"
    );
    assert.ok(
      suggestions.some((s) => s.includes('Replace "prior to" with simpler word "before"')),
      "Must suggest replacing 'prior to'"
    );
    assert.ok(
      suggestions.some((s) => s.includes('Replace "is required to" with simpler word "must"')),
      "Must suggest replacing 'is required to'"
    );
    assert.ok(
      suggestions.some((s) => s.includes('Replace "furnish" with simpler word "provide"')),
      "Must suggest replacing 'furnish'"
    );
  });

  it("6. Task Content Plain-Language Compliance: all tasks achieve 100% compliance with <= 25 words rule", () => {
    const tasksDir = path.join(process.cwd(), "src/content/tasks");
    const report = reviewPlainLanguage(tasksDir);

    assert.ok(report.totalSentences > 400, "Should scan over 400 total sentences across tasks");
    assert.equal(
      report.flaggedSentences,
      0,
      `All sentences must be <= 25 words. Found ${report.flaggedSentences} flagged: ${JSON.stringify(report.issues)}`
    );
    assert.equal(report.complianceRate, 100, "Readability compliance rate must be 100%");
  });
});
