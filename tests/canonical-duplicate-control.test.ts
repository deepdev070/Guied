import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getAllStates, loadAllTaskFiles } from "../src/lib/queries.ts";
import {
  DEFAULT_SITE_URL,
  generateTaskSeoMetadata,
  listAllNoindexTaskPages,
} from "../src/lib/seo.ts";

describe("Prompt 77: Canonical, Hreflang & Duplicate Control", () => {
  const allTasks = loadAllTaskFiles();
  const allStates = getAllStates();

  describe("Self-referencing Canonicals", () => {
    it("generates exact self-referencing canonical URL for national task pages", () => {
      for (const task of allTasks) {
        const meta = generateTaskSeoMetadata({
          taskSlug: task.slug,
          taskName: task.name,
          documentCount: task.national.documentRequirements.length,
        });

        assert.equal(
          meta.alternates?.canonical,
          `${DEFAULT_SITE_URL}/${task.slug}`,
          `Canonical for ${task.slug} must match self-referencing URL`
        );
      }
    });

    it("generates exact self-referencing canonical URL for task+state pages", () => {
      for (const task of allTasks) {
        for (const state of allStates.slice(0, 5)) {
          const meta = generateTaskSeoMetadata({
            taskSlug: task.slug,
            taskName: task.name,
            stateSlug: state.slug,
            stateName: state.name,
            stateCode: state.code,
            hasStateOverride: Boolean(task.states?.[state.code]),
          });

          assert.equal(
            meta.alternates?.canonical,
            `${DEFAULT_SITE_URL}/${task.slug}/${state.slug}`,
            `Canonical for ${task.slug}/${state.slug} must match self-referencing URL`
          );
        }
      }
    });
  });

  describe("Hreflang Alternates (en, hi, gu, x-default)", () => {
    it("provides valid hreflang language tags for all supported languages", () => {
      const meta = generateTaskSeoMetadata({
        taskSlug: "passport-renewal",
        taskName: "Passport Renewal",
        stateSlug: "gujarat",
        stateName: "Gujarat",
        hasStateOverride: true,
      });

      const langs = meta.alternates?.languages as Record<string, string>;
      assert.ok(langs, "Metadata must provide alternates.languages object");

      // Verify required languages per prompt
      assert.equal(langs.en, `${DEFAULT_SITE_URL}/passport-renewal/gujarat`);
      assert.equal(langs.hi, `${DEFAULT_SITE_URL}/passport-renewal/gujarat?lang=hi`);
      assert.equal(langs.gu, `${DEFAULT_SITE_URL}/passport-renewal/gujarat?lang=gu`);
      assert.equal(langs["x-default"], `${DEFAULT_SITE_URL}/passport-renewal/gujarat`);
    });
  });

  describe("Duplicate Content Control (noindex for duplicate pages)", () => {
    it("sets robots index: true for all national guide pages", () => {
      for (const task of allTasks) {
        const meta = generateTaskSeoMetadata({
          taskSlug: task.slug,
          taskName: task.name,
        });

        const robots = meta.robots as { index?: boolean; follow?: boolean };
        assert.equal(
          robots.index,
          true,
          `National guide /${task.slug} must be indexable (index: true)`
        );
        assert.equal(robots.follow, true);
      }
    });

    it("sets robots index: true for task+state pages with unique state overrides", () => {
      // Gujarat has overrides for driving-licence-learner and driving-licence-new
      const dlLearnerGujarat = generateTaskSeoMetadata({
        taskSlug: "driving-licence-learner",
        taskName: "Driving Licence (Learner)",
        stateSlug: "gujarat",
        stateName: "Gujarat",
        stateCode: "GJ",
        hasStateOverride: true,
      });

      const dlRobots = dlLearnerGujarat.robots as { index?: boolean; follow?: boolean };
      assert.equal(dlRobots.index, true, "Gujarat DL Learner has unique override, must be indexed");
      assert.equal(dlRobots.follow, true);
    });

    it("sets robots index: false, follow: true for duplicate state pages without overrides", () => {
      // Passport renewal does not have state overrides (national procedure across India)
      const passportBihar = generateTaskSeoMetadata({
        taskSlug: "passport-renewal",
        taskName: "Passport Renewal",
        stateSlug: "bihar",
        stateName: "Bihar",
        stateCode: "BR",
        hasStateOverride: false,
      });

      const passportRobots = passportBihar.robots as { index?: boolean; follow?: boolean };
      assert.equal(
        passportRobots.index,
        false,
        "Duplicate state page must have index: false to prevent duplicate content penalty"
      );
      assert.equal(
        passportRobots.follow,
        true,
        "Duplicate state page must have follow: true so search bots continue following links"
      );
    });

    it("LIST OF NOINDEX PAGES: lists and verifies every noindex page across the entire site", () => {
      const noindexReports = listAllNoindexTaskPages(allTasks, allStates);

      // Verify that every reported page is indeed a duplicate
      assert.ok(noindexReports.length > 0, "There must be duplicate state pages recorded");

      const noindexPaths = noindexReports.map((r) => r.path);

      // Check specific expected noindex paths
      assert.ok(
        noindexPaths.includes("/passport-renewal/andhra-pradesh"),
        "Passport in AP has no override -> must be noindex"
      );
      assert.ok(
        noindexPaths.includes("/passport-renewal/bihar"),
        "Passport in Bihar has no override -> must be noindex"
      );
      assert.ok(
        noindexPaths.includes("/driving-licence-learner/bihar"),
        "DL Learner in Bihar has no override -> must be noindex"
      );

      // Overridden pages MUST NOT be in noindex list
      assert.ok(
        !noindexPaths.includes("/driving-licence-learner/gujarat"),
        "Gujarat DL Learner has override -> must NOT be in noindex list"
      );
      assert.ok(
        !noindexPaths.includes("/driving-licence-new/gujarat"),
        "Gujarat DL New has override -> must NOT be in noindex list"
      );

      // National pages MUST NOT be in noindex list
      assert.ok(!noindexPaths.includes("/passport-renewal"));
      assert.ok(!noindexPaths.includes("/driving-licence-learner"));
      assert.ok(!noindexPaths.includes("/driving-licence-new"));

      // Verify count: 3 tasks * 36 states = 108 total state pages.
      // 2 Gujarat overrides exist (learner DL + new DL), so 108 - 2 = 106 duplicate pages.
      assert.equal(
        noindexReports.length,
        106,
        `Expected exactly 106 duplicate state pages marked as noindex, got ${noindexReports.length}`
      );
    });
  });
});
