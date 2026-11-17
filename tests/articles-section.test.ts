import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  STARTER_ARTICLES,
  getAllArticles,
  getArticleBySlug,
  getArticleStaticSlugs,
  type Article,
} from "../src/lib/articles.ts";

test("PROMPT 144: Civic Common Mistakes Articles Section", async (t) => {
  await t.test("1. Starter articles list contains exactly 5 detailed articles", () => {
    assert.equal(STARTER_ARTICLES.length, 5);
    const all = getAllArticles();
    assert.equal(all.length, 5);
  });

  await t.test(
    "2. Each article has an outline, 5 structured mistakes, and Class 8 plain language",
    () => {
      for (const article of STARTER_ARTICLES) {
        assert.ok(article.slug, "Must have a slug");
        assert.ok(article.title, "Must have a title");
        assert.ok(article.summary, "Must have a summary");
        assert.ok(article.category, "Must have a category");
        assert.ok(article.relatedTaskSlug, "Must have a relatedTaskSlug");
        assert.ok(article.readTimeMinutes >= 3, "Read time must be at least 3 minutes");

        // Outline check
        assert.ok(Array.isArray(article.outline), "Outline must be an array");
        assert.ok(article.outline.length >= 5, "Outline must have at least 5 topics");

        // Mistakes check
        assert.ok(Array.isArray(article.mistakes), "Mistakes must be an array");
        assert.equal(article.mistakes.length, 5, "Must contain 5 common mistakes");

        for (const m of article.mistakes) {
          assert.ok(m.number >= 1 && m.number <= 5, "Mistake number must be 1 to 5");
          assert.ok(m.title.length > 5, "Mistake title must be descriptive");
          assert.ok(m.whatPeopleDoWrong.length > 10, "whatPeopleDoWrong must be detailed");
          assert.ok(m.consequence.length > 10, "consequence must be detailed");
          assert.ok(m.correctWay.length > 10, "correctWay must provide clear official steps");
        }

        // Takeaways check
        assert.ok(Array.isArray(article.takeawayChecklist), "takeaways must be an array");
        assert.equal(article.takeawayChecklist.length, 5, "Must have 5 key takeaways");
      }
    }
  );

  await t.test(
    "3. Each article includes sources, verification dates, and 'Mark facts to verify'",
    () => {
      for (const article of STARTER_ARTICLES) {
        // Sources
        assert.ok(Array.isArray(article.sources) && article.sources.length >= 1);
        for (const src of article.sources) {
          assert.ok(src.url.startsWith("https://"), `Source URL must be HTTPS: ${src.url}`);
          assert.ok(
            src.url.includes(".gov.in") || src.url.includes(".nic.in"),
            `Official source must be a government domain: ${src.url}`
          );
        }

        // Last verified date
        const verifiedDate = new Date(article.lastVerifiedAt);
        assert.ok(!isNaN(verifiedDate.getTime()), "lastVerifiedAt must be a valid ISO date");
        const ageInDays = (Date.now() - verifiedDate.getTime()) / (1000 * 60 * 60 * 24);
        assert.ok(ageInDays <= 180, "Article must have been verified within 180 days");

        // Facts to verify requirement (Prompt 144)
        assert.ok(
          Array.isArray(article.factsToVerify) && article.factsToVerify.length >= 2,
          `Article ${article.slug} must include factsToVerify`
        );

        const hasVerified = article.factsToVerify.some((f) => f.status === "VERIFIED");
        const hasNeedsVerification = article.factsToVerify.some(
          (f) => f.status === "NEEDS_VERIFICATION"
        );
        assert.ok(
          hasVerified,
          `Article ${article.slug} must include at least one verified statutory rule`
        );
        assert.ok(
          hasNeedsVerification,
          `Article ${article.slug} must explicitly mark state variations with NEEDS_VERIFICATION`
        );
      }
    }
  );

  await t.test("4. getArticleBySlug retrieves articles correctly and handles 404s", () => {
    const a1 = getArticleBySlug("5-common-learner-licence-mistakes");
    assert.ok(a1);
    assert.equal(a1?.relatedTaskSlug, "driving-licence-learner");

    const a2 = getArticleBySlug("passport-renewal-rejection-reasons");
    assert.ok(a2);
    assert.equal(a2?.relatedTaskSlug, "passport-renewal");

    const notFound = getArticleBySlug("non-existent-article-slug");
    assert.equal(notFound, null);
  });

  await t.test("5. getArticleStaticSlugs covers all 5 articles", () => {
    const slugs = getArticleStaticSlugs();
    assert.equal(slugs.length, 5);
    const slugList = slugs.map((s) => s.slug);
    assert.ok(slugList.includes("5-common-learner-licence-mistakes"));
    assert.ok(slugList.includes("passport-renewal-rejection-reasons"));
    assert.ok(slugList.includes("permanent-driving-test-day-one-mistakes"));
    assert.ok(slugList.includes("used-car-bike-rc-transfer-pitfalls"));
    assert.ok(slugList.includes("name-and-address-spelling-mismatch-traps"));
  });

  await t.test(
    "6. Route page files exist and configure Article structured data and light theme",
    () => {
      const indexPath = path.join(process.cwd(), "src/app/guides/articles/page.tsx");
      const detailPath = path.join(process.cwd(), "src/app/guides/articles/[slug]/page.tsx");

      assert.ok(fs.existsSync(indexPath), "Index page must exist");
      assert.ok(fs.existsSync(detailPath), "Detail page must exist");

      const indexContent = fs.readFileSync(indexPath, "utf-8");
      const detailContent = fs.readFileSync(detailPath, "utf-8");

      // Structural checks
      assert.ok(detailContent.includes("generateStaticParams"), "Must export generateStaticParams");
      assert.ok(detailContent.includes("generateMetadata"), "Must export generateMetadata");
      assert.ok(detailContent.includes("application/ld+json"), "Must include Article JSON-LD");
      assert.ok(
        detailContent.includes("NEEDS VERIFICATION"),
        "Must include facts to verify warning tags"
      );

      // Strict light theme verification
      assert.ok(!indexContent.includes("dark:"), "No dark mode classes in index");
      assert.ok(!detailContent.includes("dark:"), "No dark mode classes in detail");
    }
  );
});
