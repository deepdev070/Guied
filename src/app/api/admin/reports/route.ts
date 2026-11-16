import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "../../../../lib/admin/server-auth.ts";
import { listErrorReports, countOpenErrorReports } from "../../../../lib/admin/reports.ts";

export async function GET(request: NextRequest) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const taskSlug = searchParams.get("taskSlug") || undefined;
  const status = searchParams.get("status") || undefined;
  const search = searchParams.get("search") || undefined;

  const [reports, openCount] = await Promise.all([
    listErrorReports({ taskSlug, status, search }),
    countOpenErrorReports(),
  ]);

  return NextResponse.json({
    success: true,
    reports,
    openCount,
  });
}
