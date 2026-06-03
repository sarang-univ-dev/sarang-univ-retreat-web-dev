import { test, expect } from "@playwright/test";
import { mockRetreatApi } from "./helpers/mock-api";
import { toggleCheckbox, selectOptionByPlaceholder } from "./helpers/form";

const SLUG = "test-retreat";
const RETREAT_URL = `/retreat/${SLUG}/retreat`;

// 현재(main) 동작을 고정하는 특성화(characterization) 테스트.
// 리팩토링 전후로 폼의 클라이언트 사이드 유효성 검사 동작이 동일함을 보장한다.
// 모든 에러 문구는 components/retreat-registration-form.tsx에서 그대로 가져왔다.
test.describe("수양회 등록 폼 유효성 검사", () => {
  test.beforeEach(async ({ page }) => {
    await mockRetreatApi(page, { open: true });
  });

  test("(a) 전부 비운 채 제출하면 필수 항목 에러가 뜨고 폼 페이지에 머문다", async ({
    page,
  }) => {
    await page.goto(RETREAT_URL);

    await page.getByRole("button", { name: "수양회 신청하기" }).click();

    // 필수 항목 에러 (validateForm에서 setFormErrors로 한 번에 노출).
    // 일부 에러 문구(부서/학년/성별)는 Select placeholder와 동일하므로
    // 에러 <p class="text-red-500"> 로 한정해 확인한다.
    const err = (t: string) => page.locator("p.text-red-500", { hasText: t });
    await expect(err("부서를 선택해주세요")).toBeVisible();
    await expect(err("학년을 선택해주세요")).toBeVisible();
    await expect(err("현재 GBS/EBS 리더를 입력해주세요")).toBeVisible();
    await expect(err("이름을 입력해주세요")).toBeVisible();
    await expect(err("전화번호를 입력해주세요")).toBeVisible();
    await expect(err("성별을 선택해주세요")).toBeVisible();
    await expect(err("수양회 일정을 선택해주세요")).toBeVisible();
    await expect(err("개인정보 수집 및 이용에 동의해주세요")).toBeVisible();

    // 확인 모달이 열리지 않는다
    await expect(page.getByText("신청 정보 확인")).toHaveCount(0);

    // 폼 페이지에 머문다
    await expect(page).toHaveURL(new RegExp(`/retreat/${SLUG}/retreat$`));
  });

  test("(b) 잘못된 전화번호는 형식 에러를 노출한다", async ({ page }) => {
    await page.goto(RETREAT_URL);

    // 비어있지 않지만 010-XXXX-XXXX 형식이 아닌 값 → 실시간 형식 에러
    await page.locator("#phoneNumber").fill("0101234");

    await expect(
      page.getByText("010-1234-5678 형식으로 적어주세요")
    ).toBeVisible();

    // 제출해도 폼 페이지에 머문다
    await page.getByRole("button", { name: "수양회 신청하기" }).click();
    await expect(
      page.getByText("010-1234-5678 형식으로 적어주세요")
    ).toBeVisible();
    await expect(page.getByText("신청 정보 확인")).toHaveCount(0);
    await expect(page).toHaveURL(new RegExp(`/retreat/${SLUG}/retreat$`));
  });

  test('(c-1) 필러 리더명("모름")은 "리더 이름을 정확히 입력해주세요" 에러를 낸다', async ({
    page,
  }) => {
    await page.goto(RETREAT_URL);

    // INVALID_NAME_PATTERN: ^(모름|모르겠음|없음|...)$ → 실시간 에러
    await page.locator("#currentLeaderName").fill("모름");

    await expect(
      page.getByText("리더 이름을 정확히 입력해주세요")
    ).toBeVisible();

    await page.getByRole("button", { name: "수양회 신청하기" }).click();
    await expect(
      page.getByText("리더 이름을 정확히 입력해주세요")
    ).toBeVisible();
    await expect(page.getByText("신청 정보 확인")).toHaveCount(0);
    await expect(page).toHaveURL(new RegExp(`/retreat/${SLUG}/retreat$`));
  });

  test('(c-2) 직책 접미사가 붙은 리더명("홍길동 리더")은 "이름만 적어주세요" 에러를 낸다', async ({
    page,
  }) => {
    await page.goto(RETREAT_URL);

    // TITLE_SUFFIX_PATTERN: (리더|간사|...)$ → 실시간 에러
    await page.locator("#currentLeaderName").fill("홍길동 리더");

    await expect(page.getByText("이름만 적어주세요")).toBeVisible();

    await page.getByRole("button", { name: "수양회 신청하기" }).click();
    await expect(page.getByText("이름만 적어주세요")).toBeVisible();
    await expect(page.getByText("신청 정보 확인")).toHaveCount(0);
    await expect(page).toHaveURL(new RegExp(`/retreat/${SLUG}/retreat$`));
  });

  test('(d) 일정을 선택하지 않으면 "수양회 일정을 선택해주세요" 에러를 낸다', async ({
    page,
  }) => {
    await page.goto(RETREAT_URL);

    // 일정을 제외한 나머지 항목을 모두 채운다 (일정 미선택만 검증)
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
    await page.locator("#phoneNumber").fill("010-1234-5678");

    await page.getByRole("button", { name: "수양회 신청하기" }).click();

    await expect(page.getByText("수양회 일정을 선택해주세요")).toBeVisible();
    await expect(page.getByText("신청 정보 확인")).toHaveCount(0);
    await expect(page).toHaveURL(new RegExp(`/retreat/${SLUG}/retreat$`));
  });
});
