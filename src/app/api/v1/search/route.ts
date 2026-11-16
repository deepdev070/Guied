import { executeSearch, type SearchResult } from "../../../../lib/search.ts";
import { jsonResponse, errorResponse, handleOptions } from "../../../../lib/api-v1/response.ts";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  if (!q) {
    return errorResponse(
      request,
      "Query parameter 'q' is required for search",
      400,
      "MISSING_QUERY"
    );
  }

  // Pagination params
  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  const limitParam = parseInt(searchParams.get("limit") || "20", 10);

  const page = Math.max(1, isNaN(pageParam) ? 1 : pageParam);
  const limit = Math.min(100, Math.max(1, isNaN(limitParam) ? 20 : limitParam));

  const category = searchParams.get("category") || undefined;
  const state = searchParams.get("state") || undefined;

  const rawResults = executeSearch({
    query: q,
    category,
    state,
  });

  const total = rawResults.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const offset = (page - 1) * limit;

  const paginatedResults = rawResults.slice(offset, offset + limit).map((r: SearchResult) => ({
    task: {
      slug: r.item.slug,
      name: r.item.name,
      title: r.item.title,
      summary: r.item.summary,
      categorySlug: r.item.categorySlug,
      categoryName: r.item.categoryName,
      difficulty: r.item.difficulty,
      estimatedTime: r.item.estimatedTime,
      cost: r.item.cost,
      availableStates: r.item.availableStates,
    },
    score: r.score,
    matchedField: r.matchedField,
    matchedSnippet: r.matchedSnippet,
  }));

  return jsonResponse(request, paginatedResults, {
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  });
}
