import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  buildOrganizationSchema,
  buildWebSiteSchema,
  buildBreadcrumbListSchema,
  buildHowToSchema,
  buildFaqPageSchema,
} from "../src/lib/jsonld.ts";
import type { Step, FaqItem } from "../src/types/content.ts";

describe("Prompt 74: Structured Data (JSON-LD) Engine", () => {
  it("generates valid Organization schema with required branding", () => {
    const org = buildOrganizationSchema();
    assert.equal(org["@context"], "https://schema.org");
    assert.equal(org["@type"], "Organization");
    assert.equal(org.name, "India Paperwork Guide");
    assert.ok(org.url.startsWith("https://"));
    assert.ok(org.description.length > 20);
    assert.ok(Array.isArray(org.sameAs));
  });

  it("generates valid WebSite schema with SearchAction for Sitelinks Searchbox", () => {
    const web = buildWebSiteSchema();
    assert.equal(web["@context"], "https://schema.org");
    assert.equal(web["@type"], "WebSite");
    assert.equal(web.potentialAction["@type"], "SearchAction");
    assert.ok(web.potentialAction.target.urlTemplate.includes("search?q="));
    assert.equal(web.potentialAction["query-input"], "required name=search_term_string");
  });

  it("generates valid BreadcrumbList schema with 1-based positions", () => {
    const breadcrumbs = buildBreadcrumbListSchema([
      { name: "Home", href: "/" },
      { name: "Vehicles", href: "/category/vehicles" },
      { name: "Driving Licence (Learner)" },
    ]);

    assert.ok(breadcrumbs);
    assert.equal(breadcrumbs["@type"], "BreadcrumbList");
    const elements = breadcrumbs.itemListElement;
    assert.equal(elements.length, 3);
    assert.equal(elements[0]?.position, 1);
    assert.equal(elements[0]?.name, "Home");
    assert.ok(typeof elements[0]?.item === "string" && elements[0].item.startsWith("https://"));
    assert.equal(elements[2]?.position, 3);
  });

  it("returns null for BreadcrumbList if items are empty", () => {
    assert.equal(buildBreadcrumbListSchema([]), null);
  });

  it("generates valid HowTo schema with steps and estimated cost", () => {
    const sampleSteps: Step[] = [
      {
        stepNumber: 1,
        title: "Submit Online Form 2 on Parivahan",
        description:
          "Visit parivahan.gov.in, select your state, and fill Form 2 application with your Aadhaar.",
        status: "PUBLISHED",
      },
      {
        stepNumber: 2,
        title: "Pay Statutory Fee Online",
        description:
          "Pay ₹150 application fee plus ₹50 computer test fee using UPI or net banking.",
        status: "PUBLISHED",
      },
    ];

    const howTo = buildHowToSchema({
      name: "How to Apply for Learner's Licence in Gujarat",
      description: "Step-by-step citizen guide to applying for a learner driving licence online.",
      steps: sampleSteps,
      totalCost: 200,
      estimatedTime: "15-30 days",
    });

    assert.ok(howTo);
    assert.equal(howTo["@context"], "https://schema.org");
    assert.equal(howTo["@type"], "HowTo");
    assert.equal(howTo.step.length, 2);
    assert.equal(howTo.step[0]?.["@type"], "HowToStep");
    assert.equal(howTo.step[0]?.position, 1);
    assert.equal(howTo.estimatedCost?.value, 200);
    assert.equal(howTo.estimatedCost?.currency, "INR");
    assert.equal(howTo.totalTime, "15-30 days");
  });

  it("CRITICAL RULE: returns null for HowTo when no steps are visible on the page", () => {
    const emptyHowTo = buildHowToSchema({
      name: "Empty Procedure",
      description: "No steps yet",
      steps: [],
    });
    assert.equal(emptyHowTo, null, "Must NOT emit HowTo schema when steps are not visible");
  });

  it("generates valid FAQPage schema with questions and accepted answers", () => {
    const sampleFaqs: FaqItem[] = [
      {
        question: "Can I renew my passport before it expires?",
        answer: "Yes, you can apply for passport re-issue up to 1 year before the expiry date.",
        status: "PUBLISHED",
        displayOrder: 1,
      },
    ];

    const faqPage = buildFaqPageSchema(sampleFaqs);
    assert.ok(faqPage);
    assert.equal(faqPage["@context"], "https://schema.org");
    assert.equal(faqPage["@type"], "FAQPage");
    assert.equal(faqPage.mainEntity.length, 1);
    assert.equal(faqPage.mainEntity[0]?.["@type"], "Question");
    assert.equal(faqPage.mainEntity[0]?.name, "Can I renew my passport before it expires?");
    assert.equal(
      faqPage.mainEntity[0]?.acceptedAnswer.text,
      "Yes, you can apply for passport re-issue up to 1 year before the expiry date."
    );
  });

  it("CRITICAL RULE: returns null for FAQPage when no FAQs are visible on the page", () => {
    const emptyFaqPage = buildFaqPageSchema([]);
    assert.equal(emptyFaqPage, null, "Must NOT emit FAQPage schema when FAQs are not visible");
  });

  it("verifies JsonLd component escapes < characters to prevent XSS script breakout", () => {
    const jsonLdCode = fs.readFileSync(
      path.join(process.cwd(), "src/components/seo/JsonLd.tsx"),
      "utf-8"
    );
    assert.ok(jsonLdCode.includes('replace(/</g, "\\\\u003c")'), "Must sanitize < characters");
    assert.ok(jsonLdCode.includes("application/ld+json"), "Must render application/ld+json script");
  });

  it("verifies RootLayout and TaskPageView integrate JsonLd schemas", () => {
    const layoutCode = fs.readFileSync(path.join(process.cwd(), "src/app/layout.tsx"), "utf-8");
    assert.ok(
      layoutCode.includes("buildOrganizationSchema"),
      "RootLayout must include Organization schema"
    );
    assert.ok(layoutCode.includes("buildWebSiteSchema"), "RootLayout must include WebSite schema");

    const taskPageCode = fs.readFileSync(
      path.join(process.cwd(), "src/components/task/TaskPageView.tsx"),
      "utf-8"
    );
    assert.ok(
      taskPageCode.includes("buildBreadcrumbListSchema"),
      "TaskPageView must include BreadcrumbList"
    );
    assert.ok(taskPageCode.includes("buildHowToSchema"), "TaskPageView must include HowTo schema");
    assert.ok(
      taskPageCode.includes("buildFaqPageSchema"),
      "TaskPageView must include FAQPage schema"
    );
  });
});
