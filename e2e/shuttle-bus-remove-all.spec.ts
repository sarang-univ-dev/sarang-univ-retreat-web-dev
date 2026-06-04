import { test, expect } from "@playwright/test";
import { mockRetreatApi } from "./helpers/mock-api";
import { toggleCheckbox } from "./helpers/form";

// SelectedBusesCard에서 선택한 버스를 X 버튼으로 모두 제거하는 흐름을 검증한다.
// Source under test:
//   src/components/forms/selected-buses-card.tsx (카드 제목 "선택한 셔틀버스", 행 div.bg-muted, 행 내 X 버튼)
//   src/components/forms/bus-total-card.tsx ("총 금액:" 카드)
// 버스 이름은 fixture(e2e/fixtures/retreat.ts)에서 그대로 인용한다.

const SLUG = "test-retreat";
const SHUTTLE_URL = `/retreat/${SLUG}/shuttle-bus`;

const BUS_201_NAME = "1호차 (목요일 오전 출발)";
const BUS_203_NAME = "3호차 (토요일 복귀)";

test.describe("셔틀버스 선택 전체 제거", () => {
  test.beforeEach(async ({ page }) => {
    await mockRetreatApi(page, { open: true });
  });

  test("선택한 버스를 X 버튼으로 모두 제거하면 총 금액/선택 카드가 사라진다", async ({
    page,
  }) => {
    await page.goto(SHUTTLE_URL);

    // 버스 201, 203 선택
    await toggleCheckbox(page, "bus-201");
    await toggleCheckbox(page, "bus-203");

    // 선택 시 "총 금액:" 카드와 "선택한 셔틀버스" 카드가 노출된다
    await expect(page.getByText("총 금액:")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "선택한 셔틀버스" })
    ).toBeVisible();

    // 두 버스 행이 모두 렌더된다 (각 행은 div.bg-muted, name은 p.font-semibold)
    await expect(page.locator("div.bg-muted")).toHaveCount(2);

    // 201 행의 X 버튼으로 제거
    await page
      .locator("div.bg-muted", { hasText: BUS_201_NAME })
      .getByRole("button")
      .click();
    await expect(page.locator("div.bg-muted")).toHaveCount(1);

    // 203 행의 X 버튼으로 제거
    await page
      .locator("div.bg-muted", { hasText: BUS_203_NAME })
      .getByRole("button")
      .click();

    // 모두 제거되면 "총 금액:"와 "선택한 셔틀버스" 모두 사라진다
    await expect(page.getByText("총 금액:")).toHaveCount(0);
    await expect(
      page.getByRole("heading", { name: "선택한 셔틀버스" })
    ).toHaveCount(0);
  });
});
