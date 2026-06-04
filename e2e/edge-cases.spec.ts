import { test, expect } from "@playwright/test";
import { mockRetreatApi } from "./helpers/mock-api";
import { fillRetreatRequired, confirmRetreatModal } from "./helpers/fill";
import { toggleCheckbox } from "./helpers/form";

const SLUG = "test-retreat";
const RETREAT_URL = `/retreat/${SLUG}/retreat`;

test.describe("수양회 엣지 케이스", () => {
  test.beforeEach(async ({ page }) => {
    await mockRetreatApi(page, { open: true });
  });

  test('리더명이 공백("   ")이면 필수 입력 에러를 낸다', async ({ page }) => {
    await page.goto(RETREAT_URL);
    await page.locator("#currentLeaderName").fill("   ");
    await page.getByRole("button", { name: "수양회 신청하기" }).click();
    await expect(
      page.locator("p.text-red-500", { hasText: "현재 GBS/EBS 리더를 입력해주세요" })
    ).toBeVisible();
  });

  test("전참 → 총금액 만액, 일정 하나 해제 → 부분 금액으로 실시간 갱신", async ({
    page,
  }) => {
    await page.goto(RETREAT_URL);
    await fillRetreatRequired(page); // 1학년 → earlybird, allSchedule 체크됨

    // 전참(5일정) = earlybird 만액 90,000원
    await expect(page.getByText("총금액:")).toContainText("90,000원");

    // 일정 1개 해제 → 4개 = 4 * 20,000 = 80,000원
    await page.locator(".schedule-checkbox").first().click();
    await expect(page.getByText("총금액:")).toContainText("80,000원");
  });

  test("아주 긴 이름(50자)도 정상 제출된다", async ({ page }) => {
    await page.goto(RETREAT_URL);
    const longName = "김".repeat(50);
    await fillRetreatRequired(page, { name: longName });
    await page.getByRole("button", { name: "수양회 신청하기" }).click();
    await confirmRetreatModal(page);
    await expect(page).toHaveURL(
      new RegExp(`/retreat/${SLUG}/registration-success`)
    );
  });

  test("완료 페이지에 완료 제목과 신청자 이름이 보인다", async ({ page }) => {
    await page.goto(RETREAT_URL);
    await fillRetreatRequired(page, { name: "김검증" });
    await page.getByRole("button", { name: "수양회 신청하기" }).click();
    await confirmRetreatModal(page);
    await expect(page).toHaveURL(
      new RegExp(`/retreat/${SLUG}/registration-success`)
    );
    await expect(
      page.getByRole("heading", { name: "수양회 신청 완료" })
    ).toBeVisible();
    await expect(page.getByText("김검증").first()).toBeVisible();
  });

  test("성별 여(FEMALE)로 신청하면 완료 페이지 인사말에 '자매'로 표시된다", async ({
    page,
  }) => {
    await page.goto(RETREAT_URL);
    await fillRetreatRequired(page, { gender: "여", name: "이영희" });
    await page.getByRole("button", { name: "수양회 신청하기" }).click();
    await confirmRetreatModal(page);
    await expect(page).toHaveURL(
      new RegExp(`/retreat/${SLUG}/registration-success`)
    );
    await expect(page.getByText("이영희").first()).toBeVisible();
    // getGenderText(FEMALE) = "자매" → "이영희 자매님,"
    await expect(page.getByText(/자매님/).first()).toBeVisible();
  });
});
