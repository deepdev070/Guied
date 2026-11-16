import { test, describe, before, beforeEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

describe("Prompt 125: Bundled Offline Data Pack (Top 10 Gujarat Guides) & Delta Sync Service", () => {
  const mobileDir = path.join(process.cwd(), "apps", "mobile");
  const datapackJsonPath = path.join(mobileDir, "assets", "datapack", "gujarat-top10.json");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let datapackModule: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let syncModule: any;

  before(async () => {
    const datapackPath = path.join(mobileDir, "lib", "offline-datapack.ts");
    const syncPath = path.join(mobileDir, "lib", "sync-service.ts");

    datapackModule = await import(datapackPath);
    syncModule = await import(syncPath);
  });

  beforeEach(() => {
    datapackModule.clearGuideUpdates();
  });

  test("1. Bundled JSON file exists and contains Gujarat top 10 civic guides", () => {
    assert.ok(fs.existsSync(datapackJsonPath), "gujarat-top10.json must exist in assets");
    const raw = fs.readFileSync(datapackJsonPath, "utf-8");
    const pack = JSON.parse(raw);

    assert.ok(pack.version, "Must declare datapack version");
    assert.equal(pack.launchState.code, "GJ");
    assert.equal(pack.launchState.name, "Gujarat");
    assert.equal(pack.guidesCount, 10);
    assert.equal(pack.guides.length, 10);

    const slugs = pack.guides.map((g: { slug: string }) => g.slug);
    assert.ok(slugs.includes("driving-licence-learner"), "Must contain learner driving licence");
    assert.ok(slugs.includes("driving-licence-new"), "Must contain permanent driving licence");
    assert.ok(slugs.includes("passport-renewal"), "Must contain passport renewal");
    assert.ok(slugs.includes("pan-card-new"), "Must contain instant PAN card");
    assert.ok(slugs.includes("voter-id-new"), "Must contain voter registration");
    assert.ok(slugs.includes("ration-card-family"), "Must contain family ration card");
    assert.ok(slugs.includes("income-certificate"), "Must contain revenue income certificate");
    assert.ok(slugs.includes("domicile-certificate"), "Must contain resident domicile certificate");
    assert.ok(slugs.includes("birth-certificate"), "Must contain civil birth certificate");
    assert.ok(slugs.includes("caste-certificate"), "Must contain caste certificate");
  });

  test("2. Every bundled guide passes civic quality, statutory fee, and .gov.in verification rules", () => {
    const raw = fs.readFileSync(datapackJsonPath, "utf-8");
    const pack = JSON.parse(raw);

    const now = Date.now();
    const maxAgeMs = 180 * 24 * 60 * 60 * 1000;

    for (const guide of pack.guides) {
      assert.ok(guide.title.length > 10, `${guide.slug} must have detailed title`);
      assert.ok(guide.summary.length > 20, `${guide.slug} must have plain-language summary`);
      assert.ok(guide.department.length > 5, `${guide.slug} must declare official department`);
      assert.match(
        guide.sourceUrl,
        /\.(gov\.in|nic\.in)/,
        `${guide.slug} sourceUrl must be official .gov.in/.nic.in domain`
      );

      // Freshness: verified within 180 days
      const verifiedTime = new Date(guide.lastVerifiedAt).getTime();
      assert.ok(!isNaN(verifiedTime), `${guide.slug} lastVerifiedAt must be valid date`);
      assert.ok(now - verifiedTime <= maxAgeMs, `${guide.slug} must be verified within 180 days`);

      // Fees
      assert.ok(
        Array.isArray(guide.fees) && guide.fees.length > 0,
        `${guide.slug} must declare fees`
      );
      for (const fee of guide.fees) {
        assert.ok(typeof fee.amount === "number", "Fee amount must be number");
        assert.ok(fee.label.length > 3, "Fee label must be clear");
      }

      // Documents
      assert.ok(
        Array.isArray(guide.documents) && guide.documents.length >= 1,
        `${guide.slug} must list documents`
      );
      for (const doc of guide.documents) {
        assert.ok(doc.id, "Doc must have id");
        assert.ok(doc.name, "Doc must have name");
        assert.ok(doc.description, "Doc must have description");
      }

      // Steps
      assert.ok(
        Array.isArray(guide.steps) && guide.steps.length >= 4,
        `${guide.slug} must have >= 4 steps`
      );

      // FAQs
      assert.ok(
        Array.isArray(guide.faqs) && guide.faqs.length >= 2,
        `${guide.slug} must have FAQs`
      );

      // Official links
      assert.ok(
        Array.isArray(guide.officialLinks) && guide.officialLinks.length >= 1,
        `${guide.slug} must cite official link`
      );
    }
  });

  test("3. offline-datapack service provides fast synchronous lookups and category filtering", () => {
    const { getOfflinePackMeta, getBundledGuide, getAllBundledGuides, getBundledGuidesByCategory } =
      datapackModule;

    const meta = getOfflinePackMeta();
    assert.equal(meta.guidesCount, 10);
    assert.equal(meta.launchState.code, "GJ");

    const llr = getBundledGuide("driving-licence-learner", "gj");
    assert.ok(llr);
    assert.equal(llr.slug, "driving-licence-learner");
    assert.equal(llr.stateCode, "GJ");
    assert.equal(llr.fees[0].amount, 150);

    const pan = getBundledGuide("pan-card-new");
    assert.ok(pan);
    assert.equal(pan.fees[0].amount, 0, "Instant digital e-PAN is ₹0 free");

    const all = getAllBundledGuides();
    assert.equal(all.length, 10);

    const certs = getBundledGuidesByCategory("certificates-and-records");
    assert.ok(certs.length >= 4, "Must find at least 4 certificate guides");
    assert.ok(certs.some((c: { slug: string }) => c.slug === "birth-certificate"));
  });

  test("4. Dynamic overlay allows runtime guide update overrides", () => {
    const { getBundledGuide, registerGuideUpdate } = datapackModule;

    const original = getBundledGuide("driving-licence-learner", "gj");
    assert.ok(original);
    assert.equal(original.fees[0].amount, 150);

    // Register runtime update (e.g. simulated fee revision)
    const updatedGuide = {
      ...original,
      fees: [{ label: "Revised Learner Licence Fee 2026", amount: 180 }],
      lastVerifiedAt: "2026-11-16",
    };

    registerGuideUpdate(updatedGuide);

    const afterUpdate = getBundledGuide("driving-licence-learner", "gj");
    assert.ok(afterUpdate);
    assert.equal(afterUpdate.fees[0].amount, 180);
    assert.equal(afterUpdate.lastVerifiedAt, "2026-11-16");
  });

  test("5. sync-service manages lastSyncTimestamp correctly", () => {
    const { getLastSyncTimestamp, setLastSyncTimestamp } = syncModule;

    const testTime = "2026-11-15T12:00:00.000Z";
    setLastSyncTimestamp(testTime);
    assert.equal(getLastSyncTimestamp(), testTime);
  });

  test("6. syncDeltaUpdates connects to /api/v1/updates?since=, applies delta, and advances timestamp", async () => {
    const { syncDeltaUpdates, getLastSyncTimestamp } = syncModule;
    const { getBundledGuide } = datapackModule;

    const mockSince = "2026-11-01T00:00:00.000Z";
    const mockServerTime = "2026-11-16T10:00:00.000Z";

    // Mock fetch client simulating /api/v1/updates and /api/v1/tasks/:slug/gj
    const mockFetch = async (url: string | URL | Request) => {
      const urlStr = url.toString();

      if (urlStr.includes("/api/v1/updates")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: {
              since: mockSince,
              serverTime: mockServerTime,
              count: 1,
              tasks: [
                {
                  slug: "passport-renewal",
                  name: "Re-issue / Renew Passport",
                  categorySlug: "identity-and-citizenship",
                  lastVerifiedAt: "2026-11-16",
                  action: "UPDATED",
                },
              ],
            },
          }),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any;
      }

      if (urlStr.includes("/api/v1/tasks/passport-renewal/gj")) {
        const base = getBundledGuide("passport-renewal", "gj");
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: {
              ...base,
              summary: "Updated 2026 procedure for passport renewal in Gujarat with DigiLocker.",
              lastVerifiedAt: "2026-11-16",
            },
          }),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any;
      }

      return { ok: false, status: 404 } as any;
    };

    const result = await syncDeltaUpdates({
      since: mockSince,
      baseUrl: "https://paperwork.gov.in",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      fetchFn: mockFetch as any,
    });

    assert.equal(result.success, true);
    assert.equal(result.updatedCount, 1);
    assert.equal(result.serverTime, mockServerTime);
    assert.equal(getLastSyncTimestamp(), mockServerTime);

    // Verify dynamic overlay received the update
    const updated = getBundledGuide("passport-renewal", "gj");
    assert.ok(updated);
    assert.match(updated.summary, /DigiLocker/);
    assert.equal(updated.lastVerifiedAt, "2026-11-16");
  });

  test("7. syncDeltaUpdates handles network offline failure gracefully without crashing", async () => {
    const { syncDeltaUpdates } = syncModule;

    // Simulate complete offline network failure (TypeError: fetch failed)
    const offlineFetch = async () => {
      throw new Error("Network request failed (offline)");
    };

    const result = await syncDeltaUpdates({
      since: "2026-11-01T00:00:00.000Z",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      fetchFn: offlineFetch as any,
    });

    assert.equal(result.success, false);
    assert.equal(result.updatedCount, 0);
    assert.match(result.error || "", /offline/i);

    // App data must remain completely intact from bundled pack
    const guide = datapackModule.getBundledGuide("driving-licence-learner", "gj");
    assert.ok(guide, "Bundled guide must still be accessible offline");
    assert.equal(guide.slug, "driving-licence-learner");
  });
});
