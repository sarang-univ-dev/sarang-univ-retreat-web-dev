import { test, expect } from "@playwright/test";
import { mockRetreatApi } from "./helpers/mock-api";
import { fillRetreatRequired, confirmRetreatModal } from "./helpers/fill";

// 수양회 정상 신청(해피패스, 성별 여 / userType none) 후 완료 페이지에
// 신청자가 입력한 정보(이름/연락처)와 결제 금액이 그대로 보이는지 검증한다.
//
// 신청 정보 렌더 출처: src/components/registration-complete.tsx
//   - 이름: font-semibold span, 연락처: font-semibold span
//   - 입금 금액(price): "입금 금액:" 라벨 + 금액 span
// userType none → isSpecialType=false → "입금 안내" 블록이 렌더되어
//   금액이 "입금 대기"가 아닌 실제 결제 금액으로 표시됨.

const SLUG = "test-retreat";
const RETREAT_URL = `/retreat/${SLUG}/retreat`;

test.describe("수양회 신청 완료 페이지 신청 정보 노출", () => {
  test.beforeEach(async ({ page }) => {
    await mockRetreatApi(page, { open: true });
  });

  test("성별 여 전참(userType none) → 완료 페이지에 이름/연락처/결제 금액 표시", async ({
    page,
  }) => {
    await page.goto(RETREAT_URL);

    await fillRetreatRequired(page, { gender: "여" });

    await page.getByRole("button", { name: "수양회 신청하기" }).click();
    await expect(
      page.getByRole("heading", { name: "신청 정보 확인" })
    ).toBeVisible();

    await confirmRetreatModal(page);

    await expect(page).toHaveURL(
      new RegExp(`/retreat/${SLUG}/registration-success`)
    );
    await expect(
      page.getByRole("heading", { name: "수양회 신청 완료" })
    ).toBeVisible();

    // 입력한 이름과 연락처가 그대로 노출.
    await expect(page.getByText("이조원", { exact: false }).first()).toBeVisible();
    await expect(
      page.getByText("010-1234-5678", { exact: false })
    ).toBeVisible();

    // userType none → "입금 안내" 블록(입금 대기 아님) + 전참 결제 금액.
    await expect(page.getByText("입금 금액:")).toBeVisible();
    await expect(page.getByText("90,000원", { exact: false })).toBeVisible();
    await expect(page.getByText("입금 대기")).toHaveCount(0);
  });
});
