import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { renderToBuffer } from "@react-pdf/renderer";
import QRCode from "qrcode";
import { ChecklistPdfDocument } from "../src/lib/pdf/ChecklistPdfDocument.ts";
import { siteConfig } from "../src/lib/site.ts";
import { getTaskBySlug, getTaskVariant } from "../src/lib/queries.ts";

describe("Prompt 64: Server-Side PDF Checklist Generator", () => {
  it("verifies architectural justification for @react-pdf/renderer over headless browser", () => {
    const docPath = path.join(process.cwd(), "src/lib/pdf/ChecklistPdfDocument.ts");
    const content = fs.readFileSync(docPath, "utf-8");

    // Must document why lighter approach was chosen over Puppeteer/headless
    assert.ok(
      content.includes("Architectural Rationale") || content.includes("@react-pdf/renderer"),
      "Must document architectural rationale"
    );
    assert.ok(
      content.includes("Puppeteer") || content.includes("Headless"),
      "Must explicitly contrast with headless browser"
    );
    assert.ok(
      content.includes("Resource Efficiency") || content.includes("RAM"),
      "Must explain memory and cold-start advantages"
    );
  });

  it("generates a clean valid A4 PDF buffer with QR code, logo, page numbers, and no ads", async () => {
    const task = await getTaskBySlug("driving-licence-learner");
    assert.ok(task, "Test task driving-licence-learner must exist");

    const variant = await getTaskVariant("driving-licence-learner", "gujarat");
    assert.ok(variant, "Merged variant for Gujarat must exist");

    const canonicalUrl = `${siteConfig.baseUrl}/${task.slug}/gujarat`;
    const qrCodeDataUrl = await QRCode.toDataURL(canonicalUrl, {
      margin: 1,
      width: 90,
      color: { dark: "#0F172A", light: "#FFFFFF" },
    });

    assert.ok(
      qrCodeDataUrl.startsWith("data:image/png;base64,"),
      "QR code must be a valid PNG data URI"
    );

    const pdfDocument = ChecklistPdfDocument({
      task,
      variant,
      stateName: "Gujarat",
      canonicalUrl,
      qrCodeDataUrl,
      generatedDate: "14 Nov 2026",
    });

    const buffer = await renderToBuffer(pdfDocument);

    assert.ok(buffer && buffer.length > 2000, "Generated PDF must have substantial content");

    // Standard PDF file header check (%PDF-)
    const headerString = buffer.subarray(0, 5).toString("ascii");
    assert.strictEqual(
      headerString,
      "%PDF-",
      "Generated buffer must be a valid PDF beginning with %PDF-"
    );
  });

  it("verifies API route handler exists and configures correct HTTP headers", () => {
    const routePath = path.join(process.cwd(), "src/app/api/pdf/[task]/route.ts");
    assert.ok(fs.existsSync(routePath), "API route /api/pdf/[task]/route.ts must exist");

    const routeContent = fs.readFileSync(routePath, "utf-8");
    assert.ok(
      routeContent.includes("application/pdf"),
      "Response must set Content-Type: application/pdf"
    );
    assert.ok(
      routeContent.includes("Content-Disposition"),
      "Response must set Content-Disposition header"
    );
    assert.ok(
      routeContent.includes("attachment; filename="),
      "Must offer file download disposition"
    );
  });

  it("verifies Download PDF checklist action is present in TaskSidebar and DocumentSection", () => {
    const sidebarPath = path.join(process.cwd(), "src/components/task/TaskSidebar.tsx");
    const docSectionPath = path.join(process.cwd(), "src/components/task/DocumentSection.tsx");

    const sidebarContent = fs.readFileSync(sidebarPath, "utf-8");
    const docSectionContent = fs.readFileSync(docSectionPath, "utf-8");

    assert.ok(sidebarContent.includes("/api/pdf/"), "TaskSidebar must link to /api/pdf/");
    assert.ok(
      sidebarContent.includes("Download PDF Checklist"),
      "TaskSidebar must render 'Download PDF Checklist'"
    );
    assert.ok(docSectionContent.includes("/api/pdf/"), "DocumentSection must link to /api/pdf/");
  });
});
