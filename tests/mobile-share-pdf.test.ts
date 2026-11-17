import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

describe("Prompt 125: WhatsApp Share, System Share Sheet & PDF Checklist (React Native)", () => {
  const mobileDir = path.join(process.cwd(), "apps", "mobile");
  const shareServicePath = path.join(mobileDir, "lib", "mobile-share.ts");
  const taskDetailPath = path.join(mobileDir, "app", "task", "[slug].tsx");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let shareModule: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let datapackModule: any;

  before(async () => {
    shareModule = await import(shareServicePath);
    const datapackPath = path.join(mobileDir, "lib", "offline-datapack.ts");
    datapackModule = await import(datapackPath);
  });

  test("1. mobile-share service exists and exports required sharing methods", () => {
    assert.ok(fs.existsSync(shareServicePath), "mobile-share.ts must exist");
    const {
      buildCitizenShareMessage,
      getWhatsAppDeepLink,
      getWhatsAppWebUrl,
      shareToWhatsApp,
      shareSystemSheet,
      generateChecklistHtml,
      printAndSharePdf,
    } = shareModule;

    assert.equal(typeof buildCitizenShareMessage, "function");
    assert.equal(typeof getWhatsAppDeepLink, "function");
    assert.equal(typeof getWhatsAppWebUrl, "function");
    assert.equal(typeof shareToWhatsApp, "function");
    assert.equal(typeof shareSystemSheet, "function");
    assert.equal(typeof generateChecklistHtml, "function");
    assert.equal(typeof printAndSharePdf, "function");
  });

  test("2. WhatsApp sharing builds deep link and plain-language citizen message", () => {
    const { buildCitizenShareMessage, getWhatsAppDeepLink, getWhatsAppWebUrl } = shareModule;

    const options = {
      title: "Learner Driving Licence (LLR) in Gujarat",
      slug: "driving-licence-learner",
      fee: 200,
      stateName: "Gujarat",
    };

    const msg = buildCitizenShareMessage(options);
    assert.match(msg, /Learner Driving Licence \(LLR\) in Gujarat/);
    assert.match(msg, /Statutory Fee:\s*₹200/);
    assert.match(msg, /https:\/\/paperwork\.gov\.in\/driving-licence-learner/);
    assert.match(msg, /\.gov\.in/);

    const deepLink = getWhatsAppDeepLink(options);
    assert.ok(deepLink.startsWith("whatsapp://send?text="));
    assert.match(deepLink, /Learner%20Driving%20Licence/);

    const webUrl = getWhatsAppWebUrl(options);
    assert.ok(webUrl.startsWith("https://api.whatsapp.com/send?text="));
  });

  test("3. PDF checklist HTML generator renders complete printable A4 document matching web PDF", () => {
    const { generateChecklistHtml } = shareModule;
    const { getBundledGuide } = datapackModule;

    const guide = getBundledGuide("driving-licence-learner", "gj");
    assert.ok(guide);

    const html = generateChecklistHtml(guide);

    // Document structure & A4 size
    assert.match(html, /<!DOCTYPE html>/i);
    assert.match(html, /A4 portrait/);
    assert.match(html, /India Paperwork Guide • Citizen Checklist/);

    // Title and summary
    assert.match(html, /How to Apply for Learner Driving Licence/);
    assert.match(html, /Step-by-step procedure to apply/);

    // Metadata bar
    assert.match(html, /Jurisdiction[\s\S]*?Gujarat \(GJ\)/);
    assert.match(html, /Statutory Fee[\s\S]*?₹200/);

    // Checklist section with checkbox boxes
    assert.match(html, /1\. Required Documents Checklist/);
    assert.match(html, /checkbox-box/);
    assert.match(html, /Proof of Age/);
    assert.match(html, /MANDATORY/);

    // Statutory fees breakdown
    assert.match(html, /2\. Statutory Government Fees/);
    assert.match(html, /TOTAL MANDATORY STATUTORY FEE[\s\S]*?₹200/);

    // Step by step procedure
    assert.match(html, /3\. Step-by-Step Procedure/);
    assert.match(html, /Submit Online Application on Sarathi Parivahan/);

    // Official citizen warning disclaimer
    assert.match(html, /OFFICIAL CITIZEN ASSISTANCE NOTICE/);
    assert.match(html, /sarathi\.parivahan\.gov\.in/);
  });

  test("4. printAndSharePdf executes successfully and produces valid file URI", async () => {
    const { printAndSharePdf } = shareModule;
    const { getBundledGuide } = datapackModule;

    const guide = getBundledGuide("pan-card-new", "gj");
    assert.ok(guide);

    const result = await printAndSharePdf(guide);
    assert.equal(result.success, true);
    assert.ok(result.uri);
  });

  test("5. Guide detail screen integrates Share modal with WhatsApp, PDF, and System Sheet", () => {
    assert.ok(fs.existsSync(taskDetailPath), "Task detail screen file must exist");
    const content = fs.readFileSync(taskDetailPath, "utf-8");

    // Modal state & trigger
    assert.match(content, /showShareModal/);
    assert.match(content, /handleShareWhatsApp/);
    assert.match(content, /handleSharePdf/);
    assert.match(content, /handleShareSystem/);

    // UI elements
    assert.match(content, /Share via WhatsApp/);
    assert.match(content, /Download \/ Share PDF Checklist/);
    assert.match(content, /More Share Options \(System Sheet\)/);

    // Touch target & accessibility
    assert.match(content, /accessibilityLabel="Share checklist via WhatsApp"/);
    assert.match(content, /accessibilityLabel="Download or share PDF checklist"/);
  });
});
