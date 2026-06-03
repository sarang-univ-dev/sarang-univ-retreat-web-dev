import { test, expect } from "@playwright/test";
import { mockRetreatApi } from "./helpers/mock-api";
import { toggleCheckbox } from "./helpers/form";

const SLUG = "test-retreat";
const RETREAT_URL = `/retreat/${SLUG}/retreat`;

// 부분참(개별 일정) 선택 시 총금액 계산 동작을 고정한다.
// fixture: 적용 payment 일정당 20,000원, 전참 총 90,000원.
// 정가 취소선/할인율 표기는 제품에서 제거됨 — 총금액만 표시.
// 개별 일정 체크박스는 .schedule-checkbox(Radix 버튼)로 노출되며 nth(N)으로 선택한다.
const totalText = (page: import("@playwright/test").Page, won: string) =>
  page.locator("p.font-bold", { hasText: `총금액: ${won}` });

test.describe("수양회 부분참 총금액 표시", () => {
  test.beforeEach(async ({ page }) => {
    await mockRetreatApi(page, { open: true });
  });

  test("개별 일정 1개 선택 시 총금액 20,000원을 표시한다", async ({ page }) => {
    await page.goto(RETREAT_URL);

    await page.locator(".schedule-checkbox").nth(0).click();

    await expect(totalText(page, "20,000원")).toBeVisible();
    await expect(page.getByText("할인")).toHaveCount(0);
  });

  test("전참 선택 후 개별 일정 1개를 해제하면 전참이 풀리고 금액이 재계산된다", async ({
    page,
  }) => {
    await page.goto(RETREAT_URL);

    // 전참 → 5개 일정 = 90,000원
    await toggleCheckbox(page, "allSchedule");
    await expect(totalText(page, "90,000원")).toBeVisible();

    const allCheckbox = page.locator("#allSchedule");
    await expect(allCheckbox).toHaveAttribute("data-state", "checked");

    // 개별 일정 1개 해제 → 4개 남음, 전참 토글 off
    await page.locator(".schedule-checkbox").nth(0).click();

    await expect(allCheckbox).toHaveAttribute("data-state", "unchecked");

    // 4 × 20,000 = 80,000원
    await expect(totalText(page, "80,000원")).toBeVisible();
  });

  test("개별 일정 5개를 모두 선택하면 전참 가격(90,000원)과 같아진다", async ({
    page,
  }) => {
    await page.goto(RETREAT_URL);

    const checkboxes = page.locator(".schedule-checkbox");
    // toHaveCount는 렌더를 기다린다 (count()는 즉시 반환되어 0일 수 있음).
    await expect(checkboxes).toHaveCount(5);
    for (let i = 0; i < 5; i++) {
      await checkboxes.nth(i).click();
    }

    await expect(totalText(page, "90,000원")).toBeVisible();

    // 전참 체크박스도 함께 켜진다
    await expect(page.locator("#allSchedule")).toHaveAttribute(
      "data-state",
      "checked"
    );
  });
});
