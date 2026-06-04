import { test, expect, type Page } from "@playwright/test";
import { mockRetreatApi } from "./helpers/mock-api";
import { toggleCheckbox, selectOptionByPlaceholder } from "./helpers/form";

// 셔틀버스 폼의 "동의 2종" 개별 누락 검증을 고정하는 특성화 테스트.
// fillBusRequired 는 privacyConsent + agreeShuttleOnly 를 둘 다 체크하므로
// 여기서는 사용하지 않고, 한쪽 동의만 토글한 뒤 나머지 필수 항목(부서/학년/
// 이름/성별/전화/버스 왕복)을 직접 채워 제출한다. 누락된 동의의 에러만
// 노출되고 "신청 정보 확인" 모달이 열리지 않음을 확인한다.
//
// 셀렉터/문구 출처:
//   - 동의 id: src/components/forms/bus-consent-fields.tsx
//       privacyConsent / agreeShuttleOnly
//   - 입력 id/placeholder: src/components/forms/bus-basic-info-fields.tsx
//       #name(placeholder "홍길동") / #phoneNumber("010-1234-5678") /
//       부서 placeholder "부서를 선택해주세요" / 학년 "학년을 선택해주세요" /
//       성별 "성별을 선택해주세요"
//   - 에러 문구: src/schemas/registration.ts (busRegistrationSchema)
//   - 제출 버튼 disabled 조건: src/components/forms/bus-submit-button.tsx
//       이름/전화(유효형식)/버스 선택이 모두 갖춰져야 활성화된다. 두 테스트
//       모두 이름+유효전화+버스 왕복을 채우므로 제출 버튼은 활성화된다.

const SLUG = "test-retreat";
const SHUTTLE_URL = `/retreat/${SLUG}/shuttle-bus`;

// fixture 버스: 201(교회→수양관), 203(수양관→교회). 왕복=짝수 [201,203].
const BUS_FROM_CHURCH = "bus-201";
const BUS_TO_CHURCH = "bus-203";

/** 동의 1종을 제외한 나머지 필수 항목을 직접 채운다(제출 버튼 활성화 상태). */
async function fillBusExceptConsents(page: Page) {
  await selectOptionByPlaceholder(page, "부서를 선택해주세요", "1부 사랑부");
  await selectOptionByPlaceholder(page, "학년을 선택해주세요", "1학년 예수마을");
  await page.locator("#name").fill("이조원");
  await selectOptionByPlaceholder(page, "성별을 선택해주세요", "남");
  await page.locator("#phoneNumber").fill("010-1234-5678");
  await toggleCheckbox(page, BUS_FROM_CHURCH);
  await toggleCheckbox(page, BUS_TO_CHURCH);
}

test.describe("셔틀버스 신청 폼 동의 항목 개별 유효성 검사", () => {
  test.beforeEach(async ({ page }) => {
    await mockRetreatApi(page, { open: true });
  });

  test("개인정보 동의를 빠뜨리면(셔틀 이동 동의만 체크) 개인정보 동의 에러가 뜨고 모달이 열리지 않는다", async ({
    page,
  }) => {
    await page.goto(SHUTTLE_URL);

    // 셔틀 이동 동의만 체크, 개인정보 동의는 비워둔다.
    await toggleCheckbox(page, "agreeShuttleOnly");
    await fillBusExceptConsents(page);

    const submit = page.getByRole("button", { name: /신청하기/ });
    await expect(submit).toBeEnabled();
    await submit.click();

    const err = (t: string) => page.locator("p.text-red-500", { hasText: t });

    await expect(
      err("개인정보 수집 및 이용에 동의해주세요")
    ).toBeVisible();
    // 셔틀 이동 동의는 체크했으므로 해당 에러는 없다.
    await expect(
      err("셔틀 이외의 이동 금지 사항에 동의해주세요")
    ).toHaveCount(0);

    // 확인 모달이 열리지 않는다.
    await expect(
      page.getByRole("heading", { name: "신청 정보 확인" })
    ).toHaveCount(0);
    await expect(page).toHaveURL(new RegExp(`/retreat/${SLUG}/shuttle-bus$`));
  });

  test("셔틀 이동 동의를 빠뜨리면(개인정보 동의만 체크) 셔틀 이동 동의 에러가 뜨고 모달이 열리지 않는다", async ({
    page,
  }) => {
    await page.goto(SHUTTLE_URL);

    // 개인정보 동의만 체크, 셔틀 이동 동의는 비워둔다.
    await toggleCheckbox(page, "privacyConsent");
    await fillBusExceptConsents(page);

    const submit = page.getByRole("button", { name: /신청하기/ });
    await expect(submit).toBeEnabled();
    await submit.click();

    const err = (t: string) => page.locator("p.text-red-500", { hasText: t });

    await expect(
      err("셔틀 이외의 이동 금지 사항에 동의해주세요")
    ).toBeVisible();
    // 개인정보 동의는 체크했으므로 해당 에러는 없다.
    await expect(
      err("개인정보 수집 및 이용에 동의해주세요")
    ).toHaveCount(0);

    // 확인 모달이 열리지 않는다.
    await expect(
      page.getByRole("heading", { name: "신청 정보 확인" })
    ).toHaveCount(0);
    await expect(page).toHaveURL(new RegExp(`/retreat/${SLUG}/shuttle-bus$`));
  });
});
