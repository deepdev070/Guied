import { Metadata } from "next";
import { requireAdminSession } from "../../../lib/admin/server-auth.ts";
import { listErrorReports } from "../../../lib/admin/reports.ts";
import { loadAllTaskFiles } from "../../../lib/queries.ts";
import { ErrorReportsInbox } from "../../../components/admin/reports/ErrorReportsInbox.tsx";

export const metadata: Metadata = {
  title: "Error Reports Inbox | Civic Portal Admin",
  description:
    "Review, verify, and resolve issues reported by citizens across government paperwork guides.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default async function AdminReportsPage() {
  await requireAdminSession();

  const [reports, tasks] = await Promise.all([listErrorReports(), loadAllTaskFiles()]);

  const availableGuides = tasks.map((t) => ({
    slug: t.slug,
    name: t.name,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <ErrorReportsInbox initialReports={reports} availableGuides={availableGuides} />
    </div>
  );
}
