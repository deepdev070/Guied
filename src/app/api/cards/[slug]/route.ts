import { getTaskContent } from "../../../../lib/admin/task-storage.ts";
import {
  getChecklistCardDataFromTask,
  renderChecklistCardSvg,
} from "../../../../lib/checklist-card.ts";

export const dynamic = "force-dynamic";

export async function GET(request: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
    const { searchParams } = new URL(request.url);
    const stateCode = searchParams.get("state") || undefined;
    const isDownload = searchParams.get("download") === "true";

    const task = getTaskContent(slug);
    if (!task) {
      return Response.json({ error: `Guide with slug '${slug}' not found` }, { status: 404 });
    }

    const cardData = getChecklistCardDataFromTask(task, stateCode);
    const svgContent = renderChecklistCardSvg(cardData);

    const filename = `${slug}${stateCode ? `-${stateCode}` : ""}-checklist-card.svg`;
    const disposition = isDownload
      ? `attachment; filename="${filename}"`
      : `inline; filename="${filename}"`;

    return new Response(svgContent, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Content-Disposition": disposition,
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch (error) {
    console.error("Error generating checklist card:", error);
    return Response.json(
      { error: "Internal server error generating checklist card" },
      { status: 500 }
    );
  }
}
