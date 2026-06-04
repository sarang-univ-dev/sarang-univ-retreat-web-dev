import { test, expect } from "@playwright/test";
import { mockRetreatApi } from "./helpers/mock-api";
import { toggleCheckbox } from "./helpers/form";
import { fillRetreatRequired, confirmRetreatModal, fillBusRequired } from "./helpers/fill";

const SLUG = "test-retreat";
const RETREAT_URL = `/retreat/${SLUG}/retreat`;
const SHUTTLE_BUS_URL = `/retreat/${SLUG}/shuttle-bus`;

// 실패 페이지(registration-failure)의 사용자-가시 동작을 고정하는 특성화 테스트.
test.describe("실패 페이지", () => {
  test("수양회 등록 400 → '신청 오류' + 서버 메시지 + 재시도 링크는 /retreat/test-retreat 를 가리킨다", async ({
    page,
  }) => {
    await mockRetreatApi(page, {
      open: true,
      registerStatus: 400,
      registerError: "정원 초과",
    });

    await page.goto(RETREAT_URL);

    await fillRetreatRequired(page);
    await page.getByRole("button", { name: "수양회 신청하기" }).click();
    await expect(page.getByText("신청 정보 확인")).toBeVisible();
    await confirmRetreatModal(page);

    await expect(page).toHaveURL(
      new RegExp(`/retreat/${SLUG}/registration-failure`)
    );
    await expect(
      page.getByRole("heading", { name: "신청 오류" })
    ).toBeVisible();
    await expect(page.getByText("정원 초과")).toBeVisible();

    const retryLink = page.getByRole("link", { name: "다시 시도하기" });
    await expect(retryLink).toBeVisible();
    await expect(retryLink).toHaveAttribute("href", `/retreat/${SLUG}/retreat`);
  });

  test("셔틀버스 등록 500 → '신청 오류' + 서버 메시지 + 재시도 링크는 /retreat/test-retreat/shuttle-bus 를 가리킨다", async ({
    page,
  }) => {
    await mockRetreatApi(page, {
      open: true,
      busRegisterStatus: 500,
      busRegisterError: "서버 오류가 발생했습니다",
    });

    await page.goto(SHUTTLE_BUS_URL);

    // 왕복(짝수) 선택이라 편도 확인 모달 없이 바로 신청 정보 확인 모달로 진행된다.
    await fillBusRequired(page, { busIds: [201, 203] });
    await page.getByRole("button", { name: /신청하기/ }).click();
    await expect(page.getByText("신청 정보 확인")).toBeVisible();
    // 셔틀버스 확인 모달은 환불 정책 동의만 필요하다(수양회와 달리 일정 변경 동의 없음).
    await toggleCheckbox(page, "refundPolicyConsent");
    await page.getByRole("button", { name: "확인" }).click();

    await expect(page).toHaveURL(
      new RegExp(`/retreat/${SLUG}/registration-failure`)
    );
    await expect(
      page.getByRole("heading", { name: "신청 오류" })
    ).toBeVisible();
    await expect(page.getByText("서버 오류가 발생했습니다")).toBeVisible();

    const retryLink = page.getByRole("link", { name: "다시 시도하기" });
    await expect(retryLink).toBeVisible();
    await expect(retryLink).toHaveAttribute(
      "href",
      `/retreat/${SLUG}/shuttle-bus`
    );
  });

  test("신청 기간이 아닐 때 retreat 방문 → '수양회 신청 기간이 아닙니다' 페이지로 이동한다", async ({
    page,
  }) => {
    await mockRetreatApi(page, { open: false });

    await page.goto(RETREAT_URL);

    await expect(page).toHaveURL(
      new RegExp(`/retreat/${SLUG}/registration-failure\\?reason=period-closed`)
    );
    await expect(
      page.getByRole("heading", { name: "수양회 신청 기간이 아닙니다" })
    ).toBeVisible();
  });
});
