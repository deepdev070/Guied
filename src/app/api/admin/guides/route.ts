import { NextResponse, type NextRequest } from "next/server";
import { getAdminSession } from "@/lib/admin/server-auth";
import { getTaskContent, saveTaskContent } from "@/lib/admin/task-storage";
import { loadAllTaskFiles } from "@/lib/queries";

export async function GET() {
  const tasks = loadAllTaskFiles();
  return NextResponse.json({ ok: true, count: tasks.length, tasks });
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || !body.slug) {
    return NextResponse.json({ error: "Missing required guide data and slug" }, { status: 400 });
  }

  // Check if guide already exists
  const existing = getTaskContent(body.slug);
  if (existing) {
    return NextResponse.json(
      { error: `Guide with slug "${body.slug}" already exists` },
      { status: 409 }
    );
  }

  const result = await saveTaskContent(body, session.username, "Created new guide");
  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: result.errors },
      { status: 400 }
    );
  }

  return NextResponse.json(
    { ok: true, message: "Guide created successfully", task: result.data },
    { status: 201 }
  );
}
