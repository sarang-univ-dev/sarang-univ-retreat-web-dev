import { test, expect } from "@playwright/test";
import { mockRetreatApi } from "./helpers/mock-api";
import { fillRetreatRequired, confirmRetreatModal } from "./helpers/fill";

const SLUG = "test-retreat";
const RETREAT_URL = `/retreat/${SLUG}/retreat`;

// 부서 정보(입금 계좌) 조회가 실패해도 완료 페이지는 정상 렌더되어야 한다
// (입금 계좌 값만 비어있을 뿐 크래시/빈 화면이 아님).
test.describe("완료 페이지 - 입금 계좌 조회 실패 시 graceful", () => {
  test("univ-group-info 조회 실패해도 완료 페이지가 정상 렌더된다", async ({
    page,
  }) => {
    await mockRetreatApi(page, { open: true, univGroupInfo: false });
    await page.goto(RETREAT_URL);

    await fillRetreatRequired(page);
    await page.getByRole("button", { name: "수양회 신청하기" }).click();
    await confirmRetreatModal(page);

    await expect(page).toHaveURL(
      new RegExp(`/retreat/${SLUG}/registration-success`)
    );
    await expect(
      page.getByRole("heading", { name: "수양회 신청 완료" })
    ).toBeVisible();

    // 입금 계좌 번호는 조회 실패로 표시되지 않는다.
    await expect(page.getByText("신한은행 123-456-789")).toHaveCount(0);
  });
});
