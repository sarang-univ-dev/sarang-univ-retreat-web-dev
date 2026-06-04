import { test, expect } from "@playwright/test";
import { mockRetreatApi } from "./helpers/mock-api";

const SLUG = "test-retreat";
const RETREAT_URL = `/retreat/${SLUG}/retreat`;
const SHUTTLE_BUS_URL = `/retreat/${SLUG}/shuttle-bus`;

test.describe("신청 기간이 닫혔을 때 (period closed)", () => {
  test.beforeEach(async ({ page }) => {
    await mockRetreatApi(page, { open: false });
  });

  test("retreat 페이지 방문 시 period-closed 실패 페이지로 리다이렉트된다", async ({
    page,
  }) => {
    await page.goto(RETREAT_URL);

    await expect(page).toHaveURL(
      new RegExp(
        `/retreat/${SLUG}/registration-failure\\?reason=period-closed`
      )
    );
    await expect(
      page.getByRole("heading", { name: "수양회 신청 기간이 아닙니다" })
    ).toBeVisible();
  });

  test("shuttle-bus 페이지 방문 시 period-closed 실패 페이지로 리다이렉트된다", async ({
    page,
  }) => {
    await page.goto(SHUTTLE_BUS_URL);

    await expect(page).toHaveURL(
      new RegExp(
        `/retreat/${SLUG}/registration-failure\\?reason=period-closed`
      )
    );
    await expect(
      page.getByRole("heading", { name: "수양회 신청 기간이 아닙니다" })
    ).toBeVisible();
  });
});
