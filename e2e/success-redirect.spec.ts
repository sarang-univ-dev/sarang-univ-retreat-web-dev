import { test, expect } from "@playwright/test";
import { mockRetreatApi } from "./helpers/mock-api";

const SLUG = "test-retreat";
const RETREAT_SUCCESS_URL = `/retreat/${SLUG}/registration-success`;
const SHUTTLE_SUCCESS_URL = `/retreat/${SLUG}/shuttle-bus-registration-success`;

// 성공 페이지는 직전 제출 store 스냅샷이 없으면 해당 신청 폼으로 돌려보낸다.
// (404가 되는 /retreat/:slug 가 아니라 실제 페이지인 .../retreat, .../shuttle-bus 로)
test.describe("성공 페이지 가드 - 제출 없이 직접 방문하면 리다이렉트된다", () => {
  test.beforeEach(async ({ page }) => {
    await mockRetreatApi(page, { open: true });
  });

  test("수양회 성공 페이지에 store 없이 직접 들어오면 수양회 신청 폼으로 돌려보낸다", async ({
    page,
  }) => {
    await page.goto(RETREAT_SUCCESS_URL);
    await expect(page).toHaveURL(new RegExp(`/retreat/${SLUG}/retreat$`));
  });

  test("셔틀버스 성공 페이지에 store 없이 직접 들어오면 셔틀버스 신청 폼으로 돌려보낸다", async ({
    page,
  }) => {
    await page.goto(SHUTTLE_SUCCESS_URL);
    await expect(page).toHaveURL(new RegExp(`/retreat/${SLUG}/shuttle-bus$`));
  });
});
