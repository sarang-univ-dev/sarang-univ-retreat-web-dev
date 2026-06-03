import { test, expect } from "@playwright/test";
import { mockRetreatApi } from "./helpers/mock-api";
import { fillBusRequired } from "./helpers/fill";

// 편도(홀수) vs 왕복(짝수) 모달 분기 추가 변형.
// Source under test:
//   src/components/forms/bus-submit-section.tsx (shuttleBusIds.length % 2 === 1 -> 편도 모달)
//   src/components/forms/oneway-confirm-modal.tsx ("편도 신청 확인")
//   src/components/forms/selected-buses-card.tsx (행 div.bg-muted, 행 내 제거 버튼)
// 버스 이름은 fixture에서 그대로 인용한다.

const SLUG = "test-retreat";
const SHUTTLE_URL = `/retreat/${SLUG}/shuttle-bus`;

const BUS_202_NAME = "2호차 (목요일 오후 출발)";

test.describe("셔틀버스 편도/왕복 모달 (홀수/짝수 변형 2)", () => {
  test.beforeEach(async ({ page }) => {
    await mockRetreatApi(page, { open: true });
  });

  test("(a) 단일 선택 (홀수) -> 편도 신청 확인 모달이 뜸", async ({ page }) => {
    await page.goto(SHUTTLE_URL);

    // 202(교회→수양관) 단일 선택 => 1개(홀수) => 편도
    await fillBusRequired(page, { busIds: [202] });

    const submit = page.getByRole("button", { name: /신청하기 \(15,000원\)/ });
    await expect(submit).toBeEnabled();
    await submit.click();

    await expect(
      page.getByRole("heading", { name: "편도 신청 확인" })
    ).toBeVisible();
  });

  test("(b) 3대 선택 후 2호차 제거 (짝수) -> 편도 모달 없이 신청 정보 확인 모달", async ({
    page,
  }) => {
    await page.goto(SHUTTLE_URL);

    // 201/202/203 모두 선택 => 3개(홀수)
    await fillBusRequired(page, { busIds: [201, 202, 203] });

    // SelectedBusesCard에서 2호차 제거 => 2개(짝수) => 왕복
    await page
      .locator("div.bg-muted", { hasText: BUS_202_NAME })
      .getByRole("button")
      .click();
    await expect(page.locator("div.bg-muted")).toHaveCount(2);

    const submit = page.getByRole("button", { name: /신청하기 \(30,000원\)/ });
    await expect(submit).toBeEnabled();
    await submit.click();

    // 짝수이므로 편도 모달은 나타나지 않고 신청 정보 확인 모달이 바로 열린다
    await expect(page.getByText("편도 신청 확인")).toHaveCount(0);
    await expect(
      page.getByRole("heading", { name: "신청 정보 확인" })
    ).toBeVisible();
  });
});
