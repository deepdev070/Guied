import { test, expect } from "@playwright/test";

test.describe("Prompt 114: Offline Checklists Usability and Zero-Sync Invariant", () => {
  test("saved checklists are fully usable offline and show offline indicator with zero server sync", async ({
    page,
    context,
  }) => {
    // Track any network mutations (POST/PUT/PATCH/DELETE) to prove zero server sync
    const serverSyncRequests: string[] = [];
    page.on("request", (req) => {
      const method = req.method();
      const url = req.url();
      if (
        (method === "POST" || method === "PUT" || method === "PATCH" || method === "DELETE") &&
        url.includes("/api/")
      ) {
        // Exclude analytics pings or CSRF token gets if any
        if (!url.includes("/api/analytics")) {
          serverSyncRequests.push(`${method} ${url}`);
        }
      }
    });

    // 1. Visit guide page online
    await page.goto("/driving-licence-learner", { waitUntil: "domcontentloaded" });

    // Ensure documents section is visible
    const docSection = page.locator("#documents");
    await expect(docSection).toBeVisible();

    // 2. Simulate network going offline
    await context.setOffline(true);
    await page.evaluate(() => {
      window.dispatchEvent(new Event("offline"));
    });

    // 3. Verify the offline indicator is displayed
    const offlineNotice = page.getByRole("status").filter({
      hasText: /Offline - your progress is saved on this device/i,
    });
    await expect(offlineNotice).toBeVisible();

    // 4. Check off documents while offline
    const checkboxes = page.locator('#documents input[type="checkbox"]');
    const firstCheckbox = checkboxes.first();
    await firstCheckbox.check();
    await expect(firstCheckbox).toBeChecked();

    const secondCheckbox = checkboxes.nth(1);
    await secondCheckbox.check();
    await expect(secondCheckbox).toBeChecked();

    // 5. Verify local storage contains checked items without any server sync
    const storedDocs = await page.evaluate(() => {
      const key = "checklist_driving-licence-learner_national";
      return JSON.parse(localStorage.getItem(key) || "[]");
    });
    expect(storedDocs.length).toBeGreaterThanOrEqual(2);

    // Assert zero sync requests were fired to any server endpoint
    expect(serverSyncRequests).toEqual([]);

    // 6. Navigate to /my-checklists while still offline
    await page.goto("/my-checklists", { waitUntil: "domcontentloaded" });

    // Offline notice should still be visible on /my-checklists
    const myChecklistsOfflineNotice = page.getByRole("status").filter({
      hasText: /Offline - your progress is saved on this device/i,
    });
    await expect(myChecklistsOfflineNotice).toBeVisible();

    // The active checklist should reflect local progress
    await expect(page.locator("h2").filter({ hasText: /No active checklists/i })).not.toBeVisible();
    await expect(page.getByText(/Learner's Licence|driving-licence-learner/i)).toBeVisible();

    // Restore online status
    await context.setOffline(false);
    await page.evaluate(() => {
      window.dispatchEvent(new Event("online"));
    });
  });
});
