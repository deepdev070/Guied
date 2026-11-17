import test from "node:test";
import assert from "node:assert/strict";
import {
  CARD_DIMENSIONS,
  escapeXml,
  wrapSvgText,
  renderChecklistCardSvg,
  getChecklistCardDataFromTask,
  type ChecklistCardData,
} from "../src/lib/checklist-card.ts";
import { getTaskContent } from "../src/lib/admin/task-storage.ts";
import { GET } from "../src/app/api/cards/[slug]/route.ts";

test("PROMPT 142: Social Checklist Card Template System", async (t) => {
  await t.test("CARD_DIMENSIONS matches 1080x1350 vertical aspect ratio", () => {
    assert.equal(CARD_DIMENSIONS.width, 1080);
    assert.equal(CARD_DIMENSIONS.height, 1350);
  });

  await t.test("escapeXml properly escapes XML special characters", () => {
    assert.equal(escapeXml("A & B < C > D ' E \" F"), "A &amp; B &lt; C &gt; D &apos; E &quot; F");
    assert.equal(escapeXml(""), "");
  });

  await t.test("wrapSvgText cleanly breaks sentences into maxLines", () => {
    const text =
      "How to apply for a learner driving licence in Gujarat with official documents and zero fees";
    const lines = wrapSvgText(text, 25, 2);
    assert.ok(lines.length <= 2);
    assert.ok(lines.length > 0);
  });

  await t.test("renderChecklistCardSvg generates valid 1080x1350 SVG with light colors", () => {
    const mockData: ChecklistCardData = {
      title: "Learner's Driving Licence",
      subtitle: "Official procedure and documents",
      stateName: "Gujarat",
      categoryName: "VEHICLES & TRANSPORT",
      documents: [
        {
          name: "Proof of Age (Aadhaar / 10th Marksheet)",
          hint: "Original + 1 photocopy",
          required: true,
        },
        { name: "Proof of Current Address", hint: "Voter ID or Electricity Bill", required: true },
        {
          name: "Form 1 Physical Fitness Declaration",
          hint: "Online self-declaration",
          required: true,
        },
        { name: "Digital Signature & Photo Scan", hint: "256x64 px scan", required: true },
        {
          name: "Medical Certificate Form 1A",
          hint: "For commercial or age > 40",
          required: false,
        },
        { name: "Parent Consent Form", hint: "For age 16-18 applying for 50cc", required: false },
      ],
      statutoryFee: "₹200 Govt Fee",
      estimatedTime: "15-30 days",
      siteUrl: "indiapaperworkguide.in",
      verifiedDate: "Verified Nov 2026",
      sourcePortal: "parivahan.gov.in",
    };

    const svg = renderChecklistCardSvg(mockData);

    // Dimensions check
    assert.ok(svg.includes('width="1080"'));
    assert.ok(svg.includes('height="1350"'));
    assert.ok(svg.includes('viewBox="0 0 1080 1350"'));

    // Light color checks (Light slate & white, no dark mode background)
    assert.ok(svg.includes('fill="#F8FAFC"'));
    assert.ok(svg.includes('fill="#FFFFFF"'));
    assert.ok(!svg.includes('fill="#000000"'));

    // Tricolor top accent check
    assert.ok(svg.includes('fill="#FF9933"')); // Saffron
    assert.ok(svg.includes('fill="#138808"')); // Green

    // Brand and site URL check
    assert.ok(svg.includes("India Paperwork Guide"));
    assert.ok(svg.includes("indiapaperworkguide.in"));

    // State badge check
    assert.ok(svg.includes("GUJARAT • GUIDE"));

    // Top 6 documents check
    assert.ok(svg.includes("Proof of Age"));
    assert.ok(svg.includes("Proof of Current Address"));
    assert.ok(svg.includes("Form 1 Physical Fitness"));
    assert.ok(svg.includes("Parent Consent Form"));

    // Anti-tout and official portal check
    assert.ok(svg.includes("parivahan.gov.in"));
    assert.ok(svg.includes("Do not pay unauthorized middlemen"));
  });

  await t.test("getChecklistCardDataFromTask extracts top 6 documents and fees accurately", () => {
    const task = getTaskContent("driving-licence-learner");
    assert.ok(task, "driving-licence-learner task must exist");

    const cardData = getChecklistCardDataFromTask(task);
    assert.equal(cardData.stateName, "All India");
    assert.ok(cardData.documents.length <= 6);
    assert.ok(cardData.documents.length >= 4);
    assert.ok(cardData.statutoryFee?.includes("₹"));
    assert.ok(cardData.siteUrl?.includes("indiapaperworkguide.in"));

    // With Gujarat state variation
    const gjCardData = getChecklistCardDataFromTask(task, "gj");
    assert.equal(gjCardData.stateName, "Gujarat");
  });

  await t.test("API route GET /api/cards/[slug] returns 200 with SVG content", async () => {
    const req = new Request("http://localhost:3000/api/cards/driving-licence-learner");
    const paramsPromise = Promise.resolve({ slug: "driving-licence-learner" });
    const res = await GET(req, { params: paramsPromise });

    assert.equal(res.status, 200);
    assert.equal(res.headers.get("content-type"), "image/svg+xml; charset=utf-8");
    assert.ok(res.headers.get("cache-control")?.includes("max-age=86400"));

    const text = await res.text();
    assert.ok(text.startsWith("<svg"));
    assert.ok(text.includes('width="1080"'));
    assert.ok(text.includes('height="1350"'));
  });

  await t.test(
    "API route GET /api/cards/[slug]?download=true sets attachment disposition",
    async () => {
      const req = new Request(
        "http://localhost:3000/api/cards/driving-licence-learner?download=true"
      );
      const paramsPromise = Promise.resolve({ slug: "driving-licence-learner" });
      const res = await GET(req, { params: paramsPromise });

      assert.equal(res.status, 200);
      assert.ok(res.headers.get("content-disposition")?.includes("attachment"));
    }
  );

  await t.test("API route GET /api/cards/[slug] returns 404 for unknown task", async () => {
    const req = new Request("http://localhost:3000/api/cards/unknown-non-existent-task");
    const paramsPromise = Promise.resolve({ slug: "unknown-non-existent-task" });
    const res = await GET(req, { params: paramsPromise });

    assert.equal(res.status, 404);
  });
});
