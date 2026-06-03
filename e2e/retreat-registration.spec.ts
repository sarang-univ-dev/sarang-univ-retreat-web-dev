import { test, expect } from "@playwright/test";
import { mockRetreatApi } from "./helpers/mock-api";
import {
  toggleCheckbox,
  selectOptionByPlaceholder,
} from "./helpers/form";

const SLUG = "test-retreat";
const RETREAT_URL = `/retreat/${SLUG}/retreat`;

// 현재(main) 동작을 고정하는 특성화(characterization) 테스트.
// 리팩토링 전후로 사용자에게 보이는 동작이 동일함을 보장한다.
test.describe("수양회 등록 플로우", () => {
  test.beforeEach(async ({ page }) => {
    await mockRetreatApi(page, { open: true });
  });

  test("정상 신청 → 신청 완료 페이지로 이동", async ({ page }) => {
    await page.goto(RETREAT_URL);

    // 카드 정보 노출 확인
    await expect(
      page.getByText("2026 여름수양회", { exact: false })
    ).toBeVisible();

    // 개인정보 동의
    await toggleCheckbox(page, "privacyConsent");

    // 부서 / 학년 / 성별
    await selectOptionByPlaceholder(page, "부서를 선택해주세요", "1부 사랑부");
    await selectOptionByPlaceholder(
      page,
      "학년을 선택해주세요",
      "1학년 예수마을"
    );

    // 리더 / 이름 / 전화번호
    await page.locator("#currentLeaderName").fill("홍길동");
    await page.locator("#name").fill("이조원");
    await selectOptionByPlaceholder(page, "성별을 선택해주세요", "남");
    await page.locator("#phoneNumber").fill("010-1234-5678");

    // 전참 선택
    await toggleCheckbox(page, "allSchedule");

    // 신청 → 확인 모달
    await page.getByRole("button", { name: "수양회 신청하기" }).click();
    await expect(page.getByText("신청 정보 확인")).toBeVisible();

    // 모달 동의 후 확인
    await toggleCheckbox(page, "scheduleChangeConsent");
    await toggleCheckbox(page, "refundPolicyConsent");
    await page.getByRole("button", { name: "확인" }).click();

    // 신청 완료 페이지
    await expect(page).toHaveURL(
      new RegExp(`/retreat/${SLUG}/registration-success`)
    );
    await expect(
      page.getByRole("heading", { name: "수양회 신청 완료" })
    ).toBeVisible();
  });
});
