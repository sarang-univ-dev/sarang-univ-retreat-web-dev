import { test, expect } from "@playwright/test";
import { mockRetreatApi } from "./helpers/mock-api";
import { toggleCheckbox, selectOptionByPlaceholder } from "./helpers/form";

const SLUG = "test-retreat";
const RETREAT_URL = `/retreat/${SLUG}/retreat`;

test.describe("retreat registration - NEW_COMER (새가족) path", () => {
  test.beforeEach(async ({ page }) => {
    await mockRetreatApi(page, { open: true });
  });

  test("새가족 신청 시 성공 페이지가 입금 계좌 대신 입금 대기 안내를 보여준다", async ({
    page,
  }) => {
    await page.goto(RETREAT_URL);

    // Fill the form like the happy path.
    await toggleCheckbox(page, "privacyConsent");
    await selectOptionByPlaceholder(page, "부서를 선택해주세요", "1부 사랑부");
    await selectOptionByPlaceholder(
      page,
      "학년을 선택해주세요",
      "1학년 예수마을"
    );
    await page.locator("#currentLeaderName").fill("홍길동");
    await page.locator("#name").fill("이조원");
    await selectOptionByPlaceholder(page, "성별을 선택해주세요", "남");
    await page.locator("#phoneNumber").fill("010-1234-5678");
    await toggleCheckbox(page, "allSchedule");

    // Select the 새가족 user type radio (shadcn radio is a button with role=radio).
    await page.locator("#userType-newcomer").click();

    // Total price block should now read "입금 대기" instead of an amount.
    await expect(page.getByText("입금 대기")).toBeVisible();

    // Submit -> confirm modal.
    await page.getByRole("button", { name: "수양회 신청하기" }).click();
    await expect(page.getByText("신청 정보 확인")).toBeVisible();
    await toggleCheckbox(page, "scheduleChangeConsent");
    await toggleCheckbox(page, "refundPolicyConsent");
    await page.getByRole("button", { name: "확인" }).click();

    // Lands on the success page.
    await expect(page).toHaveURL(
      new RegExp(`/retreat/${SLUG}/registration-success`)
    );
    await expect(
      page.getByRole("heading", { name: "수양회 신청 완료" })
    ).toBeVisible();

    // 새가족 waiting guidance copy (verbatim from registration-complete.tsx).
    await expect(
      page.getByText(/확인이 된 이후 입금 절차가/)
    ).toBeVisible();
    await expect(
      page.getByText(/잠시만 기다려주시면 감사하겠습니다/)
    ).toBeVisible();

    // 신청 유형 row shows the 새가족 label (getUserTypeText).
    await expect(page.getByText("신청 유형:")).toBeVisible();
    await expect(page.getByText("새가족", { exact: true })).toBeVisible();

    // The deposit-account / 입금 금액 block must NOT be shown for special types.
    await expect(page.getByText("입금 계좌:")).toHaveCount(0);
    await expect(page.getByText("입금 금액:")).toHaveCount(0);
    await expect(page.getByText("입금 안내")).toHaveCount(0);
  });
});
