import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "../../../../../lib/admin/server-auth.ts";
import {
  getErrorReportById,
  updateErrorReportStatus,
  prepareEmailReply,
  type ReportStatus,
} from "../../../../../lib/admin/reports.ts";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const report = await getErrorReportById(id);

  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  const emailReply = prepareEmailReply(report);

  return NextResponse.json({
    success: true,
    report,
    emailReply,
  });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { status, adminNotes } = body;

    const validStatuses = ["NEW", "NEED_TO_VERIFY", "FIXED", "NOT_AN_ISSUE"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    const updated = await updateErrorReportStatus(id, {
      status: status as ReportStatus,
      adminNotes,
      resolvedBy: session.username,
    });

    const emailReply = prepareEmailReply(updated, adminNotes);

    return NextResponse.json({
      success: true,
      report: updated,
      emailReply,
    });
  } catch (err) {
    console.error("Error updating report status:", err);
    return NextResponse.json({ error: "Internal server error updating report" }, { status: 500 });
  }
}
