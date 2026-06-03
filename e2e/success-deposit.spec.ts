import { test, expect } from "@playwright/test";
import { mockRetreatApi } from "./helpers/mock-api";
import {
  fillRetreatRequired,
  confirmRetreatModal,
  fillBusRequired,
} from "./helpers/fill";

// 신청 완료 페이지에서 부서 정보 쿼리(useUnivGroupInfo)로부터 파생된
// 입금 계좌/예금주가 사용자에게 보이는지 end-to-end 로 검증한다.
//
// 입금 계좌 출처: src/components/registration-complete.tsx
//   (수양회: depositAccount = `${bank} ${holder}` 한 줄로 렌더)
// src/components/shuttle-bus-registration-complete.tsx
//   (셔틀: `{depositAccount} {depositAccountHolder}`)
// fixture: e2e/fixtures/retreat.ts (deposit_account 등)

const SLUG = "test-retreat";
const RETREAT_URL = `/retreat/${SLUG}/retreat`;
const SHUTTLE_URL = `/retreat/${SLUG}/shuttle-bus`;

test.describe("신청 완료 페이지 입금 계좌 노출", () => {
  test.beforeEach(async ({ page }) => {
    await mockRetreatApi(page, { open: true });
  });

  test("(a) 수양회 정상 신청 → 완료 페이지에 수양회 입금 계좌/예금주 표시", async ({
    page,
  }) => {
    await page.goto(RETREAT_URL);

    await fillRetreatRequired(page);

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

    // useUnivGroupInfo 로 파생된 입금 계좌 + 예금주 (한 span 에 합쳐 렌더됨).
    await expect(page.getByText("입금 계좌:")).toBeVisible();
    await expect(page.getByText("신한은행 123-456-789", { exact: false }))
      .toBeVisible();
    await expect(page.getByText("사랑의교회", { exact: false })).toBeVisible();
  });

  test("(b) 셔틀버스 왕복 정상 신청 → 완료 페이지에 셔틀 입금 계좌/예금주 표시", async ({
    page,
  }) => {
    await page.goto(SHUTTLE_URL);

    // 왕복(짝수) 기본값 [201, 203] → 편도 확인 모달 없이 정보 확인 모달로.
    await fillBusRequired(page);

    await page.getByRole("button", { name: /신청하기 \(/ }).click();
    await expect(
      page.getByRole("heading", { name: "신청 정보 확인" })
    ).toBeVisible();

    // 환불 불가 동의 후 확인.
    await page.locator("#refundPolicyConsent").click();
    await page.getByRole("button", { name: "확인" }).click();

    await expect(page).toHaveURL(
      new RegExp(`/retreat/${SLUG}/shuttle-bus-registration-success`)
    );
    await expect(
      page.getByRole("heading", { name: "셔틀버스 신청이 완료되었습니다" })
    ).toBeVisible();

    // useUnivGroupInfo 로 파생된 셔틀 입금 계좌 + 예금주.
    await expect(page.getByText("입금 계좌:")).toBeVisible();
    await expect(page.getByText("신한은행 111-222-333", { exact: false }))
      .toBeVisible();
    await expect(page.getByText("사랑의교회 셔틀", { exact: false }))
      .toBeVisible();
  });
});
