import { auditInternalLinkGraph } from "../src/lib/internal-links.ts";

console.log("🕸️  Auditing Internal Link Architecture & Orphan Pages...\n");

const report = auditInternalLinkGraph();

console.table([
  { Metric: "Total Published Pages Audited", Value: report.totalPages },
  { Metric: "Total Internal Hyperlinks", Value: report.totalInternalLinks },
  { Metric: "Average Inbound Links / Page", Value: report.averageInboundLinks },
  { Metric: "Orphan Pages (0 Inbound Links)", Value: report.orphanPages.length },
]);

if (report.orphanPages.length > 0) {
  console.error("\n❌ Found orphan pages with zero inbound internal links:");
  for (const page of report.orphanPages) {
    console.error(`  - ${page}`);
  }
  process.exit(1);
} else {
  console.log(
    "\n✨ 0 ORPHAN PAGES DETECTED! Every single published page has multiple internal inbound links."
  );
  process.exit(0);
}
