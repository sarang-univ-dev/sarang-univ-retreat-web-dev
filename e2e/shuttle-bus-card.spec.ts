import { test, expect } from "@playwright/test";
import { mockRetreatApi } from "./helpers/mock-api";

// 셔틀버스 페이지는 통합된 RetreatCard(form_kind="셔틀버스")를 렌더한다.
// (별도 ShuttleBusCard 컴포넌트는 제거됨)
const SLUG = "test-retreat";
const SHUTTLE_URL = `/retreat/${SLUG}/shuttle-bus`;

test.describe("셔틀버스 페이지 카드(RetreatCard)", () => {
  test.beforeEach(async ({ page }) => {
    await mockRetreatApi(page, { open: true });
  });

  test("셔틀버스 신청폼 카드에 수양회 정보(이름/장소/말씀/강사/날짜)를 표시한다", async ({
    page,
  }) => {
    await page.goto(SHUTTLE_URL);

    // 통합 카드 타이틀: "... {name} 셔틀버스 신청폼"
    await expect(page.getByText("셔틀버스 신청폼")).toBeVisible();
    await expect(page.getByText("2026 여름수양회").first()).toBeVisible();

    // 장소 (버스 목록 방향 표기와 겹치므로 카드의 정확 일치로 한정)
    await expect(
      page.getByText("사랑의교회 안성수양관", { exact: true })
    ).toBeVisible();

    // 대표 말씀 / 대표 강사(이제 표시됨) / 날짜
    await expect(
      page.getByText("주의 말씀은 내 발에 등이요 내 길에 빛이니이다 (시 119:105)")
    ).toBeVisible();
    await expect(page.getByText("김길동 목사")).toBeVisible();
    await expect(page.getByText(/주후/).first()).toBeVisible();
  });
});
