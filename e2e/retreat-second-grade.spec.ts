import { test, expect } from "@playwright/test";
import { mockRetreatApi } from "./helpers/mock-api";
import { fillRetreatRequired, confirmRetreatModal } from "./helpers/fill";

const SLUG = "test-retreat";
const RETREAT_URL = `/retreat/${SLUG}/retreat`;

// 비-기본 학년 옵션("2학년 사랑마을")으로도 정상 신청이 되는지 확인.
test.describe("수양회 등록 - 비기본 학년 옵션", () => {
  test.beforeEach(async ({ page }) => {
    await mockRetreatApi(page, { open: true });
  });

  test("2학년 사랑마을 선택 후 신청 → 신청 완료 페이지로 이동", async ({
    page,
  }) => {
    await page.goto(RETREAT_URL);

    // univGroup은 기본값("1부 사랑부"), grade만 비기본값으로 지정
    await fillRetreatRequired(page, { grade: "2학년 사랑마을" });

    await page.getByRole("button", { name: "수양회 신청하기" }).click();
    await expect(page.getByText("신청 정보 확인")).toBeVisible();

    await confirmRetreatModal(page);

    await expect(page).toHaveURL(
      new RegExp(`/retreat/${SLUG}/registration-success`)
    );
    await expect(
      page.getByRole("heading", { name: "수양회 신청 완료" })
    ).toBeVisible();
  });
});
