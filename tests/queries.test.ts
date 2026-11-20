import { describe, it } from "node:test";
import assert from "node:assert";
import {
  getTaskBySlug,
  getTaskVariant,
  getPopularTasks,
  getAllTaskStatePairs,
  searchTasks,
  getAllStates,
} from "../src/lib/queries.ts";

describe("Server-Side Query Layer", () => {
  it("loads task by slug", async () => {
    const task = await getTaskBySlug("driving-licence-learner");
    assert.ok(task);
    assert.strictEqual(task.slug, "driving-licence-learner");
    assert.strictEqual(task.categorySlug, "vehicles");
    assert.strictEqual(task.national.fees.length, 2);
  });

  it("returns null for non-existent task slug", async () => {
    const task = await getTaskBySlug("non-existent-task-1234");
    assert.strictEqual(task, null);
  });

  it("returns national variant when no state is specified", async () => {
    const variant = await getTaskVariant("driving-licence-learner", null);
    assert.ok(variant);
    assert.strictEqual(variant.isStateOverride, false);
    assert.strictEqual(variant.taskSlug, "driving-licence-learner");
    assert.match(variant.title, /Learner's Licence/);
  });

  it("merges Gujarat state override when 'gujarat' or 'GJ' is specified", async () => {
    const variant = await getTaskVariant("driving-licence-learner", "gujarat");
    assert.ok(variant);
    assert.strictEqual(variant.isStateOverride, true);
    assert.strictEqual(variant.stateCode, "GJ");
    assert.strictEqual(variant.stateSlug, "gujarat");
    assert.strictEqual(variant.launchState, true);
    assert.match(variant.title, /Gujarat/);
    assert.match(variant.summary, /contactless/i);
  });

  it("returns national baseline with state metadata when state has no custom override", async () => {
    const variant = await getTaskVariant("driving-licence-learner", "maharashtra");
    assert.ok(variant);
    assert.strictEqual(variant.isStateOverride, false);
    assert.strictEqual(variant.stateCode, "MH");
    assert.strictEqual(variant.stateSlug, "maharashtra");
  });

  it("returns popular tasks list", async () => {
    const popular = await getPopularTasks(5);
    assert.ok(Array.isArray(popular));
    assert.ok(popular.length >= 1);
    assert.ok(popular[0]?.slug);
  });

  it("returns all task-state pairs for static page generation", async () => {
    const pairs = await getAllTaskStatePairs();
    assert.ok(Array.isArray(pairs));
    // Each task * 36 states
    assert.ok(pairs.length >= 36);
    assert.ok(pairs.some((p) => p.task === "driving-licence-learner" && p.state === "gujarat"));
    assert.ok(pairs.some((p) => p.task === "driving-licence-learner" && p.state === "delhi"));
    assert.ok(pairs.some((p) => p.task === "passport-renewal" && p.state === "gujarat"));
  });

  it("searches tasks across title, documents, and fees", async () => {
    const byKeyword = await searchTasks("learner");
    assert.ok(byKeyword.length >= 1);

    const byFee = await searchTasks("200");
    assert.ok(byFee.length >= 1);

    const byDoc = await searchTasks("Aadhaar");
    assert.ok(byDoc.length >= 1);

    const noMatch = await searchTasks("xyzabcnonexistent999");
    assert.strictEqual(noMatch.length, 0);
  });

  it("returns all 36 states and union territories", () => {
    const states = getAllStates();
    assert.strictEqual(states.length, 36);
    const gj = states.find((s) => s.code === "GJ");
    assert.ok(gj);
    assert.strictEqual(gj.launchState, true);
  });
});
