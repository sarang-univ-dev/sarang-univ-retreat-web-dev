import { test, expect } from "@playwright/test";
import { mockRetreatApi } from "./helpers/mock-api";

// Focused on the per-bus departure/arrival time labels rendered by the bus
// selection list. Source under test:
//   src/components/forms/bus-selection-list.tsx
// Each bus row renders the bus name in <span class="font-medium"> and time
// labels "출발: <time>" and (when arrivalTime present) "도착: <time>" inside the
// <Label>. The "도착:" label is conditional (only when bus.arrivalTime is set),
// so we only assert at least one "출발:" label is visible.
// All Korean copy is quoted verbatim from the source / fixtures.

const SLUG = "test-retreat";
const SHUTTLE_URL = `/retreat/${SLUG}/shuttle-bus`;

// Fixture bus ids/names:
//   201 = "1호차 (목요일 오전 출발)"  (교회 -> 수양관)
//   202 = "2호차 (목요일 오후 출발)"  (교회 -> 수양관)
//   203 = "3호차 (토요일 복귀)"        (수양관 -> 교회)
const BUS_NAMES = [
  "1호차 (목요일 오전 출발)",
  "2호차 (목요일 오후 출발)",
  "3호차 (토요일 복귀)",
];

test.describe("셔틀버스 선택 - 출발/도착 시간 라벨", () => {
  test.beforeEach(async ({ page }) => {
    await mockRetreatApi(page, { open: true });
  });

  test("출발 시간 라벨과 세 개의 버스 이름이 목록에 표시된다", async ({
    page,
  }) => {
    await page.goto(SHUTTLE_URL);

    await expect(
      page.getByRole("heading", { name: "셔틀버스 선택" })
    ).toBeVisible();

    // "출발:" 라벨이 최소 하나 표시됨 (departureTime 기반, 항상 렌더)
    await expect(page.getByText("출발:").first()).toBeVisible();

    // 세 개의 버스 이름이 선택 목록(span.font-medium)에 표시됨.
    // SelectedBusesCard(p.font-semibold)와의 중복을 피하기 위해 span.font-medium로 한정.
    for (const name of BUS_NAMES) {
      await expect(
        page.locator("span.font-medium", { hasText: name })
      ).toBeVisible();
    }
  });
});
