import { test, expect } from "@playwright/test";
import { mockRetreatApi } from "./helpers/mock-api";
import { toggleCheckbox } from "./helpers/form";
import { fillBusRequired } from "./helpers/fill";

const SLUG = "test-retreat";
const SHUTTLE_URL = `/retreat/${SLUG}/shuttle-bus`;

test.describe("셔틀버스 신청 (여성, 왕복)", () => {
  test.beforeEach(async ({ page }) => {
    await mockRetreatApi(page, { open: true });
  });

  test("여성 왕복(201,203) 신청 -> 정보 확인 모달 -> 환불 동의 -> 완료", async ({
    page,
  }) => {
    await page.goto(SHUTTLE_URL);

    // 여성, 왕복(201 교회->수양관 + 203 수양관->교회) = 짝수 => 편도 모달 없음
    await fillBusRequired(page, { gender: "여", busIds: [201, 203] });

    // 총 금액 15,000 * 2 = 30,000원
    const submit = page.getByRole("button", { name: /신청하기 \(30,000원\)/ });
    await expect(submit).toBeEnabled();
    await submit.click();

    // 정보 확인 모달이 바로 표시 (편도 확인 모달 없음)
    await expect(page.getByText("편도 신청 확인")).toHaveCount(0);
    await expect(
      page.getByRole("heading", { name: "신청 정보 확인" })
    ).toBeVisible();

    // 환불 불가 동의 후 확인
    await toggleCheckbox(page, "refundPolicyConsent");
    await page.getByRole("button", { name: "확인" }).click();

    await expect(page).toHaveURL(
      new RegExp(`/retreat/${SLUG}/shuttle-bus-registration-success`)
    );
    await expect(
      page.getByRole("heading", { name: "셔틀버스 신청이 완료되었습니다" })
    ).toBeVisible();
  });
});
