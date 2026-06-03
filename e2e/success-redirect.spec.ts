import { test, expect } from "@playwright/test";
import { mockRetreatApi } from "./helpers/mock-api";

const SLUG = "test-retreat";
const RETREAT_SUCCESS_URL = `/retreat/${SLUG}/registration-success`;
const SHUTTLE_SUCCESS_URL = `/retreat/${SLUG}/shuttle-bus-registration-success`;

// 성공 페이지(registration-success / shuttle-bus-registration-success)는
// 직전 제출로 채워진 store 스냅샷이 없으면 첫 신청 페이지(/retreat/:slug)로
// 돌려보낸다. (success/page.tsx 의 useEffect → router.push(`/retreat/${slug}`))
test.describe("성공 페이지 가드 - 제출 없이 직접 방문하면 리다이렉트된다", () => {
  test.beforeEach(async ({ page }) => {
    // open:true 라야 리다이렉트된 신청 페이지가 정상 로드된다.
    await mockRetreatApi(page, { open: true });
  });

  test("수양회 성공 페이지에 store 없이 직접 들어오면 신청 페이지로 돌려보낸다", async ({
    page,
  }) => {
    await page.goto(RETREAT_SUCCESS_URL);

    // 최종 URL 은 성공 suffix 없이 /retreat/test-retreat 로 시작한다.
    // (리다이렉트된 신청 페이지가 이후 정상 동작하는 것은 허용한다.)
    await expect(page).toHaveURL(
      new RegExp(`/retreat/${SLUG}(?!/registration-success)`)
    );
    await expect(page).not.toHaveURL(/registration-success/);
  });

  test("셔틀버스 성공 페이지에 store 없이 직접 들어오면 신청 페이지로 돌려보낸다", async ({
    page,
  }) => {
    await page.goto(SHUTTLE_SUCCESS_URL);

    await expect(page).toHaveURL(
      new RegExp(`/retreat/${SLUG}(?!/shuttle-bus-registration-success)`)
    );
    await expect(page).not.toHaveURL(/shuttle-bus-registration-success/);
  });
});
