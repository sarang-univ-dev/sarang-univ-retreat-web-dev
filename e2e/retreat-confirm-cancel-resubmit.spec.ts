import { test, expect } from "@playwright/test";
import { mockRetreatApi } from "./helpers/mock-api";
import { fillRetreatRequired, confirmRetreatModal } from "./helpers/fill";

const SLUG = "test-retreat";
const RETREAT_URL = `/retreat/${SLUG}/retreat`;

test.describe("수양회 확인 모달 취소 후 재신청", () => {
  test.beforeEach(async ({ page }) => {
    await mockRetreatApi(page, { open: true });
  });

  test("모달을 취소하고 다시 열어 신청하면 정상 완료된다", async ({ page }) => {
    await page.goto(RETREAT_URL);

    await fillRetreatRequired(page);

    // 첫 번째 모달 오픈
    await page.getByRole("button", { name: "수양회 신청하기" }).click();
    await expect(
      page.getByRole("heading", { name: "신청 정보 확인" })
    ).toBeVisible();

    // 취소 -> 모달이 닫히고 폼에 머문다
    await page.getByRole("button", { name: "취소" }).click();
    await expect(
      page.getByRole("heading", { name: "신청 정보 확인" })
    ).toHaveCount(0);
    await expect(page).toHaveURL(new RegExp(`/retreat/${SLUG}/retreat`));

    // 다시 신청하기 -> 모달이 다시 열린다
    await page.getByRole("button", { name: "수양회 신청하기" }).click();
    await expect(
      page.getByRole("heading", { name: "신청 정보 확인" })
    ).toBeVisible();

    // 모달 동의 후 확인 -> 신청 완료 페이지로 이동
    await confirmRetreatModal(page);

    await expect(page).toHaveURL(
      new RegExp(`/retreat/${SLUG}/registration-success`)
    );
    await expect(
      page.getByRole("heading", { name: "수양회 신청 완료" })
    ).toBeVisible();
  });
});
