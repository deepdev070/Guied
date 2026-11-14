import fs from "node:fs";
import path from "node:path";
import {
  evaluatePublishingGate,
  THIN_CONTENT_CRITERIA,
  type ThinContentCheckResult,
} from "../src/lib/thin-content-guard.ts";
import type { TaskContent } from "../src/types/content.ts";

function runThinContentAudit() {
  const tasksDir = path.join(process.cwd(), "src/content/tasks");
  const files = fs.readdirSync(tasksDir).filter((f) => f.endsWith(".json"));

  const results: ThinContentCheckResult[] = [];
  let hasFailures = false;

  console.log("🛡️ Running Thin-Content Publishing Gate (Prompt 83)...");
  console.log(`Criteria:`);
  console.log(`  - Min Documents:      ${THIN_CONTENT_CRITERIA.MIN_DOCUMENTS}`);
  console.log(`  - Min Steps:          ${THIN_CONTENT_CRITERIA.MIN_STEPS}`);
  console.log(`  - Fee Info:           Required`);
  console.log(`  - Min FAQs:           ${THIN_CONTENT_CRITERIA.MIN_FAQS}`);
  console.log(`  - Min Official Links: ${THIN_CONTENT_CRITERIA.MIN_OFFICIAL_LINKS}`);
  console.log(`  - Max Verification:   <= ${THIN_CONTENT_CRITERIA.MAX_VERIFICATION_AGE_DAYS} days`);
  console.log(`  - Min Word Count:     ${THIN_CONTENT_CRITERIA.MIN_WORD_COUNT} words\n`);

  for (const file of files) {
    const filePath = path.join(tasksDir, file);
    const content = JSON.parse(fs.readFileSync(filePath, "utf8")) as TaskContent;

    // 1. Evaluate National Variant
    const natResult = evaluatePublishingGate(content.national, content);
    results.push(natResult);
    if (!natResult.passed) hasFailures = true;

    // 2. Evaluate State Overrides (if any)
    if (content.states) {
      for (const [stateCode, stateOverride] of Object.entries(content.states)) {
        // Merge state override with national
        const mergedVariant = {
          ...content.national,
          ...stateOverride,
          steps: stateOverride.steps || content.national.steps,
          documentRequirements:
            stateOverride.documentRequirements || content.national.documentRequirements,
          fees: stateOverride.fees || content.national.fees,
          faqItems: stateOverride.faqItems || content.national.faqItems,
          officialLinks: stateOverride.officialLinks || content.national.officialLinks,
        };

        const stateResult = evaluatePublishingGate(mergedVariant, content, {
          stateSlug: stateCode.toLowerCase(),
        });
        results.push(stateResult);
        if (!stateResult.passed) hasFailures = true;
      }
    }
  }

  // Display summary table
  const summaryTable = results.map((r) => ({
    Page: r.stateSlug ? `${r.taskSlug} (${r.stateSlug})` : `${r.taskSlug} (National)`,
    Passed: r.passed ? "✅ PASS" : "❌ FAIL",
    Docs: r.metrics.documentCount,
    Steps: r.metrics.stepCount,
    Fees: r.metrics.hasFeeInfo ? "Yes" : "No",
    FAQs: r.metrics.faqCount,
    Links: r.metrics.officialLinkCount,
    Words: r.metrics.wordCount,
    AgeDays: r.metrics.daysSinceVerification,
  }));

  console.table(summaryTable);

  if (hasFailures) {
    console.error("\n❌ THIN CONTENT GATE FAILED: The following pages failed quality standards:");
    for (const r of results) {
      if (!r.passed) {
        console.error(`\n- ${r.taskSlug}${r.stateSlug ? ` [${r.stateSlug}]` : ""}:`);
        for (const v of r.violations) {
          console.error(`    • ${v}`);
        }
      }
    }
    process.exit(1);
  } else {
    console.log(
      `\n✨ 100% of pages (${results.length}/${results.length}) passed the publishing gate! Safe from low-value content penalties.\n`
    );
  }
}

runThinContentAudit();

