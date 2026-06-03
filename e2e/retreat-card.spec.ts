import { test, expect } from "@playwright/test";
import { mockRetreatApi } from "./helpers/mock-api";

const SLUG = "test-retreat";
const RETREAT_URL = `/retreat/${SLUG}/retreat`;

test.describe("RetreatCard 표시", () => {
  test.beforeEach(async ({ page }) => {
    await mockRetreatApi(page, { open: true });
  });

  test("카드에 수양회 기본 정보가 노출된다", async ({ page }) => {
    await page.goto(RETREAT_URL);

    // 수양회 이름: "{year} 대학부 여름연합수양회 {name} 신청폼" 형태의 제목에 포함
    await expect(
      page.getByText("2026 여름수양회", { exact: false })
    ).toBeVisible();

    // 장소
    await expect(page.getByText("사랑의교회 안성수양관")).toBeVisible();

    // 본문 말씀 (시 119:105) — italic <p>로 렌더
    await expect(
      page.getByText("주의 말씀은 내 발에 등이요 내 길에 빛이니이다 (시 119:105)")
    ).toBeVisible();

    // 포맷된 일정 날짜: "주후 ..." + 연도(2026년) 포함
    const dates = page.getByText(/주후/);
    await expect(dates).toBeVisible();
    await expect(dates).toContainText("2026년");

    // 현재 신청 기간 이름: "지금은 {name} 기간입니다." 형태로 렌더
    await expect(
      page.getByText("지금은 얼리버드 기간입니다.")
    ).toBeVisible();
  });
});
