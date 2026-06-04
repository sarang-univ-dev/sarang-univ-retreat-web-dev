import { test, expect } from "@playwright/test";
import { mockRetreatApi } from "./helpers/mock-api";
import { toggleCheckbox, selectOptionByPlaceholder } from "./helpers/form";

// Characterization test for the CURRENT shuttle-bus registration behavior.
// Source under test:
//   app/retreat/[slug]/shuttle-bus/page.tsx
//   components/bus-registration-form.tsx
// All Korean copy is quoted verbatim from those sources.

const SLUG = "test-retreat";
const SHUTTLE_URL = `/retreat/${SLUG}/shuttle-bus`;

// Bus checkbox ids come from `bus-${bus.id}` in the form; fixture ids:
//   201 = "1호차 (목요일 오전 출발)"  (FROM_CHURCH_TO_RETREAT)
//   202 = "2호차 (목요일 오후 출발)"  (FROM_CHURCH_TO_RETREAT)
//   203 = "3호차 (토요일 복귀)"        (FROM_RETREAT_TO_CHURCH)
const BUS_FROM_CHURCH = "bus-201";
const BUS_TO_CHURCH = "bus-203";

// Fills the always-required consent checkboxes + basic info so the submit
// button (disabled until name + valid phone + >=1 bus) becomes enabled.
async function fillRequiredFields(page: import("@playwright/test").Page) {
  await toggleCheckbox(page, "privacyConsent");
  await toggleCheckbox(page, "agreeShuttleOnly");
  await selectOptionByPlaceholder(page, "부서를 선택해주세요", "1부 사랑부");
  await selectOptionByPlaceholder(page, "학년을 선택해주세요", "1학년 예수마을");
  await page.locator("#name").fill("이조원");
  await selectOptionByPlaceholder(page, "성별을 선택해주세요", "남");
  await page.locator("#phoneNumber").fill("010-1234-5678");
}

test.describe("셔틀버스 신청 (characterization)", () => {
  test.beforeEach(async ({ page }) => {
    await mockRetreatApi(page, { open: true, shuttleBus: true });
  });

  test("왕복 선택(편도 모달 없음) -> 신청 완료 페이지로 이동", async ({
    page,
  }) => {
    await page.goto(SHUTTLE_URL);

    // 셔틀버스 선택 섹션이 렌더되는지 확인
    await expect(
      page.getByRole("heading", { name: "셔틀버스 선택" })
    ).toBeVisible();

    await fillRequiredFields(page);

    // 왕복: 교회->수양관(201) + 수양관->교회(203) = 짝수 => 편도 모달 안 뜸
    await toggleCheckbox(page, BUS_FROM_CHURCH);
    await toggleCheckbox(page, BUS_TO_CHURCH);

    // 총 금액 15000 * 2 = 30000원, 제출 버튼 텍스트에 반영
    const submit = page.getByRole("button", { name: /신청하기 \(30,000원\)/ });
    await expect(submit).toBeEnabled();
    await submit.click();

    // 짝수 선택 -> 편도 확인 모달은 나타나지 않고 바로 정보 확인 모달
    await expect(page.getByText("편도 신청 확인")).toHaveCount(0);
    await expect(
      page.getByRole("heading", { name: "신청 정보 확인" })
    ).toBeVisible();

    // 환불 불가 동의 후 확인
    await toggleCheckbox(page, "refundPolicyConsent");
    await page.getByRole("button", { name: "확인" }).click();

    await expect(page).toHaveURL(
      new RegExp(`/retreat/${SLUG}/shuttle-bus-registration-success`)
    );
    await expect(
      page.getByRole("heading", { name: "셔틀버스 신청이 완료되었습니다" })
    ).toBeVisible();
  });

  test("환불 동의 없이 확인 시 모달이 닫히지 않고 오류 메시지 표시", async ({
    page,
  }) => {
    await page.goto(SHUTTLE_URL);
    await fillRequiredFields(page);
    await toggleCheckbox(page, BUS_FROM_CHURCH);
    await toggleCheckbox(page, BUS_TO_CHURCH);

    await page.getByRole("button", { name: /신청하기 \(30,000원\)/ }).click();
    await expect(
      page.getByRole("heading", { name: "신청 정보 확인" })
    ).toBeVisible();

    // 체크박스 미체크 상태로 확인 누르면 모달 유지 + 오류 문구
    await page.getByRole("button", { name: "확인" }).click();
    await expect(
      page.getByText("해당 내용을 읽고 체크박스에 체크해주세요")
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "신청 정보 확인" })
    ).toBeVisible();
  });

  test("편도(홀수) 선택 -> 편도 확인 모달이 먼저 나타남", async ({ page }) => {
    await page.goto(SHUTTLE_URL);
    await fillRequiredFields(page);

    // 한 방향(편도)만 선택 => 홀수 => 편도 확인 모달
    await toggleCheckbox(page, BUS_FROM_CHURCH);

    const submit = page.getByRole("button", { name: /신청하기 \(15,000원\)/ });
    await expect(submit).toBeEnabled();
    await submit.click();

    await expect(
      page.getByRole("heading", { name: "편도 신청 확인" })
    ).toBeVisible();
    await expect(
      page.getByText("편도로 신청하시겠습니까?")
    ).toBeVisible();

    // 정보 확인 모달은 아직 안 떠야 함
    await expect(page.getByText("신청 정보 확인")).toHaveCount(0);

    // "버스 추가 선택"은 편도 모달을 닫고 폼으로 복귀
    await page.getByRole("button", { name: "버스 추가 선택" }).click();
    await expect(page.getByText("편도 신청 확인")).toHaveCount(0);
  });

  test("편도 확인 모달에서 '예, 편도입니다' -> 정보 확인 모달 -> 완료", async ({
    page,
  }) => {
    await page.goto(SHUTTLE_URL);
    await fillRequiredFields(page);
    await toggleCheckbox(page, BUS_FROM_CHURCH);

    await page.getByRole("button", { name: /신청하기 \(15,000원\)/ }).click();
    await expect(
      page.getByRole("heading", { name: "편도 신청 확인" })
    ).toBeVisible();

    await page.getByRole("button", { name: "예, 편도입니다" }).click();
    await expect(
      page.getByRole("heading", { name: "신청 정보 확인" })
    ).toBeVisible();

    await toggleCheckbox(page, "refundPolicyConsent");
    await page.getByRole("button", { name: "확인" }).click();

    await expect(page).toHaveURL(
      new RegExp(`/retreat/${SLUG}/shuttle-bus-registration-success`)
    );
  });
});
