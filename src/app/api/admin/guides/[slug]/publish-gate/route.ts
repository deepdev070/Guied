import { NextResponse, type NextRequest } from "next/server";
import { getAdminSession } from "@/lib/admin/server-auth";
import { getTaskContent } from "@/lib/admin/task-storage";
import { runPublishGate } from "@/lib/admin/publish-gate";
import type { TaskContent } from "@/types/content";

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const body = await req.json().catch(() => null);

  // Use provided task body or load existing from disk
  const taskToEvaluate: TaskContent | null = body || getTaskContent(slug);

  if (!taskToEvaluate) {
    return NextResponse.json({ error: `Guide ${slug} not found` }, { status: 404 });
  }

  const report = runPublishGate(taskToEvaluate, "PUBLISHED");

  return NextResponse.json({
    ok: true,
    slug,
    report,
  });
}
