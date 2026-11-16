import { NextResponse } from "next/server";
import { requireAdminSession } from "../../../../../lib/admin/server-auth.ts";
import { countOpenErrorReports } from "../../../../../lib/admin/reports.ts";

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const openCount = await countOpenErrorReports();
  return NextResponse.json({ success: true, openCount });
}
