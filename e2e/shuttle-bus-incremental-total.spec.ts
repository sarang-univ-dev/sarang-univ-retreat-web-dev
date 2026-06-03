import { test, expect } from "@playwright/test";
import { mockRetreatApi } from "./helpers/mock-api";
import { toggleCheckbox } from "./helpers/form";

// 버스를 점진적으로 선택/제거하면서 총 금액(BusTotalCard "총 금액:")이 누적/갱신되는지 검증한다.
// Source under test:
//   src/components/forms/bus-total-card.tsx       ("총 금액:")
//   src/components/forms/selected-buses-card.tsx  (행 div.bg-muted, 행 내 X 버튼)
// 버스 이름은 fixture(e2e/fixtures/retreat.ts)에서 그대로 인용한다.
//   201 = "1호차 (목요일 오전 출발)" (15,000원)
//   202 = "2호차 (목요일 오후 출발)" (15,000원)

const SLUG = "test-retreat";
const SHUTTLE_URL = `/retreat/${SLUG}/shuttle-bus`;

const BUS_201_NAME = "1호차 (목요일 오전 출발)";
const BUS_202_NAME = "2호차 (목요일 오후 출발)";

test.describe("셔틀버스 총 금액 점진적 누적/갱신", () => {
  test.beforeEach(async ({ page }) => {
    await mockRetreatApi(page, { open: true });
  });

  test("201 선택 -> 15,000원, 202 추가 -> 30,000원, 201 제거 -> 15,000원", async ({
    page,
  }) => {
    await page.goto(SHUTTLE_URL);

    // 총 금액 카드를 카드 단위로 스코프
    const totalCard = page
      .locator("div.flex.justify-between.items-center", {
        has: page.getByText("총 금액:"),
      })
      .first();

    // bus-201 선택 -> 15,000원
    await toggleCheckbox(page, "bus-201");
    await expect(totalCard).toBeVisible();
    await expect(totalCard.getByText("15,000원")).toBeVisible();

    // bus-202 추가 선택 -> 30,000원
    await toggleCheckbox(page, "bus-202");
    await expect(totalCard.getByText("30,000원")).toBeVisible();

    // 선택 목록의 bus-201 행에서 X 버튼으로 제거 -> 15,000원
    await page
      .locator("div.bg-muted", { hasText: BUS_201_NAME })
      .getByRole("button")
      .click();

    await expect(
      page.locator("p.font-semibold", { hasText: BUS_201_NAME })
    ).toHaveCount(0);
    await expect(
      page.locator("p.font-semibold", { hasText: BUS_202_NAME })
    ).toBeVisible();
    await expect(totalCard.getByText("15,000원")).toBeVisible();
  });
});
