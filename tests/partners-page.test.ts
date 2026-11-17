import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  PARTNER_CATEGORIES,
  RATE_CARD_TIERS,
  EDITORIAL_SEPARATION_PRINCIPLES,
  GUJARAT_DISTRICTS,
  PartnerEnquiryInputSchema,
  savePartnerEnquiry,
  type PartnerEnquiryInput,
} from "../src/lib/partners.ts";

describe("PROMPT 146: Local Partnerships Page (/partners)", () => {
  describe("1. Partner Categories & Civic Types", () => {
    it("defines the 4 required local service center archetypes", () => {
      const categoryIds = PARTNER_CATEGORIES.map((c) => c.id);
      assert.ok(categoryIds.includes("ca_tax"), "Must support CA and tax offices");
      assert.ok(categoryIds.includes("notary_legal"), "Must support Notaries and legal drafters");
      assert.ok(categoryIds.includes("csc_eseva"), "Must support CSC / E-Seva / Jan Seva Kendras");
      assert.ok(categoryIds.includes("typing_cyber"), "Must support Typing centres & cyber cafes");
    });

    it("specifies credential requirements for all categories", () => {
      for (const cat of PARTNER_CATEGORIES) {
        assert.ok(
          cat.credentialRequired.length > 10,
          `${cat.id} must specify credential requirement`
        );
        assert.ok(cat.commonServices.length >= 3, `${cat.id} must list common civic services`);
      }
    });

    it("includes Gujarat launch state districts", () => {
      assert.ok(GUJARAT_DISTRICTS.includes("Ahmedabad"));
      assert.ok(GUJARAT_DISTRICTS.includes("Surat"));
      assert.ok(GUJARAT_DISTRICTS.includes("Vadodara"));
      assert.ok(GUJARAT_DISTRICTS.includes("Rajkot"));
      assert.ok(GUJARAT_DISTRICTS.length >= 30, "Should list all Gujarat districts");
    });
  });

  describe("2. Rate Card Placeholders", () => {
    it("defines 3 transparent pricing tiers with placeholders", () => {
      assert.equal(RATE_CARD_TIERS.length, 3);
      const tierIds = RATE_CARD_TIERS.map((t) => t.id);
      assert.ok(tierIds.includes("basic_directory"));
      assert.ok(tierIds.includes("verified_partner"));
      assert.ok(tierIds.includes("spotlight_network"));
    });

    it("includes free tier for basic grassroots directory inclusion", () => {
      const freeTier = RATE_CARD_TIERS.find((t) => t.id === "basic_directory");
      assert.ok(freeTier);
      assert.equal(freeTier.priceFormatted, "₹0");
    });

    it("marks verified partner tier as popular", () => {
      const popularTier = RATE_CARD_TIERS.find((t) => t.isPopular);
      assert.ok(popularTier);
      assert.equal(popularTier.id, "verified_partner");
      assert.equal(popularTier.priceFormatted, "₹499");
    });
  });

  describe("3. Editorial Separation Invariants", () => {
    it("codifies strict separation between editorial content and sponsored listings", () => {
      assert.ok(
        EDITORIAL_SEPARATION_PRINCIPLES.length >= 4,
        "Must have comprehensive separation rules"
      );
      const combinedText = EDITORIAL_SEPARATION_PRINCIPLES.map(
        (p) => `${p.title} ${p.description}`
      ).join(" ");

      assert.ok(
        combinedText.includes("Editorial Independence"),
        "Must declare editorial independence"
      );
      assert.ok(
        combinedText.includes(".gov.in"),
        "Must cite official .gov.in sources as independent basis"
      );
      assert.ok(combinedText.includes("Sponsored"), "Must mandate clear sponsored labelling");
      assert.ok(
        combinedText.includes("Delisting"),
        "Must include strict delisting policy for misrepresentation"
      );
    });
  });

  describe("4. Partner Enquiry Form Schema & Validation", () => {
    it("validates valid partner submission", () => {
      const validPayload: PartnerEnquiryInput = {
        businessName: "Patel Jan Seva Kendra",
        category: "csc_eseva",
        contactPerson: "Dharmesh Patel",
        phone: "9825012345",
        email: "dharmesh@example.com",
        state: "Gujarat",
        district: "Gandhinagar",
        address: "Shop 12, Sector 21",
        registrationNumber: "CSC-GJ-12345678",
        plan: "verified_partner",
        notes: "Offering Sarathi driving licence and Aadhaar update assistance.",
        honeypot: "",
      };

      const result = PartnerEnquiryInputSchema.safeParse(validPayload);
      assert.ok(result.success, "Should succeed for valid payload");
    });

    it("rejects invalid Indian phone numbers", () => {
      const invalidPayload = {
        businessName: "Patel Jan Seva Kendra",
        category: "csc_eseva",
        contactPerson: "Dharmesh Patel",
        phone: "12345", // too short
        email: "dharmesh@example.com",
        state: "Gujarat",
        district: "Gandhinagar",
        registrationNumber: "CSC-GJ-12345678",
        plan: "verified_partner",
      };

      const result = PartnerEnquiryInputSchema.safeParse(invalidPayload);
      assert.equal(result.success, false);
      if (!result.success) {
        assert.ok(result.error.issues.some((i) => i.path.includes("phone")));
      }
    });

    it("rejects invalid partner category", () => {
      const invalidPayload = {
        businessName: "Unknown Services",
        category: "invalid_category",
        contactPerson: "Test Person",
        phone: "9876543210",
        email: "test@example.com",
        state: "Gujarat",
        district: "Ahmedabad",
        registrationNumber: "REG123",
      };

      const result = PartnerEnquiryInputSchema.safeParse(invalidPayload);
      assert.equal(result.success, false);
    });

    it("saves partner enquiry and returns reference ID", async () => {
      const record = await savePartnerEnquiry({
        businessName: "Test Cyber Center",
        category: "typing_cyber",
        contactPerson: "Aakash Mehta",
        phone: "9898989898",
        email: "aakash@example.com",
        state: "Gujarat",
        district: "Surat",
        registrationNumber: "SHOP-ACT-SRT-99",
        plan: "basic_directory",
      });

      assert.ok(record.id.startsWith("PARTNER-"));
      assert.equal(record.status, "PENDING_REVIEW");
      assert.equal(record.businessName, "Test Cyber Center");
    });
  });

  describe("5. Structural Verification of /partners Page & Form Component", () => {
    it("ensures page.tsx exists with editorial separation and rate card placeholders", () => {
      const pagePath = path.resolve(process.cwd(), "src/app/partners/page.tsx");
      assert.ok(fs.existsSync(pagePath), "src/app/partners/page.tsx must exist");
      const content = fs.readFileSync(pagePath, "utf-8");

      assert.ok(
        content.includes("Strict Editorial Separation"),
        "Must display editorial separation banner"
      );
      assert.ok(
        content.includes("Rate Card & Listing Tiers"),
        "Must display rate card placeholders"
      );
      assert.ok(content.includes("PartnerEnquiryForm"), "Must include the enquiry form component");
      assert.ok(content.includes("Chartered Accountants"), "Must explain CA listing");
      assert.ok(content.includes("Notaries"), "Must explain Notary listing");
      assert.ok(content.includes("CSC, Jan Seva"), "Must explain CSC/e-Seva listing");
      assert.ok(content.includes("Typing"), "Must explain Typing center listing");
    });

    it("ensures PartnerEnquiryForm.tsx exists with light-theme styling", () => {
      const formPath = path.resolve(
        process.cwd(),
        "src/components/partners/PartnerEnquiryForm.tsx"
      );
      assert.ok(fs.existsSync(formPath), "PartnerEnquiryForm.tsx must exist");
      const content = fs.readFileSync(formPath, "utf-8");

      assert.ok(content.includes('role="alert"'), "Must provide accessible error alert");
      assert.ok(content.includes("honeypot"), "Must include honeypot field for anti-spam");
      assert.ok(
        content.includes("registrationNumber"),
        "Must require registration number for verification"
      );
      assert.ok(
        content.includes("/api/partners/enquiry"),
        "Must submit to the partner enquiry API"
      );
    });

    it("ensures API route exists and handles enquiry submissions", () => {
      const apiPath = path.resolve(process.cwd(), "src/app/api/partners/enquiry/route.ts");
      assert.ok(fs.existsSync(apiPath), "src/app/api/partners/enquiry/route.ts must exist");
      const content = fs.readFileSync(apiPath, "utf-8");

      assert.ok(content.includes("POST"), "Must implement POST handler");
      assert.ok(content.includes("checkRateLimit"), "Must rate limit partner enquiry requests");
      assert.ok(content.includes("PartnerEnquiryInputSchema"), "Must validate with Zod schema");
    });
  });
});
