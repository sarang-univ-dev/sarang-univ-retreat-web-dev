import { test, expect } from "@playwright/test";
import { mockRetreatApi } from "./helpers/mock-api";
import { selectOptionByPlaceholder } from "./helpers/form";

const SLUG = "test-retreat";
const RETREAT_URL = `/retreat/${SLUG}/retreat`;
const SHUTTLE_URL = `/retreat/${SLUG}/shuttle-bus`;

// fixture 기반 렌더 구조를 검증. (openPeriodRetreatInfo / shuttleBusInfo)
test.describe("렌더 구조 검증", () => {
  test.beforeEach(async ({ page }) => {
    await mockRetreatApi(page, { open: true });
  });

  test("일정 매트릭스: 날짜 2열 + 식사/숙박 4행 + 체크박스 5개", async ({
    page,
  }) => {
    await page.goto(RETREAT_URL);

    // 헤더: "일정 선택" + 고유 날짜 2개 = th 3개
    await expect(page.locator("thead th")).toHaveCount(3);

    // 행 라벨 (EVENT_TYPE_MAP)
    for (const label of ["아침", "점심", "저녁", "숙박"]) {
      await expect(
        page.locator("tbody td", { hasText: label }).first()
      ).toBeVisible();
    }

    // 실제 일정 항목 수만큼 체크박스 (fixture schedule = 5)
    await expect(page.locator(".schedule-checkbox")).toHaveCount(5);

    // 전참 체크박스 존재
    await expect(page.locator("label[for='allSchedule']")).toBeVisible();
  });

  test("부서 Select 는 fixture 의 두 부서를 모두 보여준다", async ({ page }) => {
    await page.goto(RETREAT_URL);
    await page
      .getByRole("combobox")
      .filter({ hasText: "부서를 선택해주세요" })
      .click();
    await expect(page.getByRole("option")).toHaveCount(2);
    await expect(page.getByRole("option", { name: /1부 사랑부/ })).toBeVisible();
    await expect(page.getByRole("option", { name: /2부 소망부/ })).toBeVisible();
  });

  test("학년 옵션은 선택한 부서에 종속된다 (1부=2개, 2부=1개)", async ({
    page,
  }) => {
    await page.goto(RETREAT_URL);

    await selectOptionByPlaceholder(page, "부서를 선택해주세요", "1부 사랑부");
    await page.locator("#grade").click();
    await expect(page.getByRole("option")).toHaveCount(2);
    await page.keyboard.press("Escape");

    await selectOptionByPlaceholder(page, "1부 사랑부", "2부 소망부");
    await page.locator("#grade").click();
    await expect(page.getByRole("option")).toHaveCount(1);
    await expect(
      page.getByRole("option", { name: /소망마을/ })
    ).toBeVisible();
  });

  test("셔틀버스 목록: 3대가 날짜 그룹으로 렌더된다", async ({ page }) => {
    await page.goto(SHUTTLE_URL);
    for (const id of ["bus-201", "bus-202", "bus-203"]) {
      await expect(page.locator(`label[for='${id}']`)).toBeVisible();
    }
    // 날짜 그룹 헤더(h3)가 하나 이상 존재
    await expect(
      page.locator("h3.text-primary").first()
    ).toBeVisible();
  });
});
