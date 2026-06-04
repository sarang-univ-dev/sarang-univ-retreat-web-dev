import { test, expect } from "@playwright/test";
import { mockRetreatApi } from "./helpers/mock-api";
import { selectOptionByPlaceholder } from "./helpers/form";

const SLUG = "test-retreat";

// 부서 → 학년 종속 동작: 학년은 부서 선택 전 비활성, 부서 변경 시 학년 초기화.
// retreat / shuttle-bus 양쪽에서 동일하게 동작해야 한다.
for (const { label, url } of [
  { label: "수양회", url: `/retreat/${SLUG}/retreat` },
  { label: "셔틀버스", url: `/retreat/${SLUG}/shuttle-bus` },
]) {
  test.describe(`${label} 폼 - 부서/학년 종속`, () => {
    test.beforeEach(async ({ page }) => {
      await mockRetreatApi(page, { open: true });
    });

    test("학년 Select 는 부서 선택 전 비활성화돼 있다", async ({ page }) => {
      await page.goto(url);
      await expect(page.locator("#grade")).toBeVisible();
      await expect(page.locator("#grade")).toBeDisabled();
    });

    test("부서를 선택하면 학년이 활성화되고 옵션이 채워진다", async ({
      page,
    }) => {
      await page.goto(url);
      await selectOptionByPlaceholder(page, "부서를 선택해주세요", "1부 사랑부");
      await expect(page.locator("#grade")).toBeEnabled();
      await selectOptionByPlaceholder(
        page,
        "학년을 선택해주세요",
        "1학년 예수마을"
      );
      await expect(page.locator("#grade")).toContainText("예수마을");
    });

    test("부서를 바꾸면 이미 선택한 학년이 초기화된다", async ({ page }) => {
      await page.goto(url);
      await selectOptionByPlaceholder(page, "부서를 선택해주세요", "1부 사랑부");
      await selectOptionByPlaceholder(
        page,
        "학년을 선택해주세요",
        "1학년 예수마을"
      );
      await expect(page.locator("#grade")).toContainText("예수마을");

      // 다른 부서로 변경 → 학년 placeholder 로 리셋
      await selectOptionByPlaceholder(page, "1부 사랑부", "2부 소망부");
      await expect(page.locator("#grade")).toContainText("학년을 선택해주세요");
      await expect(page.locator("#grade")).not.toContainText("예수마을");
    });
  });
}
