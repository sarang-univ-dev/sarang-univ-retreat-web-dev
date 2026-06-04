import { test, expect } from "@playwright/test";
import { mockRetreatApi } from "./helpers/mock-api";
import { toggleCheckbox } from "./helpers/form";
import { fillBusRequired } from "./helpers/fill";

// 셔틀버스 등록 서버 오류(500) 시 실패 페이지로 이동하고,
// "다시 시도하기" 가 셔틀버스 폼으로 복귀하는지 검증한다.
// 출처:
//   components/forms/bus-submit-section.tsx (onError -> registration-failure, registrationType: "bus-registration")
//   app/retreat/[slug]/registration-failure/page.tsx (bus-registration -> /shuttle-bus 링크)
//   app/retreat/[slug]/shuttle-bus/page.tsx (heading "셔틀버스 선택")

const SLUG = "test-retreat";
const SHUTTLE_URL = `/retreat/${SLUG}/shuttle-bus`;

test.describe("셔틀버스 등록 실패 후 재시도", () => {
  test.beforeEach(async ({ page }) => {
    await mockRetreatApi(page, {
      open: true,
      busRegisterStatus: 500,
      busRegisterError: "서버 오류",
    });
  });

  test("등록 500 -> '신청 오류' 페이지 -> '다시 시도하기' 로 셔틀버스 폼 복귀", async ({
    page,
  }) => {
    await page.goto(SHUTTLE_URL);

    await expect(
      page.getByRole("heading", { name: "셔틀버스 선택" })
    ).toBeVisible();

    // 왕복(201 교회->수양관 + 203 수양관->교회) = 짝수 => 편도 모달 없음
    await fillBusRequired(page, { busIds: [201, 203] });

    // 제출 -> 정보 확인 모달
    await page.getByRole("button", { name: /신청하기 \(.*원\)/ }).click();
    await expect(
      page.getByRole("heading", { name: "신청 정보 확인" })
    ).toBeVisible();

    // 환불 불가 동의 후 확인 -> POST 가 500 으로 실패
    await toggleCheckbox(page, "refundPolicyConsent");
    await page.getByRole("button", { name: "확인" }).click();

    // 실패 페이지로 이동, 일반 오류 제목
    await expect(page).toHaveURL(
      new RegExp(`/retreat/${SLUG}/registration-failure`)
    );
    await expect(
      page.getByRole("heading", { name: "신청 오류" })
    ).toBeVisible();

    // 재시도 링크 클릭 -> 셔틀버스 폼으로 복귀
    await page.getByRole("link", { name: "다시 시도하기" }).click();

    await expect(page).toHaveURL(new RegExp(`/retreat/${SLUG}/shuttle-bus$`));
    await expect(
      page.getByRole("heading", { name: "셔틀버스 선택" })
    ).toBeVisible();
  });
});
