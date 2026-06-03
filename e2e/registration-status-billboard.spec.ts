import { test, expect } from "@playwright/test";

// 등록 현황 빌보드(롤링 카운터) 페이지. public-status API 를 모킹해 렌더를 확인한다.
const SLUG = "test-retreat";
const URL = `/retreat/${SLUG}/registration-status/departments/1`;

test.describe("등록 현황 빌보드", () => {
  test("부서명/수양회명/현재 인원 단위를 표시한다", async ({ page }) => {
    await page.route(
      "**/api/v1/retreat/*/registration/public-status/departments/*",
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            retreat: { slug: SLUG, name: "2026 여름수양회" },
            univGroup: { number: 1, name: "1부 사랑부" },
            count: 42,
            updatedAt: new Date().toISOString(),
          }),
        });
      }
    );

    await page.goto(URL);

    await expect(page.getByText("2026 여름수양회").first()).toBeVisible();
    await expect(page.getByText("1부 사랑부")).toBeVisible();
    // 롤링 숫자 + "명" 단위가 노출된다.
    await expect(page.getByText("명").first()).toBeVisible();
  });
});
