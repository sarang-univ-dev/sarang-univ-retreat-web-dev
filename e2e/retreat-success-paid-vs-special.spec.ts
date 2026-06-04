import { test, expect } from "@playwright/test";
import { mockRetreatApi } from "./helpers/mock-api";
import { toggleCheckbox, selectOptionByPlaceholder } from "./helpers/form";
import {
  fillRetreatRequired,
  confirmRetreatModal,
} from "./helpers/fill";

// 정상(userType none) 신청과 새가족(NEW_COMER) 특별 신청의 완료 페이지를 대조한다.
//
// src/components/registration-complete.tsx:
//   - isSpecialType = userType === "NEW_COMER" || "SOLDIER"
//   - !isSpecialType → "입금 안내" 블록 렌더: "입금 계좌:" + depositAccount + "입금 금액:" + price
//   - isSpecialType  → 대기 안내 문구만 렌더, "입금 계좌:" 블록 없음
// 특별 유형(새가족/군지체)은 폼 총금액이 "예상 총금액: {1차 등록비용 전액}" 으로,
//   완료 페이지는 금액/계좌 블록 없이 대기 안내로 표시된다.

const SLUG = "test-retreat";
const RETREAT_URL = `/retreat/${SLUG}/retreat`;

test.describe("수양회 완료 페이지: 정상 입금 안내 vs 새가족 대기 안내", () => {
  test.beforeEach(async ({ page }) => {
    await mockRetreatApi(page, { open: true });
  });

  test("(a) 정상 신청(userType none) → 입금 안내/입금 계좌 블록과 결제 금액 표시", async ({
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

    // !isSpecialType → "입금 안내" 블록이 렌더된다.
    await expect(page.getByText("입금 안내")).toBeVisible();
    await expect(page.getByText("입금 계좌:")).toBeVisible();
    await expect(
      page.getByText("신한은행 123-456-789", { exact: false })
    ).toBeVisible();

    // 입금 금액은 실제 결제 금액(전참 90,000원)으로 표시되며 "입금 대기"가 아니다.
    await expect(page.getByText("입금 금액:")).toBeVisible();
    await expect(page.getByText("90,000원", { exact: false })).toBeVisible();
    await expect(page.getByText("입금 대기")).toHaveCount(0);
  });

  test("(b) 새가족(NEW_COMER) 신청 → 대기 안내 표시, 입금 계좌 블록 없음", async ({
    page,
  }) => {
    await page.goto(RETREAT_URL);

    await fillRetreatRequired(page);

    // 새가족 유형 선택(shadcn radio = role=radio 버튼).
    await page.locator("#userType-newcomer").click();

    // 폼 총금액 블록은 새가족에게 "예상 총금액: {1차 등록비용 전액}" 을 보여준다.
    await expect(
      page.locator("p.font-bold", { hasText: "예상 총금액" })
    ).toContainText("90,000원");

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

    // isSpecialType → 대기 안내 문구(verbatim from registration-complete.tsx).
    await expect(
      page.getByText(/확인이 된 이후 입금 절차가/)
    ).toBeVisible();
    await expect(
      page.getByText(/잠시만 기다려주시면 감사하겠습니다/)
    ).toBeVisible();

    // 신청 유형 row → 새가족.
    await expect(page.getByText("신청 유형:")).toBeVisible();
    await expect(page.getByText("새가족", { exact: true })).toBeVisible();

    // 특별 유형 → "입금 안내"/"입금 계좌" 블록이 렌더되지 않는다.
    await expect(page.getByText("입금 계좌:")).toHaveCount(0);
    await expect(page.getByText("입금 안내")).toHaveCount(0);
    await expect(page.getByText("입금 금액:")).toHaveCount(0);
  });
});
