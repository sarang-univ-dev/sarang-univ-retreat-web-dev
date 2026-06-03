import { test, expect } from "@playwright/test";
import { mockRetreatApi } from "./helpers/mock-api";
import { toggleCheckbox } from "./helpers/form";

const SLUG = "test-retreat";
const RETREAT_URL = `/retreat/${SLUG}/retreat`;

// 총금액 표시 동작을 고정한다. (fixture: 적용 payment=얼리버드 90,000)
// 정가 취소선/할인율 표기는 제품에서 제거됨 — 총금액만 표시.
test.describe("수양회 총금액 표시", () => {
  test.beforeEach(async ({ page }) => {
    await mockRetreatApi(page, { open: true });
  });

  test("전참 선택 시 총금액 90,000원을 표시한다 (할인 표기 없음)", async ({
    page,
  }) => {
    await page.goto(RETREAT_URL);
    await toggleCheckbox(page, "allSchedule");

    await expect(page.getByText("90,000원")).toBeVisible();
    // 할인율/정가 취소선은 더 이상 표시하지 않는다.
    await expect(page.getByText("할인")).toHaveCount(0);
    await expect(page.getByText("110,000원")).toHaveCount(0);
  });

  test("새가족(NEW_COMER) 선택 시 총금액이 '입금 대기'로 표시된다", async ({
    page,
  }) => {
    await page.goto(RETREAT_URL);
    await toggleCheckbox(page, "allSchedule");
    await page.locator("#userType-newcomer").click();

    await expect(page.getByText("입금 대기")).toBeVisible();
    await expect(page.getByText("90,000원")).toHaveCount(0);
  });
});
