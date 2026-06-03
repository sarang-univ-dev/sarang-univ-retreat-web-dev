import { test, expect } from "@playwright/test";
import { mockRetreatApi } from "./helpers/mock-api";
import { fillBusRequired } from "./helpers/fill";

// 셔틀버스 왕복 정상 신청(happy path) 후 완료 페이지에 표시되는 상세 정보를 검증한다.
// 검증 출처: src/components/shuttle-bus-registration-complete.tsx
//   - 이름:    <span class="font-semibold">{name}</span>
//   - 전화:    <span class="font-semibold">{phone}</span>
//   - 총 금액: {totalPrice.toLocaleString()}원
//   - 입금 계좌: {depositAccount} {depositAccountHolder}  (fixture: "신한은행 111-222-333" / "사랑의교회 셔틀")
// 왕복(짝수) busIds=[201,203] -> 편도 확인 모달 없이 정보 확인 모달로 진행.

const SLUG = "test-retreat";
const SHUTTLE_URL = `/retreat/${SLUG}/shuttle-bus`;

test.describe("셔틀버스 신청 완료 페이지 상세 정보", () => {
  test.beforeEach(async ({ page }) => {
    await mockRetreatApi(page, { open: true });
  });

  test("왕복 정상 신청 -> 완료 페이지에 이름/전화/총 금액/입금 계좌 표시", async ({
    page,
  }) => {
    await page.goto(SHUTTLE_URL);

    await fillBusRequired(page, { busIds: [201, 203] });

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

    // 입력한 이름/전화번호 (각각 별도 font-semibold span 으로 렌더).
    await expect(page.getByText("이조원", { exact: true })).toBeVisible();
    await expect(page.getByText("010-1234-5678", { exact: true })).toBeVisible();

    // 왕복 15,000원 x 2 = 30,000원.
    await expect(page.getByText("30,000원", { exact: true })).toBeVisible();

    // 입금 계좌 + 예금주 (한 span 에 "신한은행 111-222-333 사랑의교회 셔틀" 로 합쳐 렌더).
    await expect(page.getByText("입금 계좌:")).toBeVisible();
    await expect(
      page.getByText("신한은행 111-222-333", { exact: false })
    ).toBeVisible();
    await expect(
      page.getByText("사랑의교회 셔틀", { exact: false })
    ).toBeVisible();
  });
});
