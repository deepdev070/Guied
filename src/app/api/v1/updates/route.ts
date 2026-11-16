import { loadAllTaskFiles } from "../../../../lib/queries.ts";
import { listRevisions } from "../../../../lib/admin/revisions.ts";
import { jsonResponse, errorResponse, handleOptions } from "../../../../lib/api-v1/response.ts";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sinceParam = searchParams.get("since")?.trim();

  let sinceDate: Date;

  if (sinceParam) {
    sinceDate = new Date(sinceParam);
    if (isNaN(sinceDate.getTime())) {
      return errorResponse(
        request,
        "Invalid 'since' date format. Expected ISO 8601 date string (e.g. '2026-01-01' or '2026-01-01T00:00:00Z')",
        400,
        "INVALID_DATE"
      );
    }
  } else {
    // Default to last 30 days
    sinceDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  }

  const allTasks = loadAllTaskFiles();
  const updatedTasks: Array<{
    slug: string;
    name: string;
    categorySlug: string;
    lastVerifiedAt?: string | Date;
    latestRevision?: {
      id: string;
      revisionNumber: number;
      createdAt: string;
      summaryOfChanges: string;
    };
    action: "UPDATED" | "VERIFIED" | "UNCHANGED";
  }> = [];

  for (const task of allTasks) {
    const verifiedAt = task.national.lastVerifiedAt ? new Date(task.national.lastVerifiedAt) : null;

    // Check revision log
    const revisions = await listRevisions(task.slug);
    const recentRevision = revisions.find((r) => new Date(r.createdAt) >= sinceDate);

    const isVerifiedRecently = verifiedAt && verifiedAt >= sinceDate;

    if (recentRevision || isVerifiedRecently) {
      updatedTasks.push({
        slug: task.slug,
        name: task.name,
        categorySlug: task.categorySlug,
        lastVerifiedAt: task.national.lastVerifiedAt,
        latestRevision: recentRevision
          ? {
              id: recentRevision.id,
              revisionNumber: recentRevision.revisionNumber,
              createdAt: recentRevision.createdAt,
              summaryOfChanges: recentRevision.summaryOfChanges,
            }
          : undefined,
        action: recentRevision ? "UPDATED" : "VERIFIED",
      });
    }
  }

  return jsonResponse(request, {
    since: sinceDate.toISOString(),
    serverTime: new Date().toISOString(),
    count: updatedTasks.length,
    tasks: updatedTasks,
  });
}
