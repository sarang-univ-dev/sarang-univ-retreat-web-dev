import { test, expect } from "@playwright/test";
import { mockRetreatApi } from "./helpers/mock-api";
import { toggleCheckbox, selectOptionByPlaceholder } from "./helpers/form";

const SLUG = "test-retreat";
const RETREAT_URL = `/retreat/${SLUG}/retreat`;
const SHUTTLE_BUS_URL = `/retreat/${SLUG}/shuttle-bus`;

test.describe("등록 실패 - 서버 에러 처리 (characterization)", () => {
  test("수양회 등록 POST가 400을 반환하면 실패 페이지로 이동하고 서버 메시지를 보여준다", async ({
    page,
  }) => {
    await mockRetreatApi(page, {
      open: true,
      registerStatus: 400,
      registerError: "정원이 초과되었습니다",
    });

    await page.goto(RETREAT_URL);

    // 수양회 해피패스 입력
    await toggleCheckbox(page, "privacyConsent");
    await selectOptionByPlaceholder(page, "부서를 선택해주세요", "1부 사랑부");
    await selectOptionByPlaceholder(page, "학년을 선택해주세요", "1학년 예수마을");
    await page.locator("#currentLeaderName").fill("홍길동");
    await page.locator("#name").fill("이조원");
    await selectOptionByPlaceholder(page, "성별을 선택해주세요", "남");
    await page.locator("#phoneNumber").fill("010-1234-5678");
    await toggleCheckbox(page, "allSchedule");

    await page.getByRole("button", { name: "수양회 신청하기" }).click();

    // 확인 모달
    await expect(page.getByText("신청 정보 확인")).toBeVisible();
    await toggleCheckbox(page, "scheduleChangeConsent");
    await toggleCheckbox(page, "refundPolicyConsent");
    await page.getByRole("button", { name: "확인" }).click();

    // 실패 페이지로 이동
    await expect(page).toHaveURL(
      new RegExp(`/retreat/${SLUG}/registration-failure`)
    );
    await expect(
      page.getByText("신청 오류", { exact: true })
    ).toBeVisible();
    await expect(page.getByText("정원이 초과되었습니다")).toBeVisible();
  });

  test("셔틀버스 등록 POST가 500을 반환하면 실패 페이지로 이동하고 서버 메시지를 보여준다", async ({
    page,
  }) => {
    await mockRetreatApi(page, {
      open: true,
      busRegisterStatus: 500,
      busRegisterError: "서버 오류가 발생했습니다",
    });

    await page.goto(SHUTTLE_BUS_URL);

    // 동의 체크박스
    await toggleCheckbox(page, "privacyConsent");
    await toggleCheckbox(page, "agreeShuttleOnly");

    // 기본 정보 입력
    await selectOptionByPlaceholder(page, "부서를 선택해주세요", "1부 사랑부");
    await selectOptionByPlaceholder(page, "학년을 선택해주세요", "1학년 예수마을");
    await page.locator("#name").fill("홍길동");
    await selectOptionByPlaceholder(page, "성별을 선택해주세요", "남");
    await page.locator("#phoneNumber").fill("010-1234-5678");

    // 왕복(짝수)으로 선택해 편도 확인 모달을 건너뛴다: 1호차(출발) + 3호차(복귀)
    await toggleCheckbox(page, "bus-201");
    await toggleCheckbox(page, "bus-203");

    // 제출 버튼 텍스트는 금액 포함("신청하기 (30,000원)")이라 부분 매칭한다.
    await page.getByRole("button", { name: /신청하기/ }).click();

    // 확인 모달 (짝수 선택이므로 편도 모달 없이 바로 신청 정보 확인)
    await expect(page.getByText("신청 정보 확인")).toBeVisible();
    await toggleCheckbox(page, "refundPolicyConsent");
    await page.getByRole("button", { name: "확인" }).click();

    // 실패 페이지로 이동
    await expect(page).toHaveURL(
      new RegExp(`/retreat/${SLUG}/registration-failure`)
    );
    await expect(
      page.getByText("신청 오류", { exact: true })
    ).toBeVisible();
    await expect(page.getByText("서버 오류가 발생했습니다")).toBeVisible();
  });
});
