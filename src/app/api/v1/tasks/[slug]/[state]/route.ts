import {
  getTaskVariant,
  getTaskBySlug,
  getAllStates,
  type StateSeedData,
} from "../../../../../../lib/queries.ts";
import {
  jsonResponse,
  errorResponse,
  handleOptions,
} from "../../../../../../lib/api-v1/response.ts";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(
  request: Request,
  props: { params: Promise<{ slug: string; state: string }> }
) {
  const { slug, state: stateParam } = await props.params;

  // Check task exists
  const baseTask = await getTaskBySlug(slug);
  if (!baseTask) {
    return errorResponse(request, `Task '${slug}' not found`, 404, "NOT_FOUND");
  }

  // Check state exists
  const normalizedState = stateParam.toLowerCase().trim();
  const allStates = getAllStates();
  const stateObj = allStates.find(
    (s: StateSeedData) => s.slug === normalizedState || s.code.toLowerCase() === normalizedState
  );

  if (!stateObj && normalizedState !== "national" && normalizedState !== "all-india") {
    return errorResponse(
      request,
      `State '${stateParam}' is not a recognized Indian state or UT`,
      404,
      "STATE_NOT_FOUND"
    );
  }

  const variant = await getTaskVariant(slug, stateParam);
  if (!variant) {
    return errorResponse(request, `Task '${slug}' not found`, 404, "NOT_FOUND");
  }

  return jsonResponse(request, variant);
}
