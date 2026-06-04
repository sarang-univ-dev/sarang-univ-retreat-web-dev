import { test, expect } from "@playwright/test";
import { mockRetreatApi } from "./helpers/mock-api";
import { toggleCheckbox, selectOptionByPlaceholder } from "./helpers/form";

// 셔틀버스 폼의 클라이언트 사이드 유효성 검사 동작을 고정하는 특성화 테스트.
// 에러 문구는 src/schemas/registration.ts(busRegistrationSchema)에서,
// 폼 구조/셀렉터는 src/components/forms/bus-* 에서 그대로 가져왔다.
//
// 주의: 제출 버튼(BusSubmitButton)은 이름/전화번호(유효 형식)/버스 선택이
// 모두 갖춰지기 전까지 disabled 다(bus-submit-button.tsx 의 disabled 조건):
//   (!isAdminContact && shuttleBusIds.length === 0) ||
//   !name.trim() || !phoneNumber.trim() || !isValidPhoneNumber(phoneNumber)
// 따라서 "완전히 빈 폼"에서는 제출 자체가 불가능하다. 본 스펙은
//  - 완전히 빈 폼에서는 버튼이 disabled 임을 검증하고,
//  - 버튼을 활성화할 최소 입력(이름 + 유효 전화번호 + 버스 1대)만 채운 뒤
//    나머지 필수 항목(부서/학년/성별/동의 2종)을 비운 채 제출해 그 에러들이
//    노출되고 "신청 정보 확인" 모달이 열리지 않음을 검증한다.
// (이름/전화번호 에러는 버튼이 그 값들에 게이트되어 실제 제출로는 유발 불가)

const SLUG = "test-retreat";
const SHUTTLE_URL = `/retreat/${SLUG}/shuttle-bus`;

// fixture 버스: 201 "1호차 (목요일 오전 출발)"(교회→수양관),
//               203 "3호차 (토요일 복귀)"(수양관→교회). 왕복=짝수 [201,203].
const BUS_FROM_CHURCH = "bus-201";
const BUS_TO_CHURCH = "bus-203";

test.describe("셔틀버스 신청 폼 유효성 검사", () => {
  test.beforeEach(async ({ page }) => {
    await mockRetreatApi(page, { open: true, shuttleBus: true });
  });

  test("(a) 최소 입력만 채우고 나머지 필수 항목을 비운 채 제출하면 필수 에러가 뜨고 모달이 열리지 않는다", async ({
    page,
  }) => {
    await page.goto(SHUTTLE_URL);

    // 완전히 빈 폼에서는 제출 버튼이 disabled 다(이름/전화/버스 미입력).
    const submit = page.getByRole("button", { name: /신청하기/ });
    await expect(submit).toBeDisabled();

    // 버튼 활성화에 필요한 최소 입력만 채운다: 이름 + 유효 전화번호 + 버스(왕복).
    // 부서/학년/성별/개인정보동의/셔틀이동동의는 비워둔다.
    await page.locator("#name").fill("이조원");
    await page.locator("#phoneNumber").fill("010-1234-5678");
    await toggleCheckbox(page, BUS_FROM_CHURCH);
    await toggleCheckbox(page, BUS_TO_CHURCH);

    await expect(submit).toBeEnabled();
    await submit.click();

    // 필수 항목 에러. 일부 문구(부서/학년/성별)는 Select placeholder와
    // 다르지만(placeholder는 "...선택해주세요"가 아닌 동일 어미), 안전하게
    // 에러 <p class="text-red-500"> 로 한정해 확인한다.
    const err = (t: string) => page.locator("p.text-red-500", { hasText: t });
    await expect(err("부서를 선택해주세요")).toBeVisible();
    await expect(err("학년을 선택해주세요")).toBeVisible();
    await expect(err("성별을 선택해주세요")).toBeVisible();
    await expect(
      err("개인정보 수집 및 이용에 동의해주세요")
    ).toBeVisible();
    await expect(
      err("셔틀 이외의 이동 금지 사항에 동의해주세요")
    ).toBeVisible();

    // 확인 모달이 열리지 않는다.
    await expect(
      page.getByRole("heading", { name: "신청 정보 확인" })
    ).toHaveCount(0);

    // 폼 페이지에 머문다.
    await expect(page).toHaveURL(new RegExp(`/retreat/${SLUG}/shuttle-bus$`));
  });

  test("(a-2) 완전히 빈 폼에서는 제출 버튼이 비활성화되어 제출할 수 없다", async ({
    page,
  }) => {
    await page.goto(SHUTTLE_URL);

    await expect(
      page.getByRole("button", { name: /신청하기/ })
    ).toBeDisabled();
  });

  test("(b) 잘못된 전화번호는 형식 에러를 노출한다", async ({ page }) => {
    await page.goto(SHUTTLE_URL);

    // 비어있지 않지만 010-XXXX-XXXX 형식이 아닌 값 → 실시간 형식 에러
    // (onChange 모드 + 전화번호 register).
    await page.locator("#phoneNumber").fill("0101234");

    await expect(
      page.locator("p.text-red-500", {
        hasText: "010-1234-5678 형식으로 적어주세요",
      })
    ).toBeVisible();

    // 잘못된 전화번호면 제출 버튼도 disabled 라 모달이 열릴 수 없다.
    await expect(
      page.getByRole("button", { name: /신청하기/ })
    ).toBeDisabled();
    await expect(
      page.getByRole("heading", { name: "신청 정보 확인" })
    ).toHaveCount(0);
    await expect(page).toHaveURL(new RegExp(`/retreat/${SLUG}/shuttle-bus$`));
  });
});
