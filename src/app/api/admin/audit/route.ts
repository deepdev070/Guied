import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "../../../../lib/admin/server-auth.ts";
import { listAuditLogs } from "../../../../lib/admin/audit.ts";

export async function GET(request: NextRequest) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || undefined;
  const action = searchParams.get("action") || undefined;
  const actor = searchParams.get("actor") || undefined;
  const targetSlug = searchParams.get("targetSlug") || undefined;
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? parseInt(limitParam, 10) : 200;

  const logs = await listAuditLogs({
    search,
    action,
    actor,
    targetSlug,
    limit,
  });

  return NextResponse.json({
    success: true,
    total: logs.length,
    logs,
  });
}
