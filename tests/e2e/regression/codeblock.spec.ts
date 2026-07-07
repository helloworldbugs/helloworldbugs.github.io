import { expect, test } from "@playwright/test";
import { POSTS } from "../support/routes";

test("@regression CodeBlock 支持折叠与展开", async ({ page }) => {
  const response = await page.goto(POSTS.postMigrationTest);
  expect(response?.ok()).toBeTruthy();

  const codeBlock = page.locator("code-block").first();
  await expect(codeBlock).toBeVisible();

  const collapseButton = codeBlock.getByRole("button", { name: "Expand code" });
  await expect(collapseButton).toBeVisible();

  await collapseButton.dispatchEvent("click");
  await expect(codeBlock.getByRole("button", { name: "Collapse code" })).toBeVisible();
});

test("@regression CodeBlock 支持进入全屏并可通过 Escape 退出", async ({ page }) => {
  await page.goto(POSTS.postMigrationTest);

  const codeBlock = page.locator("code-block").first();
  await expect(codeBlock).toBeVisible();

  const fullscreenButton = codeBlock.getByRole("button", {
    name: "Enter fullscreen",
  });
  await fullscreenButton.click();

  await expect(codeBlock.getByRole("button", { name: "Exit fullscreen" })).toBeVisible();
  await expect
    .poll(async () => {
      return page.evaluate(() => {
        return document.body.style.overflow;
      });
    })
    .toBe("hidden");

  await page.keyboard.press("Escape");
  await expect(codeBlock.getByRole("button", { name: "Enter fullscreen" })).toBeVisible();
});
