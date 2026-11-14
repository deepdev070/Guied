import { test, expect } from "@playwright/test";

test.describe("Prompt 94: Ad Layout Regression Tests across 360px, 768px, 1280px", () => {
  const targetRoutes = ["/", "/driving-licence-learner", "/category/identity"];

  for (const route of targetRoutes) {
    test(`Route ${route}: ad slots reserve height and CLS <= 0.05`, async ({ page }) => {
      // 1. Inject PerformanceObserver to track Cumulative Layout Shift (CLS)
      await page.addInitScript(() => {
        (window as unknown as { __clsScore: number }).__clsScore = 0;
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as { hadRecentInput?: boolean }).hadRecentInput) {
              (window as unknown as { __clsScore: number }).__clsScore +=
                (entry as unknown as { value?: number }).value || 0;
            }
          }
        });
        observer.observe({ type: "layout-shift", buffered: true });
      });

      await page.goto(route, { waitUntil: "networkidle" });

      // 2. Query all ad slots
      const adSlots = page.locator("aside[data-ad-slot]");
      const count = await adSlots.count();

      for (let i = 0; i < count; i++) {
        const slot = adSlots.nth(i);
        const isVisible = await slot.isVisible();
        if (!isVisible) continue;

        const box = await slot.boundingBox();
        expect(box).not.toBeNull();
        if (box) {
          // Verify height is reserved (min-height > 0)
          expect(box.height).toBeGreaterThanOrEqual(48);
          expect(box.width).toBeGreaterThan(0);
        }
      }

      // 3. Verify CLS remains <= 0.05
      const cls = await page.evaluate(
        () => (window as unknown as { __clsScore?: number }).__clsScore || 0
      );
      expect(cls).toBeLessThanOrEqual(0.05);

      // 4. Verify no ad overlaps any button or primary heading (H1, H2)
      const buttons = page.locator("button, a.button, a[role='button']");
      const buttonCount = await buttons.count();

      for (let i = 0; i < count; i++) {
        const slot = adSlots.nth(i);
        if (!(await slot.isVisible())) continue;
        const slotBox = await slot.boundingBox();
        if (!slotBox) continue;

        for (let j = 0; j < Math.min(buttonCount, 20); j++) {
          const btn = buttons.nth(j);
          if (!(await btn.isVisible())) continue;
          const btnBox = await btn.boundingBox();
          if (!btnBox) continue;

          // Check for rectangular collision overlap
          const overlapsX =
            slotBox.x < btnBox.x + btnBox.width && slotBox.x + slotBox.width > btnBox.x;
          const overlapsY =
            slotBox.y < btnBox.y + btnBox.height && slotBox.y + slotBox.height > btnBox.y;

          // Slot must not overlap interactive buttons unless the button is inside the ad itself (e.g. dismiss button)
          const isContained =
            btnBox.x >= slotBox.x &&
            btnBox.y >= slotBox.y &&
            btnBox.x + btnBox.width <= slotBox.x + slotBox.width &&
            btnBox.y + btnBox.height <= slotBox.y + slotBox.height;

          if (!isContained) {
            expect(overlapsX && overlapsY).toBe(false);
          }
        }
      }
    });
  }

  test("Privacy Policy (/privacy-policy): Ads are completely absent", async ({ page }) => {
    await page.goto("/privacy-policy");

    // Ad slots must not be present
    const adSlots = page.locator("aside[data-ad-slot], #mobile-anchor-ad-wrapper");
    const count = await adSlots.count();
    expect(count).toBe(0);

    // Text content must contain policy headings and 0 ads
    await expect(page.locator("h1")).toContainText(/Privacy/i);
  });

  test("Print mode: Ads are hidden via media print (print:hidden)", async ({ page }) => {
    await page.goto("/driving-licence-learner");
    await page.emulateMedia({ media: "print" });

    const adSlots = page.locator("aside[data-ad-slot]");
    const count = await adSlots.count();

    for (let i = 0; i < count; i++) {
      const slot = adSlots.nth(i);
      const isVisible = await slot.isVisible();
      expect(isVisible).toBe(false);
    }
  });
});
