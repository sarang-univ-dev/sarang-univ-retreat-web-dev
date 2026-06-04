import { test, expect } from "@playwright/test";
import { mockRetreatApi } from "./helpers/mock-api";
import { fillRetreatRequired, confirmRetreatModal, fillBusRequired } from "./helpers/fill";
import { toggleCheckbox } from "./helpers/form";

const SLUG = "test-retreat";
const RETREAT_URL = `/retreat/${SLUG}/retreat`;
const SHUTTLE_URL = `/retreat/${SLUG}/shuttle-bus`;

test.describe("기능 플로우 정확성", () => {
  test.beforeEach(async ({ page }) => {
    await mockRetreatApi(page, { open: true });
  });

  test("입금 계좌가 등록한 부서에 매칭된다 (1부=계좌 노출)", async ({ page }) => {
    await page.goto(RETREAT_URL);
    await fillRetreatRequired(page); // 1부 → univGroupInfo 에 계좌 존재
    await page.getByRole("button", { name: "수양회 신청하기" }).click();
    await confirmRetreatModal(page);
    await expect(page).toHaveURL(
      new RegExp(`/retreat/${SLUG}/registration-success`)
    );
    await expect(page.getByText("신한은행 123-456-789")).toBeVisible();
  });

  test("등록 부서에 계좌 정보가 없으면(2부) 완료 페이지가 계좌 없이 graceful 하게 렌더된다", async ({
    page,
  }) => {
    await page.goto(RETREAT_URL);
    await fillRetreatRequired(page, {
      univGroup: "2부 소망부",
      grade: "1학년 소망마을",
    });
    await page.getByRole("button", { name: "수양회 신청하기" }).click();
    await confirmRetreatModal(page);
    await expect(page).toHaveURL(
      new RegExp(`/retreat/${SLUG}/registration-success`)
    );
    // 완료 페이지는 정상 렌더되지만 1부 계좌는 보이지 않는다 (부서 매칭 결과 없음)
    await expect(
      page.getByRole("heading", { name: "수양회 신청 완료" })
    ).toBeVisible();
    await expect(page.getByText("신한은행 123-456-789")).toHaveCount(0);
  });

  test("새가족(NEW_COMER): 폼 총금액은 '입금 대기', 완료 페이지는 금액/계좌 블록 없이 새가족 안내", async ({
    page,
  }) => {
    await page.goto(RETREAT_URL);
    await fillRetreatRequired(page);
    await page.locator('label[for="userType-newcomer"]').click();

    // 폼의 총금액이 금액 대신 "입금 대기" 로 바뀐다.
    await expect(page.getByText("총금액:")).toContainText("입금 대기");

    await page.getByRole("button", { name: "수양회 신청하기" }).click();
    await confirmRetreatModal(page);
    await expect(page).toHaveURL(
      new RegExp(`/retreat/${SLUG}/registration-success`)
    );

    // 완료 페이지: 특수유형 안내 + 금액/계좌 블록 미노출 + 신청 유형 '새가족'
    await expect(page.getByText("신청 유형:")).toBeVisible();
    await expect(page.getByText("새가족", { exact: true })).toBeVisible();
    await expect(page.getByText("입금 금액:")).toHaveCount(0);
    await expect(page.getByText("입금 계좌:")).toHaveCount(0);
    await expect(page.getByText("입금 안내")).toHaveCount(0);
  });

  test("중간 버스(부분참)를 선택하면 부분참 안내 경고가 노출된다", async ({
    page,
  }) => {
    await page.goto(SHUTTLE_URL);
    // 201(첫차)·202(중간)·203(막차) 모두 선택 → 중간차 포함 → 부분참 경고
    await fillBusRequired(page, { busIds: [201, 202, 203] });
    await expect(
      page.getByText(/부분참 셔틀버스는/)
    ).toBeVisible();
  });

  test("버스를 모두 해제하면 선택 카드/총금액이 사라지고 제출 버튼이 비활성화된다", async ({
    page,
  }) => {
    await page.goto(SHUTTLE_URL);
    await fillBusRequired(page, { busIds: [201, 203] });

    // 선택된 상태: 총 금액 카드 노출
    await expect(page.getByText("총 금액:")).toBeVisible();

    // 두 버스 모두 해제
    await toggleCheckbox(page, "bus-201");
    await toggleCheckbox(page, "bus-203");

    await expect(page.getByText("총 금액:")).toHaveCount(0);
    await expect(page.getByRole("button", { name: /신청하기/ })).toBeDisabled();
  });
});
