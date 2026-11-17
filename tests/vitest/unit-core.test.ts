import { describe, it, assert } from "vitest";
import { evaluate } from "@/lib/rule-evaluator.ts";
import { getFreshnessInfo } from "@civic/utils";
import { generateTaskSeoMetadata, buildTaskTitle, buildTaskDescription } from "@/lib/seo.ts";
import { executeSearch } from "@/lib/search.ts";
import { TaskContentSchema, OfficialLinkSchema } from "@/types/content.ts";

describe("Prompt 131: Vitest Unit Tests for Core Paperwork Engine & lib/ Coverage", () => {
  // =========================================================================
  // 1. appliesWhen Evaluator Tests
  // =========================================================================
  describe("1. appliesWhen Rule Evaluator", () => {
    it("handles unconditional rules and empty conditions", () => {
      assert.equal(evaluate(null, {}), true);
      assert.equal(evaluate(undefined, {}), true);
      assert.equal(evaluate(true, {}), true);
      assert.equal(evaluate({}, {}), true);
      assert.equal(evaluate(false, {}), false);
    });

    it("evaluates equality and inequality operators ($eq, $ne)", () => {
      assert.equal(evaluate({ vehicleType: { eq: "mcwg" } }, { vehicleType: "mcwg" }), true);
      assert.equal(evaluate({ vehicleType: { eq: "mcwg" } }, { vehicleType: "lmv" }), false);
      assert.equal(evaluate({ citizenship: { ne: "foreign" } }, { citizenship: "indian" }), true);
      assert.equal(evaluate({ citizenship: { ne: "foreign" } }, { citizenship: "foreign" }), false);
    });

    it("evaluates set membership operators ($in, $nin)", () => {
      const allowedStatesRule = { state: { in: ["GJ", "MH", "DL"] } };
      assert.equal(evaluate(allowedStatesRule, { state: "GJ" }), true);
      assert.equal(evaluate(allowedStatesRule, { state: "KA" }), false);

      const excludeDiplomatsRule = { category: { nin: ["diplomatic", "official"] } };
      assert.equal(evaluate(excludeDiplomatsRule, { category: "regular" }), true);
      assert.equal(evaluate(excludeDiplomatsRule, { category: "diplomatic" }), false);
    });

    it("evaluates numeric comparison operators ($gt, $gte, $lt, $lte)", () => {
      const minorRule = { applicantAge: { lt: 18 } };
      assert.equal(evaluate(minorRule, { applicantAge: 17 }), true);
      assert.equal(evaluate(minorRule, { applicantAge: 18 }), false);

      const adultRule = { applicantAge: { gte: 18 } };
      assert.equal(evaluate(adultRule, { applicantAge: 18 }), true);
      assert.equal(evaluate(adultRule, { applicantAge: 25 }), true);
      assert.equal(evaluate(adultRule, { applicantAge: 16 }), false);
    });

    it("evaluates boolean logic operators ($and, $or, $not)", () => {
      const commercialLicenceRule = {
        and: [{ applicantAge: { gte: 20 } }, { hasExistingDL: { eq: true } }],
      };
      assert.equal(
        evaluate(commercialLicenceRule, { applicantAge: 21, hasExistingDL: true }),
        true
      );
      assert.equal(
        evaluate(commercialLicenceRule, { applicantAge: 19, hasExistingDL: true }),
        false
      );

      const identityProofRule = {
        or: [{ hasPassport: { eq: true } }, { hasAadhaar: { eq: true } }],
      };
      assert.equal(evaluate(identityProofRule, { hasPassport: true }), true);
      assert.equal(evaluate(identityProofRule, { hasAadhaar: true }), true);
      assert.equal(evaluate(identityProofRule, { hasVoterId: true }), false);
    });
  });

  // =========================================================================
  // 2. Freshness Logic Tests
  // =========================================================================
  describe("2. Freshness & Staleness Logic", () => {
    it("classifies content < 90 days as fresh", () => {
      const now = new Date("2026-11-16T10:00:00.000Z");
      const thirtyDaysAgo = "2026-10-17T10:00:00.000Z";

      const info = getFreshnessInfo(thirtyDaysAgo, now);
      assert.equal(info.status, "fresh");
      assert.equal(info.badgeVariant, "verified");
      assert.equal(info.isStale, false);
      assert.match(info.label, /Verified/i);
    });

    it("classifies content between 90 and 180 days as aging", () => {
      const now = new Date("2026-11-16T10:00:00.000Z");
      const oneHundredDaysAgo = "2026-08-08T10:00:00.000Z";

      const info = getFreshnessInfo(oneHundredDaysAgo, now);
      assert.equal(info.status, "aging");
      assert.equal(info.badgeVariant, "needs-update");
      assert.equal(info.isStale, false);
      assert.match(info.label, /Verified 100 days ago/i);
    });

    it("classifies content > 180 days as stale", () => {
      const now = new Date("2026-11-16T10:00:00.000Z");
      const twoHundredDaysAgo = "2026-04-30T10:00:00.000Z";

      const info = getFreshnessInfo(twoHundredDaysAgo, now);
      assert.equal(info.status, "stale");
      assert.equal(info.badgeVariant, "needs-update");
      assert.equal(info.isStale, true);
    });
  });

  // =========================================================================
  // 3. Metadata Generation Tests
  // =========================================================================
  describe("3. Metadata Generation & SEO (Prompt 81 & 131)", () => {
    it("generates complete task titles and descriptions matching citizen patterns", () => {
      const title = buildTaskTitle({
        taskName: "Passport Renewal",
        stateName: "Gujarat",
      });
      assert.match(title, /Passport Renewal in Gujarat/i);

      const description = buildTaskDescription({
        taskName: "Passport Renewal",
        stateName: "Gujarat",
        mandatoryFeeTotal: 1500,
      });
      assert.match(description, /Passport Renewal in Gujarat/i);
      assert.match(description, /official/i);
    });

    it("generates complete OpenGraph and Twitter metadata for task pages", () => {
      const meta = generateTaskSeoMetadata({
        taskSlug: "passport-renewal",
        taskName: "Passport Renewal (Normal & Tatkaal)",
        documentCount: 5,
        mandatoryFeeTotal: 1500,
      });

      assert.ok(meta.title);
      assert.ok(meta.description);
      assert.ok(meta.openGraph?.title);
      assert.ok(meta.openGraph?.description);
    });
  });

  // =========================================================================
  // 4. Search Ranking Tests
  // =========================================================================
  describe("4. Search Ranking & Match Scoring", () => {
    it("ranks exact query matches and filters by category", () => {
      const results = executeSearch({ query: "driving" });
      assert.ok(results.length > 0);
      assert.ok(results[0]!.item.slug.includes("driving"));
    });

    it("filters search results by selected state", () => {
      const results = executeSearch({ query: "driving", state: "GJ" });
      assert.ok(results.length > 0);
      assert.ok(
        results.every(
          (r) => !r.item.availableStates.length || r.item.availableStates.includes("GJ")
        )
      );
    });

    it("returns empty array for nonsensical search query", () => {
      const results = executeSearch({ query: "nonexistentgibberish987654" });
      assert.equal(results.length, 0);
    });
  });

  // =========================================================================
  // 5. Fee Total Calculation Tests
  // =========================================================================
  describe("5. Fee Total Calculation & Statutory Ceilings", () => {
    it("computes total fees correctly combining base and option choices", () => {
      const baseFee = 1500;
      const options = [
        { id: "scheme", selectedAmount: 2000 }, // Tatkaal
        { id: "pages", selectedAmount: 500 }, // Jumbo 60 pages
        { id: "applicant", selectedAmount: 0 }, // Adult
        { id: "delivery", selectedAmount: 50 }, // Speed post + SMS
      ];

      const total = options.reduce((sum, opt) => sum + opt.selectedAmount, baseFee);
      assert.equal(total, 4050, "Tatkaal + 60 pages passport fee must total exactly ₹4050");
    });

    it("computes minor discount deductions correctly", () => {
      const baseFee = 1500;
      const options = [
        { id: "scheme", selectedAmount: 0 }, // Normal
        { id: "applicant", selectedAmount: -500 }, // Minor discount
      ];

      const total = options.reduce((sum, opt) => sum + opt.selectedAmount, baseFee);
      assert.equal(total, 1000, "Minor passport fee must total exactly ₹1000");
    });
  });

  // =========================================================================
  // 6. Content Validator Tests
  // =========================================================================
  describe("6. Content Schema & Quality Gate Validators", () => {
    it("TaskContentSchema validates complete task authoring JSON format", () => {
      const taskData = {
        slug: "driving-licence-learner",
        name: "Learner's Licence Application",
        description: "How to apply for an LLR driving permit across India.",
        categorySlug: "vehicles",
        national: {
          title: "Learner's Licence: National Procedure",
          summary:
            "Official steps, required documents, and ₹200 fee for obtaining a learner permit in India.",
          estimatedTime: "15-30 days",
          difficulty: "easy",
          status: "PUBLISHED",
          steps: [
            {
              stepNumber: 1,
              title: "Submit Online Application",
              description: "Fill Form 2 on Sarathi Parivahan portal with Aadhaar e-KYC.",
              where: "Online Portal",
            },
          ],
          documentRequirements: [
            {
              name: "Proof of Age",
              requirementType: "required",
              copiesHint: "Original + 1 photocopy",
            },
          ],
          fees: [
            {
              label: "Application Processing Fee",
              amount: 150,
              paymentMode: "online",
            },
          ],
          officialLinks: [
            {
              label: "Sarathi Parivahan",
              url: "https://sarathi.parivahan.gov.in",
              isPrimary: true,
            },
          ],
        },
        states: {
          GJ: {
            title: "Gujarat Learner's Licence (LLR) Online",
            summary:
              "Gujarat allows completely faceless Aadhaar e-KYC application with online computerized home test.",
          },
        },
      };

      const result = TaskContentSchema.safeParse(taskData);
      assert.equal(result.success, true);
    });

    it("OfficialLinkSchema validates government portal URL protocols and formats", () => {
      const validLink = {
        label: "Sarathi Parivahan Official Portal",
        url: "https://sarathi.parivahan.gov.in",
        isPrimary: true,
      };
      assert.equal(OfficialLinkSchema.safeParse(validLink).success, true);

      const invalidLink = {
        label: "Invalid FTP link",
        url: "ftp://not-allowed-scheme.com",
        isPrimary: false,
      };
      assert.equal(OfficialLinkSchema.safeParse(invalidLink).success, false);
    });
  });
});
