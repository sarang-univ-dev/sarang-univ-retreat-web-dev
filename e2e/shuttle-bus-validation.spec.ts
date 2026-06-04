import { test, expect } from "@playwright/test";
import { mockRetreatApi } from "./helpers/mock-api";
import { toggleCheckbox } from "./helpers/form";

// 셔틀버스 폼의 클라이언트 사이드 유효성 검사 동작.
// 에러 문구는 src/schemas/registration.ts(shuttleBusRegistrationSchema)에서 가져왔다.
//
// 제출 버튼(ShuttleBusSubmitButton)은 수양회 CTA 와 동일하게 제출 중에만 disabled 다.
// 필수 입력(이름/전화/버스 선택/동의 등)은 zod 가 검증하고, 미충족으로 클릭하면
// 에러가 노출되며 "신청 정보 확인" 모달은 열리지 않는다(scrollToFirstError 가 첫
// 에러 필드로 안내). 따라서 빈 폼에서도 제출 시도 → 에러 노출이 가능하다.

const SLUG = "test-retreat";
const SHUTTLE_URL = `/retreat/${SLUG}/shuttle-bus`;
const BUS_FROM_CHURCH = "bus-201";
const BUS_TO_CHURCH = "bus-203";

test.describe("셔틀버스 신청 폼 유효성 검사", () => {
  test.beforeEach(async ({ page }) => {
    await mockRetreatApi(page, { open: true, shuttleBus: true });
  });

  test("(a) 이름/전화/버스만 채우고 나머지 필수 항목을 비운 채 제출하면 필수 에러가 뜨고 모달이 열리지 않는다", async ({
    page,
  }) => {
    await page.goto(SHUTTLE_URL);

    // 이름 + 유효 전화 + 버스(왕복)만 채우고 부서/학년/성별/동의 2종은 비운다.
    await page.locator("#name").fill("이조원");
    await page.locator("#phoneNumber").fill("010-1234-5678");
    await toggleCheckbox(page, BUS_FROM_CHURCH);
    await toggleCheckbox(page, BUS_TO_CHURCH);

    await page.getByRole("button", { name: /신청하기/ }).click();

    const err = (t: string) => page.locator("p.text-red-500", { hasText: t });
    await expect(err("부서를 선택해주세요")).toBeVisible();
    await expect(err("학년을 선택해주세요")).toBeVisible();
    await expect(err("성별을 선택해주세요")).toBeVisible();
    await expect(err("개인정보 수집 및 이용에 동의해주세요")).toBeVisible();
    await expect(err("셔틀 이외의 이동 금지 사항에 동의해주세요")).toBeVisible();

    await expect(
      page.getByRole("heading", { name: "신청 정보 확인" })
    ).toHaveCount(0);
    await expect(page).toHaveURL(new RegExp(`/retreat/${SLUG}/shuttle-bus$`));
  });

  test("(a-2) 완전히 빈 폼에서 제출하면 필수 에러(동의·버스 포함)가 뜨고 모달이 열리지 않는다", async ({
    page,
  }) => {
    await page.goto(SHUTTLE_URL);

    // 버튼은 항상 활성 → 빈 폼에서도 제출 시도 가능.
    await page.getByRole("button", { name: /신청하기/ }).click();

    const err = (t: string) => page.locator("p.text-red-500", { hasText: t });
    await expect(err("개인정보 수집 및 이용에 동의해주세요")).toBeVisible();
    await expect(err("셔틀 이외의 이동 금지 사항에 동의해주세요")).toBeVisible();
    // 버스 미선택도 이제 zod 로 검증된다.
    await expect(err("셔틀버스를 한 대 이상 선택해주세요")).toBeVisible();

    await expect(
      page.getByRole("heading", { name: "신청 정보 확인" })
    ).toHaveCount(0);
    await expect(page).toHaveURL(new RegExp(`/retreat/${SLUG}/shuttle-bus$`));
  });

  test("(b) 잘못된 전화번호는 형식 에러를 노출하고, 제출해도 모달이 열리지 않는다", async ({
    page,
  }) => {
    await page.goto(SHUTTLE_URL);

    await page.locator("#phoneNumber").fill("0101234");
    await expect(
      page.locator("p.text-red-500", {
        hasText: "010-1234-5678 형식으로 적어주세요",
      })
    ).toBeVisible();

    // 버튼은 활성이지만 zod 가 막아 모달이 열리지 않는다.
    await page.getByRole("button", { name: /신청하기/ }).click();
    await expect(
      page.locator("p.text-red-500", {
        hasText: "010-1234-5678 형식으로 적어주세요",
      })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "신청 정보 확인" })
    ).toHaveCount(0);
    await expect(page).toHaveURL(new RegExp(`/retreat/${SLUG}/shuttle-bus$`));
  });
});
