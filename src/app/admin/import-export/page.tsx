import { Metadata } from "next";
import { requireAdminSession } from "../../../lib/admin/server-auth.ts";
import { ImportExportManager } from "../../../components/admin/import-export/ImportExportManager.tsx";

export const metadata: Metadata = {
  title: "Bulk Import & Export | Civic Portal Admin",
  description:
    "Export paperwork guides as JSON or CSV backups, or import batch guides with dry-run validation preview.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default async function AdminImportExportPage() {
  await requireAdminSession();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <ImportExportManager />
    </div>
  );
}
