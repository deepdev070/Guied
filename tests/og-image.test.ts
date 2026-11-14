import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { createOgCardElement, OG_IMAGE_CONTENT_TYPE, OG_IMAGE_SIZE } from "../src/lib/og-image.ts";

describe("Prompt 78: Dynamic OpenGraph Image Generator", () => {
  it("enforces standard 1200x630 dimensions and image/png MIME type", () => {
    assert.equal(OG_IMAGE_SIZE.width, 1200);
    assert.equal(OG_IMAGE_SIZE.height, 630);
    assert.equal(OG_IMAGE_CONTENT_TYPE, "image/png");
  });

  it("builds light branded card element with task name, 3 facts, and national badge", () => {
    const el = createOgCardElement({
      taskName: "Passport Renewal",
      estimatedTime: "15-30 days",
      cost: "₹1,500",
      documentCount: 6,
      year: 2026,
    });

    assert.ok(el, "Element must be generated");
    assert.equal(el.type, "div");
    const style = (el.props as { style: Record<string, unknown> }).style;
    assert.equal(style.width, "1200px");
    assert.equal(style.height, "630px");
    assert.equal(style.backgroundColor, "#F7F9FC");

    // Convert element tree to JSON string to inspect text contents
    const json = JSON.stringify(el);
    assert.ok(json.includes("Passport Renewal"), "Must include task name");
    assert.ok(json.includes("National Guide • All India"), "Must show national guide badge");
    assert.ok(json.includes("15-30 days"), "Must include fact 1: estimated time");
    assert.ok(json.includes("₹1,500"), "Must include fact 2: statutory cost");
    assert.ok(json.includes("6 Required"), "Must include fact 3: document count");
    assert.ok(json.includes("#F59E0B"), "Must include saffron tricolor segment");
    assert.ok(json.includes("#15803D"), "Must include green tricolor segment");
  });

  it("builds light branded card element with state-specific badge", () => {
    const el = createOgCardElement({
      taskName: "Driving Licence (Learner)",
      stateName: "Gujarat",
      estimatedTime: "Same day (Online LL Test)",
      cost: "₹200",
      documentCount: 4,
      year: 2026,
    });

    const json = JSON.stringify(el);
    assert.ok(json.includes("Driving Licence (Learner)"));
    assert.ok(json.includes("Gujarat • State Guide"), "Must show Gujarat state badge");
    assert.ok(json.includes("Same day"), "Must show state-specific time");
    assert.ok(json.includes("₹200"), "Must show state-specific cost");
    assert.ok(json.includes("4 Required"), "Must show state-specific doc count");
  });

  it("handles fallback defaults gracefully when optional properties are omitted", () => {
    const el = createOgCardElement({
      taskName: "PAN Card Application",
    });

    const json = JSON.stringify(el);
    assert.ok(json.includes("PAN Card Application"));
    assert.ok(json.includes("15-30 days"));
    assert.ok(json.includes("5 Required"));
  });

  it("verifies [task]/opengraph-image.tsx route file exports required conventions", () => {
    const filePath = path.join(process.cwd(), "src/app/[task]/opengraph-image.tsx");
    assert.ok(fs.existsSync(filePath), "Task OG image file must exist");
    const content = fs.readFileSync(filePath, "utf-8");
    assert.ok(content.includes("export const size"));
    assert.ok(content.includes("export const contentType"));
    assert.ok(content.includes("export default async function Image"));
    assert.ok(content.includes("ImageResponse"));
  });

  it("verifies [task]/[state]/opengraph-image.tsx route file exports required conventions", () => {
    const filePath = path.join(process.cwd(), "src/app/[task]/[state]/opengraph-image.tsx");
    assert.ok(fs.existsSync(filePath), "Task+State OG image file must exist");
    const content = fs.readFileSync(filePath, "utf-8");
    assert.ok(content.includes("export const size"));
    assert.ok(content.includes("export const contentType"));
    assert.ok(content.includes("export default async function Image"));
    assert.ok(content.includes("ImageResponse"));
  });

  it("verifies root opengraph-image.tsx route file exports required conventions", () => {
    const filePath = path.join(process.cwd(), "src/app/opengraph-image.tsx");
    assert.ok(fs.existsSync(filePath), "Root OG image file must exist");
    const content = fs.readFileSync(filePath, "utf-8");
    assert.ok(content.includes("export const size"));
    assert.ok(content.includes("export const contentType"));
    assert.ok(content.includes("export default function Image"));
    assert.ok(content.includes("ImageResponse"));
  });
});
