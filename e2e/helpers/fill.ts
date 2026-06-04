import type { Page } from "@playwright/test";
import { toggleCheckbox, selectOptionByPlaceholder } from "./form";

/**
 * 수양회 등록 폼의 필수 항목을 채운다 (제출 직전 상태). 옵션으로 개별 값 덮어쓰기.
 * 기본값은 mock fixture(openPeriodRetreatInfo)에 존재하는 값들이다.
 */
export async function fillRetreatRequired(
  page: Page,
  opts: {
    univGroup?: string;
    grade?: string;
    leader?: string;
    name?: string;
    gender?: "남" | "여";
    phone?: string;
    allSchedule?: boolean;
  } = {}
) {
  const {
    univGroup = "1부 사랑부",
    grade = "1학년 예수마을",
    leader = "홍길동",
    name = "이조원",
    gender = "남",
    phone = "010-1234-5678",
    allSchedule = true,
  } = opts;

  await toggleCheckbox(page, "privacyConsent");
  await selectOptionByPlaceholder(page, "부서를 선택해주세요", univGroup);
  await selectOptionByPlaceholder(page, "학년을 선택해주세요", grade);
  await page.locator("#currentLeaderName").fill(leader);
  await page.locator("#name").fill(name);
  await selectOptionByPlaceholder(page, "성별을 선택해주세요", gender);
  await page.locator("#phoneNumber").fill(phone);
  if (allSchedule) await toggleCheckbox(page, "allSchedule");
}

/** 수양회 확인 모달의 두 동의 체크 후 확인. (모달이 열린 상태에서 호출) */
export async function confirmRetreatModal(page: Page) {
  await toggleCheckbox(page, "scheduleChangeConsent");
  await toggleCheckbox(page, "refundPolicyConsent");
  await page.getByRole("button", { name: "확인" }).click();
}

/**
 * 셔틀버스 등록 폼의 필수 항목을 채운다. busIds 기본값은 왕복(짝수) 선택.
 * fixture 버스: 201/202(교회→수양관), 203(수양관→교회).
 */
export async function fillBusRequired(
  page: Page,
  opts: {
    univGroup?: string;
    grade?: string;
    name?: string;
    gender?: "남" | "여";
    phone?: string;
    busIds?: number[];
  } = {}
) {
  const {
    univGroup = "1부 사랑부",
    grade = "1학년 예수마을",
    name = "이조원",
    gender = "남",
    phone = "010-1234-5678",
    busIds = [201, 203],
  } = opts;

  await toggleCheckbox(page, "privacyConsent");
  await toggleCheckbox(page, "agreeShuttleOnly");
  await selectOptionByPlaceholder(page, "부서를 선택해주세요", univGroup);
  await selectOptionByPlaceholder(page, "학년을 선택해주세요", grade);
  await page.locator("#name").fill(name);
  await selectOptionByPlaceholder(page, "성별을 선택해주세요", gender);
  await page.locator("#phoneNumber").fill(phone);
  for (const id of busIds) await toggleCheckbox(page, `bus-${id}`);
}
