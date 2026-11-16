import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "../../../../../lib/admin/server-auth.ts";
import { executeImport } from "../../../../../lib/admin/import-export.ts";
import { TaskContentSchema, type TaskContent } from "../../../../../types/content.ts";

export async function POST(request: NextRequest) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { guides } = body;

    if (!Array.isArray(guides) || guides.length === 0) {
      return NextResponse.json({ error: "Array of guides is required" }, { status: 400 });
    }

    // Filter and sanitize valid TaskContent guides
    const validGuides: TaskContent[] = [];
    for (const g of guides) {
      const parsed = TaskContentSchema.safeParse(g);
      if (parsed.success) {
        validGuides.push(parsed.data);
      }
    }

    if (validGuides.length === 0) {
      return NextResponse.json(
        { error: "No valid guides could be parsed for import execution" },
        { status: 400 }
      );
    }

    const result = await executeImport(validGuides, session.username);

    return NextResponse.json({
      success: result.success,
      result,
    });
  } catch (err) {
    console.error("Import execution error:", err);
    return NextResponse.json(
      { error: "Internal server error during import execution" },
      { status: 500 }
    );
  }
}
