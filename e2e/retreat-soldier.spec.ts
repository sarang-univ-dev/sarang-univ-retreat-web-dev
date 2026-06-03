import { test, expect } from "@playwright/test";
import { mockRetreatApi } from "./helpers/mock-api";
import { fillRetreatRequired, confirmRetreatModal } from "./helpers/fill";

const SLUG = "test-retreat";
const RETREAT_URL = `/retreat/${SLUG}/retreat`;

test.describe("retreat registration - SOLDIER (군지체) path", () => {
  test.beforeEach(async ({ page }) => {
    await mockRetreatApi(page, { open: true });
  });

  test("현역 군지체 신청 시 성공 페이지가 입금 계좌 대신 입금 대기 안내를 보여준다", async ({
    page,
  }) => {
    await page.goto(RETREAT_URL);

    // Fill the retreat form to just-before-submit.
    await fillRetreatRequired(page);

    // Select the 군지체 user type radio (shadcn radio is a button with role=radio).
    await page.locator("#userType-soldier").click();

    // Total price block should now read "입금 대기" instead of an amount.
    await expect(page.getByText("입금 대기")).toBeVisible();

    // Submit -> confirm modal.
    await page.getByRole("button", { name: "수양회 신청하기" }).click();
    await expect(page.getByText("신청 정보 확인")).toBeVisible();
    await confirmRetreatModal(page);

    // Lands on the success page.
    await expect(page).toHaveURL(
      new RegExp(`/retreat/${SLUG}/registration-success`)
    );
    await expect(
      page.getByRole("heading", { name: "수양회 신청 완료" })
    ).toBeVisible();

    // 군지체 waiting guidance copy (verbatim from registration-complete.tsx).
    await expect(page.getByText(/확인이 된 이후 입금 절차가/)).toBeVisible();
    await expect(
      page.getByText(/잠시만 기다려주시면 감사하겠습니다/)
    ).toBeVisible();

    // 신청 유형 row shows the 군지체 label (getUserTypeText("SOLDIER")).
    await expect(page.getByText("신청 유형:")).toBeVisible();
    await expect(page.getByText("군지체", { exact: true })).toBeVisible();

    // The deposit-account / 입금 금액 block must NOT be shown for special types.
    await expect(page.getByText("입금 계좌:")).toHaveCount(0);
    await expect(page.getByText("입금 금액:")).toHaveCount(0);
    await expect(page.getByText("입금 안내")).toHaveCount(0);
  });
});
