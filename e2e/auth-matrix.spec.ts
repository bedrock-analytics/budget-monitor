import { expect, test } from "@playwright/test";

// Auth matrix: anon/USER/MANAGER/ADMIN x key routes -- the boundary cases this hardening plan
// (M1-M8) was built around. Not a full regression port of every milestone's manual checks.
const PERSONAS = [
  { name: "admin", storageState: "e2e/.auth/admin.json" },
  { name: "manager", storageState: "e2e/.auth/manager.json" },
  { name: "user", storageState: "e2e/.auth/user.json" },
] as const;

test.describe("anonymous", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("protected API rejects with 401", async ({ page }) => {
    const res = await page.request.get("/api/user/allowed-menus");
    expect(res.status()).toBe(401);
  });

  test("protected page redirects to login", async ({ page }) => {
    await page.goto("/budget");
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});

for (const persona of PERSONAS) {
  test.describe(persona.name, () => {
    test.use({ storageState: persona.storageState });

    test("reaches an ordinary protected page", async ({ page }) => {
      await page.goto("/budget");
      await expect(page).not.toHaveURL(/\/auth\/login|\/unauthorized/);
    });

    test("GET /api/user/allowed-menus succeeds", async ({ page }) => {
      const res = await page.request.get("/api/user/allowed-menus");
      expect(res.ok()).toBeTruthy();
    });

    const adminApiStatus = persona.name === "admin" ? 200 : 403;
    test(`GET /api/admin/menu-access -> ${adminApiStatus}`, async ({ page }) => {
      const res = await page.request.get("/api/admin/menu-access");
      expect(res.status()).toBe(adminApiStatus);
    });

    test("/admin/menu-access page", async ({ page }) => {
      await page.goto("/admin/menu-access");
      if (persona.name === "admin") {
        await expect(page).toHaveURL(/\/admin\/menu-access/);
      } else {
        await expect(page).toHaveURL(/\/unauthorized/);
      }
    });

    const dataApiStatus = persona.name === "user" ? 403 : 200;
    test(`GET /api/admin/data -> ${dataApiStatus}`, async ({ page }) => {
      const res = await page.request.get("/api/admin/data");
      expect(res.status()).toBe(dataApiStatus);
    });

    test("/data-management page", async ({ page }) => {
      await page.goto("/data-management");
      if (persona.name === "user") {
        await expect(page).toHaveURL(/\/unauthorized/);
      } else {
        await expect(page).toHaveURL(/\/data-management/);
      }
    });
  });
}
