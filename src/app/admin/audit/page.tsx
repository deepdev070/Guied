import { Metadata } from "next";
import { requireAdminSession } from "../../../lib/admin/server-auth.ts";
import { listAuditLogs } from "../../../lib/admin/audit.ts";
import { loadAllTaskFiles } from "../../../lib/queries.ts";
import { AuditLogViewer } from "../../../components/admin/audit/AuditLogViewer.tsx";

export const metadata: Metadata = {
  title: "Audit Log & Editorial Trail | Civic Portal Admin",
  description:
    "Complete tamper-evident log of administrative modifications, verifications, and status changes.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default async function AdminAuditPage() {
  await requireAdminSession();

  const [logs, tasks] = await Promise.all([listAuditLogs({ limit: 250 }), loadAllTaskFiles()]);

  const availableGuides = tasks.map((t) => ({
    slug: t.slug,
    name: t.name,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <AuditLogViewer initialLogs={logs} availableGuides={availableGuides} />
    </div>
  );
}
