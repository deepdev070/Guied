import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

// Import route handlers
import {
  GET as getCategories,
  OPTIONS as optionsCategories,
} from "../src/app/api/v1/categories/route.ts";
import { GET as getStates } from "../src/app/api/v1/states/route.ts";
import { GET as getTasks } from "../src/app/api/v1/tasks/route.ts";
import { GET as getTaskBySlug } from "../src/app/api/v1/tasks/[slug]/route.ts";
import { GET as getTaskByState } from "../src/app/api/v1/tasks/[slug]/[state]/route.ts";
import { GET as searchApi } from "../src/app/api/v1/search/route.ts";
import { GET as getUpdates } from "../src/app/api/v1/updates/route.ts";

function createReq(url: string, headers: Record<string, string> = {}): Request {
  return new Request(new URL(url, "http://localhost:3000"), {
    headers: new Headers(headers),
  });
}

describe("Prompt 117: Public API v1 Endpoints & OpenAPI Documentation", () => {
  const docPath = path.join(process.cwd(), "docs", "api.md");

  test("1. OpenAPI documentation exists in docs/api.md", () => {
    assert.ok(fs.existsSync(docPath), "docs/api.md must exist");
    const content = fs.readFileSync(docPath, "utf-8");
    assert.match(content, /openapi:\s*3\.1\.0/i, "Must contain OpenAPI 3.1.0 specification");
    assert.match(content, /\/categories/, "Must document /categories");
    assert.match(content, /\/tasks/, "Must document /tasks");
    assert.match(content, /\/search/, "Must document /search");
    assert.match(content, /\/states/, "Must document /states");
    assert.match(content, /\/updates/, "Must document /updates");
    assert.match(content, /ETag/i, "Must document ETag caching");
    assert.match(content, /Rate Limit/i, "Must document rate limiting");
  });

  test("2. GET /api/v1/categories returns categories list with CORS & ETag", async () => {
    const req = createReq("/api/v1/categories");
    const res = await getCategories(req);

    assert.equal(res.status, 200);
    assert.equal(res.headers.get("access-control-allow-origin"), "*");
    assert.ok(res.headers.get("etag"), "Must have ETag header");
    assert.ok(res.headers.get("x-ratelimit-limit"), "Must have RateLimit header");

    const json = await res.json();
    assert.equal(json.success, true);
    assert.ok(Array.isArray(json.data), "data must be an array");
    assert.ok(json.data.length >= 5, "Must have categories");

    const vehicles = json.data.find((c: { slug: string }) => c.slug === "vehicles");
    assert.ok(vehicles, "Vehicles category must exist");
    assert.ok(typeof vehicles.taskCount === "number", "taskCount must be numeric");
  });

  test("3. OPTIONS request returns preflight CORS response", async () => {
    const res = await optionsCategories();
    assert.equal(res.status, 204);
    assert.equal(res.headers.get("access-control-allow-origin"), "*");
    assert.match(res.headers.get("access-control-allow-methods") || "", /GET/);
  });

  test("4. GET /api/v1/states returns all 36 Indian states and UTs", async () => {
    const req = createReq("/api/v1/states");
    const res = await getStates(req);

    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.equal(json.data.length, 36, "Must contain exactly 36 states and UTs");

    const gujarat = json.data.find((s: { code: string }) => s.code.toUpperCase() === "GJ");
    assert.ok(gujarat, "Gujarat must exist");
    assert.equal(gujarat.launchState, true, "Gujarat must be marked as launchState");
  });

  test("5. GET /api/v1/tasks returns paginated task list with filtering", async () => {
    const req = createReq("/api/v1/tasks?page=1&limit=10&category=vehicles");
    const res = await getTasks(req);

    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.ok(json.pagination, "Must include pagination envelope");
    assert.equal(json.pagination.page, 1);
    assert.equal(json.pagination.limit, 10);
    assert.ok(json.pagination.total >= 1);

    // Filter verification
    for (const t of json.data) {
      assert.equal(t.categorySlug, "vehicles");
    }
  });

  test("6. GET /api/v1/tasks/[slug] returns national variant or 404", async () => {
    // Valid slug
    const req = createReq("/api/v1/tasks/driving-licence-learner");
    const res = await getTaskBySlug(req, {
      params: Promise.resolve({ slug: "driving-licence-learner" }),
    });

    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.equal(json.data.taskSlug, "driving-licence-learner");
    assert.ok(Array.isArray(json.data.documentRequirements));
    assert.ok(Array.isArray(json.data.steps));
    assert.ok(Array.isArray(json.data.fees));

    // Invalid slug -> 404
    const notFoundReq = createReq("/api/v1/tasks/non-existent-xyz");
    const notFoundRes = await getTaskBySlug(notFoundReq, {
      params: Promise.resolve({ slug: "non-existent-xyz" }),
    });
    assert.equal(notFoundRes.status, 404);
  });

  test("7. GET /api/v1/tasks/[slug]/[state] returns state-resolved variant", async () => {
    const req = createReq("/api/v1/tasks/driving-licence-learner/gujarat");
    const res = await getTaskByState(req, {
      params: Promise.resolve({ slug: "driving-licence-learner", state: "gujarat" }),
    });

    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.equal(json.data.stateSlug, "gujarat");
    assert.equal(json.data.stateCode.toUpperCase(), "GJ");
    assert.equal(json.data.launchState, true);
  });

  test("8. GET /api/v1/search requires query and returns fuzzy matches", async () => {
    // Missing q -> 400
    const missingReq = createReq("/api/v1/search");
    const missingRes = await searchApi(missingReq);
    assert.equal(missingRes.status, 400);

    // Valid query
    const validReq = createReq("/api/v1/search?q=driving");
    const validRes = await searchApi(validReq);
    assert.equal(validRes.status, 200);

    const json = await validRes.json();
    assert.equal(json.success, true);
    assert.ok(json.pagination, "Must include pagination");
    assert.ok(json.data.length >= 1, "Must return search results");
    assert.match(json.data[0].task.slug, /driving-licence/);
  });

  test("9. GET /api/v1/updates returns changed content and handles invalid date", async () => {
    // Invalid date format -> 400
    const invalidReq = createReq("/api/v1/updates?since=invalid-date");
    const invalidRes = await getUpdates(invalidReq);
    assert.equal(invalidRes.status, 400);

    // Valid date
    const validReq = createReq("/api/v1/updates?since=2026-01-01");
    const validRes = await getUpdates(validReq);
    assert.equal(validRes.status, 200);

    const json = await validRes.json();
    assert.equal(json.success, true);
    assert.ok(json.data.serverTime, "Must return current serverTime for sync checkpoint");
    assert.ok(typeof json.data.count === "number");
    assert.ok(Array.isArray(json.data.tasks));
  });

  test("10. ETag caching returns 304 Not Modified when unchanged", async () => {
    const initialReq = createReq("/api/v1/categories");
    const initialRes = await getCategories(initialReq);
    const etag = initialRes.headers.get("etag");
    assert.ok(etag, "ETag must be returned");

    // Repeat request with If-None-Match header
    const cachedReq = createReq("/api/v1/categories", {
      "if-none-match": etag,
    });
    const cachedRes = await getCategories(cachedReq);

    assert.equal(cachedRes.status, 304, "Must return 304 Not Modified when ETag matches");
    assert.equal(cachedRes.headers.get("etag"), etag);
  });
});
