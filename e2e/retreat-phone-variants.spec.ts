import { test, expect } from "@playwright/test";
import { mockRetreatApi } from "./helpers/mock-api";
import { toggleCheckbox, selectOptionByPlaceholder } from "./helpers/form";

const SLUG = "test-retreat";
const RETREAT_URL = `/retreat/${SLUG}/retreat`;

// 전화번호 필드의 클라이언트 사이드 유효성 검사 분기를 고정한다.
// 메시지 출처: src/schemas/registration.ts
//   - 형식 오류 PHONE_FORMAT_MESSAGE: "010-1234-5678 형식으로 적어주세요"
//   - 빈 값 PHONE_REQUIRED_MESSAGE:   "전화번호를 입력해주세요"
// 폼 mode: "onChange" 이므로 입력 즉시(실시간) 형식 에러가 노출된다.
// 에러는 p.text-red-500 으로 한정한다(placeholder/안내문구 겹침 방지).
test.describe("수양회 등록 - 전화번호 유효성 검사", () => {
  test.beforeEach(async ({ page }) => {
    await mockRetreatApi(page, { open: true });
  });

  const INVALID_PHONES = [
    "0101234",
    "010-12-3456",
    "011-1234-5678",
    "02-123-4567",
    "abcd",
  ];

  for (const phone of INVALID_PHONES) {
    test(`잘못된 형식 "${phone}" 입력 시 실시간 형식 에러를 노출한다`, async ({
      page,
    }) => {
      await page.goto(RETREAT_URL);

      await page.locator("#phoneNumber").fill(phone);

      await expect(
        page.locator("p.text-red-500", {
          hasText: "010-1234-5678 형식으로 적어주세요",
        })
      ).toBeVisible();

      // 형식 에러일 뿐 required 에러는 아니다.
      await expect(
        page.locator("p.text-red-500", { hasText: "전화번호를 입력해주세요" })
      ).toHaveCount(0);
    });
  }

  test("전화번호를 비운 채 나머지를 채워 제출하면 required 에러를 노출한다", async ({
    page,
  }) => {
    await page.goto(RETREAT_URL);

    // fillRetreatRequired 와 동일하게 전화번호를 제외한 필수 항목을 채운다.
    await toggleCheckbox(page, "privacyConsent");
    await selectOptionByPlaceholder(page, "부서를 선택해주세요", "1부 사랑부");
    await selectOptionByPlaceholder(
      page,
      "학년을 선택해주세요",
      "1학년 예수마을"
    );
    await page.locator("#currentLeaderName").fill("홍길동");
    await page.locator("#name").fill("이조원");
    await selectOptionByPlaceholder(page, "성별을 선택해주세요", "남");
    await toggleCheckbox(page, "allSchedule");
    // 전화번호는 비워둔다.

    await page.getByRole("button", { name: "수양회 신청하기" }).click();

    // 빈 값 → required 메시지 (형식 메시지가 아님).
    await expect(
      page.locator("p.text-red-500", { hasText: "전화번호를 입력해주세요" })
    ).toBeVisible();
    await expect(
      page.locator("p.text-red-500", {
        hasText: "010-1234-5678 형식으로 적어주세요",
      })
    ).toHaveCount(0);

    // 확인 모달이 열리지 않고 폼 페이지에 머문다.
    await expect(page.getByText("신청 정보 확인")).toHaveCount(0);
    await expect(page).toHaveURL(new RegExp(`/retreat/${SLUG}/retreat$`));
  });

  test('유효한 전화번호 "010-1234-5678" 입력 시 전화번호 에러가 없다', async ({
    page,
  }) => {
    await page.goto(RETREAT_URL);

    await page.locator("#phoneNumber").fill("010-1234-5678");

    await expect(
      page.locator("p.text-red-500", {
        hasText: "010-1234-5678 형식으로 적어주세요",
      })
    ).toHaveCount(0);
    await expect(
      page.locator("p.text-red-500", { hasText: "전화번호를 입력해주세요" })
    ).toHaveCount(0);
  });
});
