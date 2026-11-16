import { getAllStates, type StateSeedData } from "../../../../lib/queries.ts";
import { jsonResponse, handleOptions } from "../../../../lib/api-v1/response.ts";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(request: Request) {
  // Sort states alphabetically by name, prioritizing launchState
  const states = [...getAllStates()].sort((a: StateSeedData, b: StateSeedData) => {
    if (a.launchState && !b.launchState) return -1;
    if (!a.launchState && b.launchState) return 1;
    return a.name.localeCompare(b.name);
  });

  return jsonResponse(request, states, {
    maxAge: 86400, // 24 hours
  });
}
