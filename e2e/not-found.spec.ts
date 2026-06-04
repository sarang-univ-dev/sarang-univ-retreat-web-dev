import { test, expect } from "@playwright/test";

// not-found.tsx 는 정적 페이지라 mock 이 필요 없다.
// 존재하지 않는 경로로 진입하면 Next.js 의 not-found 페이지가 렌더된다.
test.describe("not-found 페이지", () => {
  test("알 수 없는 경로로 들어가면 not-found 안내 문구가 보인다", async ({
    page,
  }) => {
    await page.goto("/this-route-does-not-exist");

    await expect(
      page.getByRole("heading", { name: "페이지를 찾을 수 없습니다" })
    ).toBeVisible();
    await expect(
      page.getByText(
        "요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다."
      )
    ).toBeVisible();
  });
});
