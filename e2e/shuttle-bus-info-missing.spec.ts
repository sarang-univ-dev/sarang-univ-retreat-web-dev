import { test, expect } from "@playwright/test";
import { mockRetreatApi } from "./helpers/mock-api";

const SLUG = "test-retreat";
const SHUTTLE_URL = `/retreat/${SLUG}/shuttle-bus`;

// 셔틀버스 info 조회가 실패하면(라우트 미모킹 → 실제 백엔드 없음) 페이지는
// "셔틀버스 정보를 찾을 수 없습니다." 분기를 보여준다.
test.describe("셔틀버스 페이지 - 버스 정보 없음 분기", () => {
  test("shuttleBus info 조회 실패 시 정보 없음 메시지를 표시한다", async ({
    page,
  }) => {
    await mockRetreatApi(page, { open: true, shuttleBus: false });
    await page.goto(SHUTTLE_URL);

    await expect(
      page.getByText("셔틀버스 정보를 찾을 수 없습니다.")
    ).toBeVisible({ timeout: 15000 });
  });
});
