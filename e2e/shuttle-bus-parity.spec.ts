import { test, expect } from "@playwright/test";
import { mockRetreatApi } from "./helpers/mock-api";
import { fillBusRequired } from "./helpers/fill";
import { toggleCheckbox, selectOptionByPlaceholder } from "./helpers/form";

const SLUG = "test-retreat";
const SHUTTLE_URL = `/retreat/${SLUG}/shuttle-bus`;

// retreat 폼에 있던 검증들을 셔틀버스 폼에도 동일하게(동작 차이 포함) 적용.
test.describe("셔틀버스 폼 패리티 검증", () => {
  test.beforeEach(async ({ page }) => {
    await mockRetreatApi(page, { open: true });
  });

  test('이름이 공백("   ")이면 제출 버튼이 비활성화된다 (name.trim() 가드)', async ({
    page,
  }) => {
    await page.goto(SHUTTLE_URL);
    // 이름만 공백, 나머지(전화/버스/동의)는 유효하게.
    await fillBusRequired(page, { name: "   " });

    const submit = page.getByRole("button", { name: /신청하기/ });
    await expect(submit).toBeDisabled();
  });

  test("입력 필드에서 Enter 를 눌러도 제출/모달이 열리지 않는다", async ({
    page,
  }) => {
    await page.goto(SHUTTLE_URL);
    await fillBusRequired(page);

    await page.locator("#name").press("Enter");
    await page.locator("#phoneNumber").press("Enter");

    await expect(page.getByText("신청 정보 확인")).toHaveCount(0);
    await expect(page).toHaveURL(new RegExp(`/retreat/${SLUG}/shuttle-bus$`));
  });

  const invalidPhones = ["0101234", "011-1234-5678", "010-12-3456", "abcd"];
  for (const phone of invalidPhones) {
    test(`잘못된 전화번호 "${phone}" 는 형식 에러를 노출한다`, async ({
      page,
    }) => {
      await page.goto(SHUTTLE_URL);
      await page.locator("#phoneNumber").fill(phone);
      await expect(
        page.getByText("010-1234-5678 형식으로 적어주세요")
      ).toBeVisible();
    });
  }

  test('느슨한 형식 "999-1234-5678" 은 버튼은 켜지지만 제출 시 zod 에러로 막힌다', async ({
    page,
  }) => {
    await page.goto(SHUTTLE_URL);
    await toggleCheckbox(page, "privacyConsent");
    await toggleCheckbox(page, "agreeShuttleOnly");
    await selectOptionByPlaceholder(page, "부서를 선택해주세요", "1부 사랑부");
    await selectOptionByPlaceholder(
      page,
      "학년을 선택해주세요",
      "1학년 예수마을"
    );
    await page.locator("#name").fill("이조원");
    await selectOptionByPlaceholder(page, "성별을 선택해주세요", "남");
    await page.locator("#phoneNumber").fill("999-1234-5678");
    await toggleCheckbox(page, "bus-201");
    await toggleCheckbox(page, "bus-203");

    // 느슨한 정규식(\d{3}-\d{4}-\d{4})은 통과 → 버튼 활성
    const submit = page.getByRole("button", { name: /신청하기/ });
    await expect(submit).toBeEnabled();
    await submit.click();

    // 그러나 zod(requiredPhoneSchema)는 010- 만 허용 → 모달 안 열리고 형식 에러
    await expect(page.getByText("신청 정보 확인")).toHaveCount(0);
    await expect(
      page.getByText("010-1234-5678 형식으로 적어주세요")
    ).toBeVisible();
  });
});
