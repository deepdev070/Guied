import fs from "node:fs";
import path from "node:path";
import { getFreshnessInfo } from "../src/lib/freshness.ts";
import { TaskContentSchema, type TaskContent } from "../src/types/content.ts";

interface StaleReportItem {
  Task: string;
  Variant: string;
  Status: string;
  "Days Elapsed": number;
  "Last Verified": string;
  Action: string;
}

function checkStaleContent() {
  console.log("🔍 Scanning civic paperwork content for freshness...\n");

  const tasksDir = path.join(process.cwd(), "src/content/tasks");
  if (!fs.existsSync(tasksDir)) {
    console.log("No tasks directory found.");
    return;
  }

  const files = fs.readdirSync(tasksDir).filter((f) => f.endsWith(".json"));
  const report: StaleReportItem[] = [];

  let totalTasks = 0;
  let freshCount = 0;
  let agingCount = 0;
  let staleCount = 0;

  for (const file of files) {
    const filePath = path.join(tasksDir, file);
    const content = fs.readFileSync(filePath, "utf-8");
    const parsed = TaskContentSchema.safeParse(JSON.parse(content));

    if (!parsed.success) {
      console.warn(`⚠️ Skipping invalid file: ${file}`);
      continue;
    }

    totalTasks++;
    const task: TaskContent = parsed.data;

    // 1. Check National Variant
    const natFreshness = getFreshnessInfo(task.national.lastVerifiedAt);
    if (natFreshness.status === "fresh") freshCount++;
    else if (natFreshness.status === "aging") agingCount++;
    else staleCount++;

    if (natFreshness.status !== "fresh") {
      report.push({
        Task: task.slug,
        Variant: "National",
        Status: natFreshness.status.toUpperCase(),
        "Days Elapsed": natFreshness.daysSince,
        "Last Verified": natFreshness.formattedDate,
        Action: "Re-check official gazette / portal",
      });
    }

    // 2. Check State Overrides
    if (task.states) {
      for (const [stateCode, stateVar] of Object.entries(task.states)) {
        const stateFreshness = getFreshnessInfo(stateVar.lastVerifiedAt);
        if (stateFreshness.status !== "fresh") {
          report.push({
            Task: task.slug,
            Variant: `State (${stateCode})`,
            Status: stateFreshness.status.toUpperCase(),
            "Days Elapsed": stateFreshness.daysSince,
            "Last Verified": stateFreshness.formattedDate,
            Action: `Verify against State ${stateCode} portal`,
          });
        }
      }
    }
  }

  console.log("==========================================");
  console.log("       CONTENT FRESHNESS AUDIT REPORT     ");
  console.log("==========================================");
  console.log(`Total Procedures Audited : ${totalTasks}`);
  console.log(`🟢 Fresh (<= 90 days)     : ${freshCount}`);
  console.log(`🟡 Aging (91-180 days)    : ${agingCount}`);
  console.log(`🔴 Stale (> 180 days)     : ${staleCount}`);
  console.log("==========================================\n");

  if (report.length === 0) {
    console.log("✨ All paperwork guides are fresh and recently verified!\n");
  } else {
    console.log("📋 Items requiring editorial re-verification:");
    console.table(report);
    console.log("\nRun `npm run content:validate` to confirm all URLs and fees after updating.\n");
  }
}

checkStaleContent();
