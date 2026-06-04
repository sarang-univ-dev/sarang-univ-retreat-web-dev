import { test, expect } from "@playwright/test";
import { mockRetreatApi } from "./helpers/mock-api";
import { fillBusRequired } from "./helpers/fill";

// Verifies the one-way ("편도") confirm modal cancel/confirm branches on the
// shuttle-bus form.
// Source under test:
//   src/components/forms/oneway-confirm-modal.tsx (Korean copy quoted verbatim)
//   셔틀버스 등록 폼 (홀수 버스 선택 시 편도 모달 노출)

const SLUG = "test-retreat";
const SHUTTLE_URL = `/retreat/${SLUG}/shuttle-bus`;

test.describe("셔틀버스 편도 모달 취소 (characterization)", () => {
  test.beforeEach(async ({ page }) => {
    await mockRetreatApi(page, { open: true });
  });

  test("'버스 추가 선택' -> 편도 모달 닫힘, 정보 확인 모달 안 뜸 (폼 유지)", async ({
    page,
  }) => {
    await page.goto(SHUTTLE_URL);

    // 단일(홀수) 버스 선택 => 편도
    await fillBusRequired(page, { busIds: [201] });

    const submit = page.getByRole("button", { name: /신청하기 \(15,000원\)/ });
    await expect(submit).toBeEnabled();
    await submit.click();

    // 편도 확인 모달이 먼저 나타남
    await expect(
      page.getByRole("heading", { name: "편도 신청 확인" })
    ).toBeVisible();

    // "버스 추가 선택" -> 편도 모달을 닫고 폼으로 복귀
    await page.getByRole("button", { name: "버스 추가 선택" }).click();
    await expect(page.getByText("편도 신청 확인")).toHaveCount(0);

    // 정보 확인 모달은 열리지 않아야 함
    await expect(page.getByText("신청 정보 확인")).toHaveCount(0);

    // 폼에 그대로 머무름
    await expect(page).toHaveURL(new RegExp(`/retreat/${SLUG}/shuttle-bus`));
  });

  test("'예, 편도입니다' -> 정보 확인 모달이 열림", async ({ page }) => {
    await page.goto(SHUTTLE_URL);

    await fillBusRequired(page, { busIds: [201] });

    await page.getByRole("button", { name: /신청하기 \(15,000원\)/ }).click();
    await expect(
      page.getByRole("heading", { name: "편도 신청 확인" })
    ).toBeVisible();

    await page.getByRole("button", { name: "예, 편도입니다" }).click();
    await expect(
      page.getByRole("heading", { name: "신청 정보 확인" })
    ).toBeVisible();
  });
});
