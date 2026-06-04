import { test, expect } from "@playwright/test";
import { mockRetreatApi } from "./helpers/mock-api";
import { toggleCheckbox } from "./helpers/form";

// Focused on the shuttle-bus selection UI: 총 금액 card (BusTotalCard) and the
// SelectedBusesCard listing. Source under test:
//   src/components/bus-registration-form.tsx
//   src/components/forms/bus-total-card.tsx       ("총 금액:")
//   src/components/forms/selected-buses-card.tsx  ("선택한 셔틀버스")
// All Korean copy is quoted verbatim from those sources / fixtures.

const SLUG = "test-retreat";
const SHUTTLE_URL = `/retreat/${SLUG}/shuttle-bus`;

// Bus checkbox ids come from `bus-${bus.id}`; fixture ids/names:
//   201 = "1호차 (목요일 오전 출발)"  (교회 -> 수양관)
//   203 = "3호차 (토요일 복귀)"        (수양관 -> 교회)
const BUS_201_NAME = "1호차 (목요일 오전 출발)";
const BUS_203_NAME = "3호차 (토요일 복귀)";

// SelectedBusesCard renders each selected bus as a row containing the bus name
// (<p class="font-semibold"> inside a <div class="bg-muted"> row) with a remove
// control: a ghost icon <Button> (X) with no accessible name. The bus NAME also
// appears in the always-rendered selection list (span.font-medium), so to assert
// "is in the selected list" we scope to p.font-semibold (unique to the card).
const selectedName = (page: import("@playwright/test").Page, name: string) =>
  page.locator("p.font-semibold", { hasText: name });

const selectedRow = (page: import("@playwright/test").Page, name: string) =>
  page.locator("div.bg-muted", { hasText: name });

test.describe("셔틀버스 선택 - 총 금액 / 선택 목록", () => {
  test.beforeEach(async ({ page }) => {
    await mockRetreatApi(page, { open: true });
  });

  test("(a) 버스 미선택 시 총 금액 카드가 표시되지 않는다", async ({ page }) => {
    await page.goto(SHUTTLE_URL);

    await expect(
      page.getByRole("heading", { name: "셔틀버스 선택" })
    ).toBeVisible();

    // BusTotalCard / SelectedBusesCard 모두 선택 전에는 렌더되지 않음
    await expect(page.getByText("총 금액:")).toHaveCount(0);
    await expect(page.getByText("선택한 셔틀버스")).toHaveCount(0);
  });

  test("(b) bus-201 선택 시 총 금액 '15,000원' + 선택 목록에 표시", async ({
    page,
  }) => {
    await page.goto(SHUTTLE_URL);
    await toggleCheckbox(page, "bus-201");

    // 총 금액 카드 노출
    const totalCard = page
      .locator("div.flex.justify-between.items-center", {
        has: page.getByText("총 금액:"),
      })
      .first();
    await expect(totalCard).toBeVisible();
    await expect(totalCard.getByText("15,000원")).toBeVisible();

    // 선택한 셔틀버스 카드에 해당 버스가 나열됨
    await expect(page.getByText("선택한 셔틀버스")).toBeVisible();
    await expect(selectedName(page, BUS_201_NAME)).toBeVisible();
  });

  test("(c) bus-201 + bus-203 선택 시 총 금액 '30,000원'", async ({ page }) => {
    await page.goto(SHUTTLE_URL);
    await toggleCheckbox(page, "bus-201");
    await toggleCheckbox(page, "bus-203");

    const totalCard = page
      .locator("div.flex.justify-between.items-center", {
        has: page.getByText("총 금액:"),
      })
      .first();
    await expect(totalCard.getByText("30,000원")).toBeVisible();

    await expect(selectedName(page, BUS_201_NAME)).toBeVisible();
    await expect(selectedName(page, BUS_203_NAME)).toBeVisible();
  });

  test("(d) 선택 목록에서 버스 제거 시 총 금액이 갱신된다", async ({ page }) => {
    await page.goto(SHUTTLE_URL);
    await toggleCheckbox(page, "bus-201");
    await toggleCheckbox(page, "bus-203");

    const totalCard = page
      .locator("div.flex.justify-between.items-center", {
        has: page.getByText("총 금액:"),
      })
      .first();
    await expect(totalCard.getByText("30,000원")).toBeVisible();

    // 선택 목록의 bus-203 행에서 X(ghost icon) 버튼 클릭 -> 제거
    await selectedRow(page, BUS_203_NAME).getByRole("button").click();

    // 선택 카드에서 제거되고 총 금액이 15,000원으로 갱신
    await expect(selectedName(page, BUS_203_NAME)).toHaveCount(0);
    await expect(selectedName(page, BUS_201_NAME)).toBeVisible();
    await expect(totalCard.getByText("15,000원")).toBeVisible();
  });
});
