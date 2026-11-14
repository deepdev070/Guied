import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  saveConsent,
  acceptAllConsent,
  rejectNonEssentialConsent,
  CONSENT_STORAGE_KEY,
  CONSENT_COOKIE_KEY,
} from "../src/lib/consent.ts";

test("Prompt 88: Consent storage defaults and constants", () => {
  assert.equal(CONSENT_STORAGE_KEY, "civic_consent_preferences_v1");
  assert.equal(CONSENT_COOKIE_KEY, "civic_consent");
});

test("Prompt 88: acceptAllConsent enables both analytics and advertising", () => {
  const choice = acceptAllConsent();
  assert.equal(choice.essential, true);
  assert.equal(choice.analytics, true);
  assert.equal(choice.advertising, true);
  assert.equal(choice.status, "accepted_all");
});

test("Prompt 88: rejectNonEssentialConsent keeps essential active and disables non-essential", () => {
  const choice = rejectNonEssentialConsent();
  assert.equal(choice.essential, true, "Essential storage must always remain true");
  assert.equal(choice.analytics, false);
  assert.equal(choice.advertising, false);
  assert.equal(choice.status, "rejected_non_essential");
});

test("Prompt 88: Custom consent saves granular user choices", () => {
  const custom = saveConsent({
    analytics: true,
    advertising: false,
    status: "custom",
  });
  assert.equal(custom.essential, true);
  assert.equal(custom.analytics, true);
  assert.equal(custom.advertising, false);
  assert.equal(custom.status, "custom");
});

test("Prompt 88: ConsentBanner component implements required views and controls", () => {
  const bannerPath = path.join(process.cwd(), "src/components/consent/ConsentBanner.tsx");
  const content = fs.readFileSync(bannerPath, "utf-8");

  // Required actions
  assert.ok(content.includes("Accept all"), "ConsentBanner must provide 'Accept all' button");
  assert.ok(
    content.includes("Reject non-essential"),
    "ConsentBanner must provide 'Reject non-essential' button"
  );
  assert.ok(
    content.includes("Manage choices"),
    "ConsentBanner must provide 'Manage choices' button"
  );

  // Preference management
  assert.ok(
    content.includes("Essential Local Storage"),
    "ConsentBanner must explain essential storage"
  );
  assert.ok(content.includes("Always active"), "Essential storage must be locked as always active");
  assert.ok(content.includes("Analytics"), "ConsentBanner must have analytics toggle");
  assert.ok(content.includes("Advertisements"), "ConsentBanner must have advertising toggle");

  // Accessibility and mobile bottom sheet
  assert.ok(
    content.includes('role="dialog"') || content.includes('aria-modal="true"'),
    "Banner must declare accessible dialog semantics"
  );
  assert.ok(content.includes("bottom-0"), "Banner must dock to bottom on mobile");
});

test("Prompt 88: Footer includes 'Privacy choices' link to re-open consent manager", () => {
  const footerPath = path.join(process.cwd(), "src/components/layout/Footer.tsx");
  const content = fs.readFileSync(footerPath, "utf-8");

  assert.ok(
    content.includes("Privacy choices"),
    "Footer must render a 'Privacy choices' link/button"
  );
  assert.ok(
    content.includes("openConsentManager"),
    "Footer 'Privacy choices' must trigger openConsentManager"
  );
});

test("Prompt 88: Layout mounts ConsentProvider and ConsentBanner", () => {
  const layoutPath = path.join(process.cwd(), "src/app/layout.tsx");
  const content = fs.readFileSync(layoutPath, "utf-8");

  assert.ok(
    content.includes("<ConsentProvider>"),
    "RootLayout must wrap tree with ConsentProvider"
  );
  assert.ok(content.includes("<ConsentBanner />"), "RootLayout must render ConsentBanner");
});
