import { getTaskVariant } from "../../../../../lib/queries.ts";
import { jsonResponse, errorResponse, handleOptions } from "../../../../../lib/api-v1/response.ts";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(request: Request, props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const task = await getTaskVariant(slug, "national");

  if (!task) {
    return errorResponse(request, `Task '${slug}' not found`, 404, "NOT_FOUND");
  }

  return jsonResponse(request, task);
}
