import { test, expect } from "@playwright/test";
import { mockRetreatApi } from "./helpers/mock-api";
import { toggleCheckbox } from "./helpers/form";

const SLUG = "test-retreat";
const RETREAT_URL = `/retreat/${SLUG}/retreat`;

// 실시간(realtime) 유효성 검사 에러가 입력 정정 시 사라지는지 확인하는 테스트.
// 에러 문구는 src/schemas/registration.ts의 메시지를 그대로 사용한다.
// 에러는 항상 <p class="text-red-500">로 한정해 확인한다 (Select placeholder 등과 겹칠 수 있어).
test.describe("수양회 등록 폼 실시간 에러 해제", () => {
  test.beforeEach(async ({ page }) => {
    await mockRetreatApi(page, { open: true });
  });

  const err = (page: import("@playwright/test").Page, t: string) =>
    page.locator("p.text-red-500", { hasText: t });

  test("(a) 잘못된 전화번호 형식 에러가 올바른 값 입력 시 사라진다", async ({
    page,
  }) => {
    await page.goto(RETREAT_URL);

    // 형식에 맞지 않는 값 → 실시간 형식 에러
    await page.locator("#phoneNumber").fill("0101234");
    await expect(err(page, "010-1234-5678 형식으로 적어주세요")).toBeVisible();

    // 올바른 형식으로 정정 → 에러 사라짐
    await page.locator("#phoneNumber").fill("010-1234-5678");
    await expect(err(page, "010-1234-5678 형식으로 적어주세요")).toHaveCount(0);
  });

  test('(b) 잘못된 리더명("모름") 에러가 정상 이름 입력 시 사라진다', async ({
    page,
  }) => {
    await page.goto(RETREAT_URL);

    // INVALID_NAME_PATTERN 매칭 → 실시간 에러
    await page.locator("#currentLeaderName").fill("모름");
    await expect(err(page, "리더 이름을 정확히 입력해주세요")).toBeVisible();

    // 정상 이름으로 정정 → 에러 사라짐
    await page.locator("#currentLeaderName").fill("홍길동");
    await expect(err(page, "리더 이름을 정확히 입력해주세요")).toHaveCount(0);
  });

  test("(c) 개인정보 동의를 켰다가 끄고 제출하면 동의 에러가 뜬다", async ({
    page,
  }) => {
    await page.goto(RETREAT_URL);

    // privacyConsent on -> off (최종 미동의 상태)
    await toggleCheckbox(page, "privacyConsent");
    await toggleCheckbox(page, "privacyConsent");

    await page.getByRole("button", { name: "수양회 신청하기" }).click();

    await expect(
      err(page, "개인정보 수집 및 이용에 동의해주세요")
    ).toBeVisible();
    // 확인 모달이 열리지 않고 폼 페이지에 머문다
    await expect(page.getByText("신청 정보 확인")).toHaveCount(0);
    await expect(page).toHaveURL(new RegExp(`/retreat/${SLUG}/retreat$`));
  });
});
