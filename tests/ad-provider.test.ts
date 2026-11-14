import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { getAdProvider } from "../src/lib/ads/provider.ts";

test("Prompt 89: getAdProvider defaults to 'none' adapter when unset", () => {
  delete process.env.NEXT_PUBLIC_AD_PROVIDER;
  const provider = getAdProvider();
  assert.equal(provider.name, "none");
});

test("Prompt 89: getAdProvider resolves 'adsense' adapter when configured", () => {
  process.env.NEXT_PUBLIC_AD_PROVIDER = "adsense";
  const provider = getAdProvider();
  assert.equal(provider.name, "adsense");
  delete process.env.NEXT_PUBLIC_AD_PROVIDER;
});

test("Prompt 89: Google AdSense adapter implements manual slots with auto ads OFF", () => {
  const providerPath = path.join(process.cwd(), "src/lib/ads/provider.ts");
  const content = fs.readFileSync(providerPath, "utf-8");

  // Auto ads must be OFF: manual slots with data-ad-slot and data-full-width-responsive="false"
  assert.ok(
    content.includes('setAttribute("data-ad-slot"'),
    "AdSense adapter must explicitly set data-ad-slot on manual ins tags"
  );
  assert.ok(
    content.includes('setAttribute("data-full-width-responsive", "false")'),
    "AdSense adapter must disable full-width-responsive auto-expansion to prevent CLS"
  );
  assert.ok(
    content.includes("isAdvertisingAllowed()"),
    "AdSense adapter must check user privacy consent before initializing scripts"
  );
});

test("Prompt 89: AdSlot implements lazy loading via IntersectionObserver and graceful adblock fallback", () => {
  const adSlotPath = path.join(process.cwd(), "src/components/ads/AdSlot.tsx");
  const content = fs.readFileSync(adSlotPath, "utf-8");

  // IntersectionObserver lazy loading
  assert.ok(
    content.includes("IntersectionObserver"),
    "AdSlot must implement IntersectionObserver for lazy loading"
  );
  assert.ok(
    content.includes("rootMargin"),
    "AdSlot must configure rootMargin to prefetch without UI jank"
  );

  // Ad-blocker friendly fallback (Zero guilt-tripping)
  assert.ok(content.includes("isBlocked"), "AdSlot must track blocked state");
  assert.ok(
    content.includes("Support free paperwork checklists"),
    "AdSlot must show friendly polite support note when blocked"
  );
  assert.equal(
    content.toLowerCase().includes("please disable your ad blocker"),
    false,
    "AdSlot must never guilt-trip the user with 'disable your ad blocker' demands"
  );
});
