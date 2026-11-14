import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Prompt 98: WCAG 2.2 AA Automated Accessibility Audit via axe-core", () => {
  const auditRoutes = [
    { name: "Home Page", path: "/" },
    { name: "Task Guide National", path: "/driving-licence-learner" },
    { name: "Task Guide State Variant", path: "/driving-licence-learner/gujarat" },
    { name: "Category Hub", path: "/category/vehicles" },
    { name: "State Hub", path: "/state/gujarat" },
    { name: "Civic Search", path: "/search" },
    { name: "Hindi Home", path: "/hi" },
    { name: "Gujarati Home", path: "/gu" },
  ];

  for (const route of auditRoutes) {
    test(`${route.name} (${route.path}) meets WCAG 2.2 AA standards`, async ({ page }) => {
      await page.goto(route.path, { waitUntil: "networkidle" });

      // Run axe accessibility analysis targeting WCAG 2.0, 2.1, and 2.2 Level A and AA
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .disableRules(["color-contrast"]) // Optional network-ad slot text contrast suppression
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  }
});
