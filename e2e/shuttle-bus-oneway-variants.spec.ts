import { test, expect } from "@playwright/test";
import { mockRetreatApi } from "./helpers/mock-api";
import { fillBusRequired } from "./helpers/fill";

// 편도 모달은 선택한 버스 수가 홀수일 때 노출된다 (방향 무관).
// Source under test:
//   src/components/forms/bus-submit-section.tsx (shuttleBusIds.length % 2 === 1)
//   src/components/forms/oneway-confirm-modal.tsx (한글 카피 그대로 인용)

const SLUG = "test-retreat";
const SHUTTLE_URL = `/retreat/${SLUG}/shuttle-bus`;

test.describe("셔틀버스 편도 모달 (홀수 개수 변형)", () => {
  test.beforeEach(async ({ page }) => {
    await mockRetreatApi(page, { open: true });
  });

  test("3대 모두 선택 (홀수) -> 편도 신청 확인 모달이 뜸", async ({ page }) => {
    await page.goto(SHUTTLE_URL);

    // 201/202/203 모두 선택 => 3개(홀수) => 편도
    await fillBusRequired(page, { busIds: [201, 202, 203] });

    const submit = page.getByRole("button", { name: /신청하기 \(45,000원\)/ });
    await expect(submit).toBeEnabled();
    await submit.click();

    await expect(
      page.getByRole("heading", { name: "편도 신청 확인" })
    ).toBeVisible();
  });

  test("복귀 버스만 선택 (홀수) -> 편도 모달 -> '예, 편도입니다' -> 신청 정보 확인 모달", async ({
    page,
  }) => {
    await page.goto(SHUTTLE_URL);

    // 203(수양관→교회)만 선택 => 1개(홀수) => 편도
    await fillBusRequired(page, { busIds: [203] });

    const submit = page.getByRole("button", { name: /신청하기 \(15,000원\)/ });
    await expect(submit).toBeEnabled();
    await submit.click();

    await expect(
      page.getByRole("heading", { name: "편도 신청 확인" })
    ).toBeVisible();

    await page.getByRole("button", { name: "예, 편도입니다" }).click();

    await expect(
      page.getByRole("heading", { name: "신청 정보 확인" })
    ).toBeVisible();
  });
});
