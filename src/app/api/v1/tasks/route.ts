import { loadAllTaskFiles, formatTaskCost } from "../../../../lib/queries.ts";
import { CATEGORIES_SEED_DATA } from "../../../../../prisma/data/categories.ts";
import { jsonResponse, handleOptions } from "../../../../lib/api-v1/response.ts";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // Pagination params
  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  const limitParam = parseInt(searchParams.get("limit") || "20", 10);

  const page = Math.max(1, isNaN(pageParam) ? 1 : pageParam);
  const limit = Math.min(100, Math.max(1, isNaN(limitParam) ? 20 : limitParam));

  // Filters
  const categoryFilter = searchParams.get("category")?.toLowerCase().trim();
  const stateFilter = searchParams.get("state")?.toLowerCase().trim();

  const allTasks = loadAllTaskFiles();

  // Map to summaries
  let filtered = allTasks.map((t) => {
    const category = CATEGORIES_SEED_DATA.find((c) => c.slug === t.categorySlug);
    const availableStates = Object.keys(t.states || {});

    // Compute cost
    const cost = formatTaskCost(t.national.fees || []);

    return {
      slug: t.slug,
      name: t.name,
      description: t.description || t.national.summary,
      categorySlug: t.categorySlug,
      categoryName: category?.name || t.categorySlug,
      difficulty: t.national.difficulty,
      estimatedTime: t.national.estimatedTime,
      cost,
      availableStates,
      lastVerifiedAt: t.national.lastVerifiedAt,
    };
  });

  // Apply category filter
  if (categoryFilter) {
    filtered = filtered.filter((t) => t.categorySlug === categoryFilter);
  }

  // Apply state filter
  if (stateFilter) {
    if (stateFilter === "national" || stateFilter === "all-india") {
      filtered = filtered.filter((t) => t.availableStates.length === 0);
    } else {
      filtered = filtered.filter(
        (t) => t.availableStates.includes(stateFilter) || t.availableStates.length === 0
      );
    }
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const offset = (page - 1) * limit;
  const paginatedTasks = filtered.slice(offset, offset + limit);

  return jsonResponse(request, paginatedTasks, {
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
