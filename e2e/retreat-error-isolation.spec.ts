import { test, expect } from "@playwright/test";
import { mockRetreatApi } from "./helpers/mock-api";
import { toggleCheckbox, selectOptionByPlaceholder } from "./helpers/form";
import { fillRetreatRequired } from "./helpers/fill";

const SLUG = "test-retreat";
const RETREAT_URL = `/retreat/${SLUG}/retreat`;

// 단일 필드만 무효한 상태로 제출했을 때, 해당 필드의 에러만 노출되고
// 나머지 필수 항목 에러는 뜨지 않으며, 확인 모달도 열리지 않음을 검증한다.
// 모든 에러 문구는 src/schemas/registration.ts에서 그대로 가져왔다.
test.describe("수양회 등록 폼 단일 필드 에러 격리", () => {
  test.beforeEach(async ({ page }) => {
    await mockRetreatApi(page, { open: true });
  });

  // <p class="text-red-500"> 로 한정한 에러 로케이터 (Select placeholder 와 중복 회피).
  const err = (page: import("@playwright/test").Page, t: string) =>
    page.locator("p.text-red-500", { hasText: t });

  // 격리 검증 대상이 아닌 나머지 필수 에러 문구들.
  const OTHER_MESSAGES = (only: string) =>
    [
      "부서를 선택해주세요",
      "학년을 선택해주세요",
      "현재 GBS/EBS 리더를 입력해주세요",
      "이름을 입력해주세요",
      "전화번호를 입력해주세요",
      "성별을 선택해주세요",
      "수양회 일정을 선택해주세요",
      "개인정보 수집 및 이용에 동의해주세요",
    ].filter((m) => m !== only);

  async function expectOnlyError(
    page: import("@playwright/test").Page,
    only: string
  ) {
    await expect(err(page, only)).toBeVisible();
    for (const msg of OTHER_MESSAGES(only)) {
      await expect(err(page, msg)).toHaveCount(0);
    }
    // 확인 모달이 열리지 않는다
    await expect(page.getByText("신청 정보 확인")).toHaveCount(0);
    // 폼 페이지에 머문다
    await expect(page).toHaveURL(new RegExp(`/retreat/${SLUG}/retreat$`));
  }

  test('(a) 개인정보 동의 미체크 -> "개인정보 수집 및 이용에 동의해주세요"만 노출', async ({
    page,
  }) => {
    await page.goto(RETREAT_URL);

    // fillRetreatRequired 는 항상 privacyConsent 를 체크하므로,
    // 채운 뒤 한 번 더 토글해 해제한다 (다른 항목은 전부 유효).
    await fillRetreatRequired(page);
    await toggleCheckbox(page, "privacyConsent");

    await page.getByRole("button", { name: "수양회 신청하기" }).click();

    await expectOnlyError(page, "개인정보 수집 및 이용에 동의해주세요");
  });

  test('(b) 일정 미선택 -> "수양회 일정을 선택해주세요"만 노출', async ({
    page,
  }) => {
    await page.goto(RETREAT_URL);

    await fillRetreatRequired(page, { allSchedule: false });

    await page.getByRole("button", { name: "수양회 신청하기" }).click();

    await expectOnlyError(page, "수양회 일정을 선택해주세요");
  });

  test('(c) 성별 미선택 -> "성별을 선택해주세요"만 노출', async ({ page }) => {
    await page.goto(RETREAT_URL);

    // fillRetreatRequired 는 항상 성별을 선택하므로,
    // 성별을 제외한 나머지 항목을 직접 채운다.
    await toggleCheckbox(page, "privacyConsent");
    await selectOptionByPlaceholder(page, "부서를 선택해주세요", "1부 사랑부");
    await selectOptionByPlaceholder(
      page,
      "학년을 선택해주세요",
      "1학년 예수마을"
    );
    await page.locator("#currentLeaderName").fill("홍길동");
    await page.locator("#name").fill("이조원");
    await page.locator("#phoneNumber").fill("010-1234-5678");
    await toggleCheckbox(page, "allSchedule");

    await page.getByRole("button", { name: "수양회 신청하기" }).click();

    await expectOnlyError(page, "성별을 선택해주세요");
  });
});
