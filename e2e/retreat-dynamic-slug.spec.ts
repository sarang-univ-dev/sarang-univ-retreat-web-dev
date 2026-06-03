import { test, expect } from "@playwright/test";
import { mockRetreatApi } from "./helpers/mock-api";
import { fillRetreatRequired, confirmRetreatModal } from "./helpers/fill";

// 라우트의 [slug] 는 동적이다. 다른 slug 로도 동일하게 동작하고
// 완료 페이지 hand-off(in-memory store)도 slug 와 무관하게 작동한다.
const SLUG = "summer-2026";

test.describe("동적 slug", () => {
  test("다른 slug 에서도 정상 신청 → 해당 slug 의 완료 페이지로 이동", async ({
    page,
  }) => {
    await mockRetreatApi(page, { open: true });
    await page.goto(`/retreat/${SLUG}/retreat`);

    await fillRetreatRequired(page);
    await page.getByRole("button", { name: "수양회 신청하기" }).click();
    await confirmRetreatModal(page);

    await expect(page).toHaveURL(
      new RegExp(`/retreat/${SLUG}/registration-success`)
    );
    await expect(
      page.getByRole("heading", { name: "수양회 신청 완료" })
    ).toBeVisible();
  });
});
