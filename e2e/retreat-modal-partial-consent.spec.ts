import { test, expect } from "@playwright/test";
import { mockRetreatApi } from "./helpers/mock-api";
import { toggleCheckbox } from "./helpers/form";
import { fillRetreatRequired } from "./helpers/fill";

const SLUG = "test-retreat";
const RETREAT_URL = `/retreat/${SLUG}/retreat`;

const CONSENT_ERROR = "해당 내용을 읽고 체크박스에 체크해주세요";

test.describe("수양회 확인 모달 - 부분 동의", () => {
  test.beforeEach(async ({ page }) => {
    await mockRetreatApi(page, { open: true });
  });

  test("일정 변경 동의만 체크 후 확인 시 환불 동의 에러 하나만 남고 모달이 유지된다", async ({
    page,
  }) => {
    await page.goto(RETREAT_URL);

    await fillRetreatRequired(page);

    await page.getByRole("button", { name: "수양회 신청하기" }).click();
    await expect(
      page.getByRole("heading", { name: "신청 정보 확인" })
    ).toBeVisible();

    await toggleCheckbox(page, "scheduleChangeConsent");
    await page.getByRole("button", { name: "확인" }).click();

    await expect(
      page.locator("p.text-red-500", { hasText: CONSENT_ERROR })
    ).toHaveCount(1);

    await expect(
      page.getByRole("heading", { name: "신청 정보 확인" })
    ).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`/retreat/${SLUG}/retreat`));
  });

  test("환불 동의까지 추가로 체크 후 확인 시 신청 완료 페이지로 이동한다", async ({
    page,
  }) => {
    await page.goto(RETREAT_URL);

    await fillRetreatRequired(page);

    await page.getByRole("button", { name: "수양회 신청하기" }).click();
    await expect(
      page.getByRole("heading", { name: "신청 정보 확인" })
    ).toBeVisible();

    await toggleCheckbox(page, "scheduleChangeConsent");
    await page.getByRole("button", { name: "확인" }).click();

    await expect(
      page.locator("p.text-red-500", { hasText: CONSENT_ERROR })
    ).toHaveCount(1);

    await toggleCheckbox(page, "refundPolicyConsent");
    await page.getByRole("button", { name: "확인" }).click();

    await expect(page).toHaveURL(
      new RegExp(`/retreat/${SLUG}/registration-success`)
    );
    await expect(
      page.getByRole("heading", { name: "수양회 신청 완료" })
    ).toBeVisible();
  });
});
