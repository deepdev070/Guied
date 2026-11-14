import { describe, it } from "node:test";
import assert from "node:assert";
import {
  getStateBySlugOrCode,
  getTaskUrl,
  DEFAULT_STATE_SLUG,
  USER_STATE_COOKIE_NAME,
  USER_STATE_STORAGE_KEY,
} from "../src/lib/state-preference.ts";

describe("State Preference & Task Routing", () => {
  it("defaults to Gujarat launch state", () => {
    assert.strictEqual(DEFAULT_STATE_SLUG, "gujarat");
    const defaultState = getStateBySlugOrCode(DEFAULT_STATE_SLUG);
    assert.ok(defaultState);
    assert.strictEqual(defaultState.name, "Gujarat");
    assert.strictEqual(defaultState.code, "GJ");
    assert.strictEqual(defaultState.launchState, true);
  });

  it("resolves state by slug case-insensitively", () => {
    const gj = getStateBySlugOrCode("gujarat");
    assert.ok(gj);
    assert.strictEqual(gj.code, "GJ");

    const mh = getStateBySlugOrCode("MAHARASHTRA");
    assert.ok(mh);
    assert.strictEqual(mh.slug, "maharashtra");
  });

  it("resolves state by code case-insensitively", () => {
    const gj = getStateBySlugOrCode("gj");
    assert.ok(gj);
    assert.strictEqual(gj.name, "Gujarat");

    const dl = getStateBySlugOrCode("DL");
    assert.ok(dl);
    assert.strictEqual(dl.slug, "delhi");
  });

  it("returns undefined for unknown state code or slug", () => {
    assert.strictEqual(getStateBySlugOrCode("xyz-nowhere"), undefined);
    assert.strictEqual(getStateBySlugOrCode(""), undefined);
    assert.strictEqual(getStateBySlugOrCode(null), undefined);
  });

  it("formats task URL pointing to state variant", () => {
    const urlWithGj = getTaskUrl("driving-licence-new", "gujarat");
    assert.strictEqual(urlWithGj, "/driving-licence-new/gujarat");

    const urlWithMh = getTaskUrl("driving-licence-new", "maharashtra");
    assert.strictEqual(urlWithMh, "/driving-licence-new/maharashtra");
  });

  it("formats national URL when no state is selected or 'all' is passed", () => {
    assert.strictEqual(getTaskUrl("passport-renewal", null), "/passport-renewal");
    assert.strictEqual(getTaskUrl("passport-renewal", ""), "/passport-renewal");
    assert.strictEqual(getTaskUrl("passport-renewal", "all"), "/passport-renewal");
    assert.strictEqual(getTaskUrl("passport-renewal", "national"), "/passport-renewal");
  });

  it("uses standard persistent cookie and storage keys", () => {
    assert.strictEqual(USER_STATE_COOKIE_NAME, "user_state");
    assert.strictEqual(USER_STATE_STORAGE_KEY, "user_state");
  });
});
