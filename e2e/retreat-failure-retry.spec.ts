import { test, expect } from "@playwright/test";
import { mockRetreatApi } from "./helpers/mock-api";
import { fillRetreatRequired, confirmRetreatModal } from "./helpers/fill";

const SLUG = "test-retreat";
const RETREAT_URL = `/retreat/${SLUG}/retreat`;

test.describe("실패 페이지 - 재시도 흐름", () => {
  test.beforeEach(async ({ page }) => {
    await mockRetreatApi(page, {
      open: true,
      registerStatus: 400,
      registerError: "정원 초과",
    });
  });

  test("수양회 등록 400 → '신청 오류' 실패 페이지에서 '다시 시도하기'를 누르면 수양회 신청 폼으로 돌아간다", async ({
    page,
  }) => {
    await page.goto(RETREAT_URL);

    // 수양회 해피패스 입력 후 제출 → 확인 모달 동의 → 확인
    await fillRetreatRequired(page);
    await page.getByRole("button", { name: "수양회 신청하기" }).click();
    await expect(page.getByText("신청 정보 확인")).toBeVisible();
    await confirmRetreatModal(page);

    // 실패 페이지: 제목 "신청 오류" + 서버 메시지 "정원 초과"
    await expect(page).toHaveURL(
      new RegExp(`/retreat/${SLUG}/registration-failure`)
    );
    await expect(
      page.getByRole("heading", { name: "신청 오류" })
    ).toBeVisible();
    await expect(page.getByText("정원 초과")).toBeVisible();

    // "다시 시도하기" 링크 클릭 → 수양회 신청 폼(/retreat/test-retreat)으로 이동
    await page.getByRole("link", { name: "다시 시도하기" }).click();

    await expect(page).toHaveURL(new RegExp(`/retreat/${SLUG}/retreat$`));

    // 폼이 렌더링되는지 확인: 개인정보 동의 라벨 또는 제출 버튼이 보인다.
    await expect(
      page.getByText("개인정보 수집 및 이용에 동의합니다")
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "수양회 신청하기" })
    ).toBeVisible();
  });
});
