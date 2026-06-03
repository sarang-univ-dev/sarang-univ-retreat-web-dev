import { test, expect } from "@playwright/test";
import { mockRetreatApi } from "./helpers/mock-api";

const SLUG = "test-retreat";
const RETREAT_URL = `/retreat/${SLUG}/retreat`;

test.describe("RetreatCard 포스터 미존재", () => {
  test.beforeEach(async ({ page }) => {
    await mockRetreatApi(page, { open: true });
  });

  test("posterUrl 없으면 포스터 이미지 없이 수양회 이름이 표시된다", async ({
    page,
  }) => {
    await page.goto(RETREAT_URL);

    // 수양회 이름: "{year} 대학부 여름연합수양회 {name} 신청폼" 제목에 포함
    await expect(
      page.getByText("2026 여름수양회", { exact: false })
    ).toBeVisible();

    // 포스터 <img> 는 alt="{name} 포스터" 로 렌더되며, posterUrl 이 falsy 면 렌더되지 않는다.
    await expect(
      page.getByRole("img", { name: "2026 여름수양회 포스터" })
    ).toHaveCount(0);
  });
});
