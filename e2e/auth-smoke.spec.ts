import { expect, test } from "@playwright/test";

test("login page is reachable", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Connexion" })).toBeVisible({
    timeout: 15_000,
  });
});

test("protected app redirects to login", async ({ page }) => {
  await page.goto("/food");
  await expect(page).toHaveURL(/login/, { timeout: 15_000 });
});
