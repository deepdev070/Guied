import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin/server-auth";
import { getTaskContent, saveTaskContent } from "@/lib/admin/task-storage";
import { recordAuditLog } from "@/lib/admin/audit";

const VerifySchema = z.object({
  sourceUrl: z.string().url("A valid official source URL is required (e.g. .gov.in / .nic.in)"),
  checkedOfficialSite: z.literal(true, {
    errorMap: () => ({ message: "You must confirm checking the official website" }),
  }),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const body = await req.json().catch(() => null);

  const parsed = VerifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues.map((i) => i.message) },
      { status: 400 }
    );
  }

  const { sourceUrl, notes } = parsed.data;

  // Retrieve existing guide
  const task = getTaskContent(slug);
  if (!task) {
    return NextResponse.json({ error: `Guide ${slug} not found` }, { status: 404 });
  }

  const oldVerifiedAt = task.national.lastVerifiedAt;
  const oldSourceUrl = task.national.sourceUrl;
  const oldVerifiedBy = task.national.verifiedBy;

  const verifiedAt = new Date().toISOString();
  const verifiedBy = session.username;

  // Update verification metadata
  task.national.lastVerifiedAt = verifiedAt;
  task.national.verifiedBy = verifiedBy;
  task.national.sourceUrl = sourceUrl;

  // Persist updated guide
  const saveResult = await saveTaskContent(
    task,
    verifiedBy,
    `Marked as verified today by ${verifiedBy} (Source: ${sourceUrl})`
  );

  if (!saveResult.success) {
    return NextResponse.json(
      { error: "Failed to persist verified guide", issues: saveResult.errors },
      { status: 500 }
    );
  }

  // Trigger on-demand ISR cache revalidation
  try {
    revalidatePath(`/${slug}`);
    revalidatePath(`/${slug}/gujarat`);
    revalidatePath(`/hi/${slug}`);
    revalidatePath(`/gu/${slug}`);
    revalidatePath(`/admin/guides/${slug}`);
    revalidatePath(`/admin`);
  } catch (revalidateErr) {
    console.warn("Revalidation warning:", revalidateErr);
  }

  // Record audit log with before/after state (Prompt 110)
  await recordAuditLog({
    action: "VERIFY_GUIDE",
    actor: verifiedBy,
    targetSlug: slug,
    targetType: "guide",
    before: {
      lastVerifiedAt: oldVerifiedAt,
      sourceUrl: oldSourceUrl,
      verifiedBy: oldVerifiedBy,
    },
    after: {
      lastVerifiedAt: verifiedAt,
      sourceUrl,
      verifiedBy,
    },
    details: {
      sourceUrl,
      notes: notes || "Checked and verified against official portal",
      lastVerifiedAt: verifiedAt,
    },
  });

  return NextResponse.json({
    ok: true,
    slug,
    lastVerifiedAt: verifiedAt,
    verifiedBy,
    sourceUrl,
    message: `Guide /${slug} marked as verified today by ${verifiedBy}. Cache revalidated and audit logged.`,
  });
}
