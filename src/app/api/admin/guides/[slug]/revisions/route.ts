import { NextResponse, type NextRequest } from "next/server";
import { getAdminSession } from "@/lib/admin/server-auth";
import { listRevisions } from "@/lib/admin/revisions";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const revisions = await listRevisions(slug);

  return NextResponse.json({ ok: true, slug, revisions });
}
