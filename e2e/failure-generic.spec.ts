import { test, expect } from "@playwright/test";
import { mockRetreatApi } from "./helpers/mock-api";

const SLUG = "test-retreat";
const FAILURE_URL = `/retreat/${SLUG}/registration-failure`;

// 실패 페이지를 store 데이터/ reason 파라미터 없이 직접 방문했을 때의 기본(제네릭) 상태를 고정한다.
test.describe("실패 페이지 - 제네릭(직접 방문)", () => {
  test.beforeEach(async ({ page }) => {
    await mockRetreatApi(page, { open: true });
  });

  test("store 데이터/reason 없이 직접 방문 → '신청 오류' 제목 + 기본 안내 문구를 보여주고 재시도 링크는 없다", async ({
    page,
  }) => {
    await page.goto(FAILURE_URL);

    await expect(
      page.getByRole("heading", { name: "신청 오류" })
    ).toBeVisible();

    // failureData 가 null 이면 폴백 안내 문구를 노출한다.
    await expect(
      page.getByText(
        "죄송합니다. 현재 등록을 완료할 수 없습니다. 다시 시도해주시기 바랍니다."
      )
    ).toBeVisible();

    // registrationType 이 undefined 이므로 재시도 링크는 렌더링되지 않는다.
    await expect(
      page.getByRole("link", { name: "다시 시도하기" })
    ).toHaveCount(0);
  });
});
