import { getCategories } from "../../../../lib/queries.ts";
import { jsonResponse, handleOptions } from "../../../../lib/api-v1/response.ts";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(request: Request) {
  const categories = await getCategories();
  return jsonResponse(request, categories);
}
