import { NextResponse, type NextRequest } from "next/server";
import { getAdminSession } from "@/lib/admin/server-auth";
import { getTaskContent, saveTaskContent } from "@/lib/admin/task-storage";
import { recordAuditLog } from "@/lib/admin/audit";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const task = getTaskContent(slug);

  if (!task) {
    return NextResponse.json({ error: `Guide ${slug} not found` }, { status: 404 });
  }

  return NextResponse.json({ ok: true, task });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const body = await req.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: "Missing request body" }, { status: 400 });
  }

  // Ensure slug matches route
  body.slug = slug;

  const beforeTask = getTaskContent(slug);

  const result = await saveTaskContent(body, session.username);
  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: result.errors },
      { status: 400 }
    );
  }

  // Record audit log with before/after state (Prompt 110)
  if (result.data) {
    await recordAuditLog({
      action: "UPDATE_GUIDE",
      actor: session.username,
      targetSlug: slug,
      targetType: "guide",
      before: beforeTask
        ? {
            name: beforeTask.name,
            categorySlug: beforeTask.categorySlug,
            status: beforeTask.national?.status,
            title: beforeTask.national?.title,
            feesCount: beforeTask.national?.fees?.length || 0,
            docsCount: beforeTask.national?.documentRequirements?.length || 0,
          }
        : null,
      after: {
        name: result.data.name,
        categorySlug: result.data.categorySlug,
        status: result.data.national?.status,
        title: result.data.national?.title,
        feesCount: result.data.national?.fees?.length || 0,
        docsCount: result.data.national?.documentRequirements?.length || 0,
      },
      details: {
        summaryOfChanges: "Guide content updated via Admin Editor",
      },
    });
  }

  return NextResponse.json({
    ok: true,
    message: "Guide updated successfully",
    task: result.data,
  });
}
