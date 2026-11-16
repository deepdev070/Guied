import { NextResponse, type NextRequest } from "next/server";
import { getAdminSession } from "@/lib/admin/server-auth";
import { restoreRevision } from "@/lib/admin/revisions";

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const body = await req.json().catch(() => null);

  if (!body || !body.revisionId) {
    return NextResponse.json(
      { error: "Missing required revisionId in request body" },
      { status: 400 }
    );
  }

  const result = await restoreRevision(slug, body.revisionId, session.username);
  if (!result.success) {
    return NextResponse.json(
      { error: result.error || "Failed to restore revision" },
      { status: 400 }
    );
  }

  return NextResponse.json({
    ok: true,
    message: `Restored guide to revision ${body.revisionId}`,
    restoredRevision: result.restoredRevision,
  });
}
