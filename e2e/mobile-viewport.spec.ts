import { test, expect } from "@playwright/test";
import { mockRetreatApi } from "./helpers/mock-api";
import { fillRetreatRequired, confirmRetreatModal, fillBusRequired } from "./helpers/fill";
import { toggleCheckbox } from "./helpers/form";

const SLUG = "test-retreat";

// 모바일 뷰포트(iPhone 12 폭)에서 폼이 사용 가능하고 가로 오버플로가 없어야 한다.
test.use({ viewport: { width: 390, height: 844 } });

test.describe("모바일 뷰포트", () => {
  test.beforeEach(async ({ page }) => {
    await mockRetreatApi(page, { open: true });
  });

  test("수양회 폼을 모바일에서 끝까지 작성·제출할 수 있다", async ({ page }) => {
    await page.goto(`/retreat/${SLUG}/retreat`);
    await expect(page.locator("#name")).toBeVisible();
    await fillRetreatRequired(page);
    await page.getByRole("button", { name: "수양회 신청하기" }).click();
    await confirmRetreatModal(page);
    await expect(page).toHaveURL(
      new RegExp(`/retreat/${SLUG}/registration-success`)
    );
  });

  test("셔틀버스 폼을 모바일에서 끝까지 작성·제출할 수 있다", async ({ page }) => {
    await page.goto(`/retreat/${SLUG}/shuttle-bus`);
    await expect(page.locator("#name")).toBeVisible();
    await fillBusRequired(page);
    await page.getByRole("button", { name: /신청하기/ }).click();
    await expect(
      page.getByRole("heading", { name: "신청 정보 확인" })
    ).toBeVisible();
    await toggleCheckbox(page, "refundPolicyConsent");
    await page.getByRole("button", { name: "확인" }).click();
    await expect(page).toHaveURL(
      new RegExp(`/retreat/${SLUG}/shuttle-bus-registration-success`)
    );
  });

  test("문서 본문이 뷰포트보다 가로로 넘치지 않는다 (셔틀버스)", async ({
    page,
  }) => {
    await page.goto(`/retreat/${SLUG}/shuttle-bus`);
    await expect(page.locator("#name")).toBeVisible();
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth
    );
    expect(overflow, `가로 오버플로 ${overflow}px`).toBeLessThanOrEqual(1);
  });
});
