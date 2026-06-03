import { test, expect } from "@playwright/test";
import { mockRetreatApi } from "./helpers/mock-api";

const SLUG = "test-retreat";
const RETREAT_URL = `/retreat/${SLUG}/retreat`;

// 부분참(개별 일정) N개 선택 시 총금액을 고정한다.
// fixture: 적용 payment 일정당 20,000원. 정가/할인 표기는 제품에서 제거됨 — 총금액만.
// 개별 일정 체크박스는 .schedule-checkbox(Radix 버튼)로 노출되며 nth(N)으로 선택한다.
const totalText = (page: import("@playwright/test").Page, won: string) =>
  page.locator("p.font-bold", { hasText: `총금액: ${won}` });

async function selectN(page: import("@playwright/test").Page, n: number) {
  const checkboxes = page.locator(".schedule-checkbox");
  await expect(checkboxes).toHaveCount(5); // 렌더 대기
  for (let i = 0; i < n; i++) await checkboxes.nth(i).click();
}

test.describe("수양회 부분참 N개 선택 총금액", () => {
  test.beforeEach(async ({ page }) => {
    await mockRetreatApi(page, { open: true });
  });

  for (const { n, won } of [
    { n: 2, won: "40,000원" },
    { n: 3, won: "60,000원" },
    { n: 4, won: "80,000원" },
  ]) {
    test(`개별 일정 ${n}개 선택 시 총금액 ${won}을 표시한다`, async ({ page }) => {
      await page.goto(RETREAT_URL);
      await selectN(page, n);

      await expect(totalText(page, won)).toBeVisible();
      await expect(page.getByText("할인")).toHaveCount(0);
    });
  }
});
