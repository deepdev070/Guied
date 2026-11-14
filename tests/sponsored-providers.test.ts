import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { getActiveSponsoredProviders } from "../src/lib/sponsored-providers.ts";
import { SPONSORED_PROVIDERS_SEED } from "../src/data/sponsored-providers.ts";

test("Prompt 92: Prisma schema defines SponsoredProvider with date windows", () => {
  const schemaPath = path.join(process.cwd(), "prisma/schema.prisma");
  const content = fs.readFileSync(schemaPath, "utf-8");

  assert.ok(
    content.includes("model SponsoredProvider"),
    "Prisma schema must declare SponsoredProvider model"
  );
  assert.ok(content.includes("startDate   DateTime"), "SponsoredProvider must include startDate");
  assert.ok(content.includes("endDate     DateTime"), "SponsoredProvider must include endDate");
  assert.ok(content.includes("stateSlug   String"), "SponsoredProvider must include stateSlug");
  assert.ok(
    content.includes("isActive    Boolean"),
    "SponsoredProvider must include isActive flag"
  );
});

test("Prompt 92: getActiveSponsoredProviders returns up to 3 active providers for Gujarat", async () => {
  assert.ok(
    SPONSORED_PROVIDERS_SEED.length >= 3,
    "Seed data must define at least 3 initial providers"
  );
  const providers = await getActiveSponsoredProviders("gujarat", 3);
  assert.ok(Array.isArray(providers));
  assert.ok(providers.length >= 1 && providers.length <= 3);

  const first = providers[0];
  assert.ok(first);
  assert.equal(first.stateSlug, "gujarat");
  assert.ok(first.name);
  assert.ok(first.city);
  assert.ok(first.phone);
  assert.ok(Array.isArray(first.services) && first.services.length > 0);
  assert.equal(first.isActive, true);
});

test("Prompt 92: SponsoredProviderCard component source satisfies all requirements", () => {
  const cardPath = path.join(process.cwd(), "src/components/ads/SponsoredProviderCard.tsx");
  const content = fs.readFileSync(cardPath, "utf-8");

  // Name, city, services, phone, Sponsored label
  assert.ok(content.includes("Sponsored"), "Must display a clear 'Sponsored' label");
  assert.ok(content.includes("provider.name"), "Must display provider name");
  assert.ok(content.includes("provider.city"), "Must display provider city");
  assert.ok(content.includes("provider.phone"), "Must display provider phone");
  assert.ok(content.includes("tel:"), "Must render a direct tel: dialer link");
  assert.ok(content.includes("provider.services"), "Must display list of available services");
});

test("Prompt 92: StatePageView renders up to 3 sponsored provider cards", () => {
  const pageViewPath = path.join(process.cwd(), "src/components/state/StatePageView.tsx");
  const content = fs.readFileSync(pageViewPath, "utf-8");

  assert.ok(
    content.includes("SponsoredProviderCard"),
    "StatePageView must import and render SponsoredProviderCard"
  );
  assert.ok(
    content.includes("sponsoredProviders.slice(0, 3)"),
    "StatePageView must display up to 3 sponsored providers"
  );
});
