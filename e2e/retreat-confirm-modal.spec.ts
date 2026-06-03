import { test, expect } from "@playwright/test";
import { mockRetreatApi } from "./helpers/mock-api";
import { toggleCheckbox } from "./helpers/form";
import { fillRetreatRequired } from "./helpers/fill";

const SLUG = "test-retreat";
const RETREAT_URL = `/retreat/${SLUG}/retreat`;

test.describe("수양회 확인 모달", () => {
  test.beforeEach(async ({ page }) => {
    await mockRetreatApi(page, { open: true });
  });

  test("모달이 열리고 입력한 이름/전화번호가 노출된다", async ({ page }) => {
    await page.goto(RETREAT_URL);

    await fillRetreatRequired(page, {
      name: "이조원",
      phone: "010-1234-5678",
    });

    await page.getByRole("button", { name: "수양회 신청하기" }).click();

    await expect(
      page.getByRole("heading", { name: "신청 정보 확인" })
    ).toBeVisible();
    await expect(page.getByText("이조원")).toBeVisible();
    await expect(page.getByText("010-1234-5678")).toBeVisible();
  });

  test('"취소" 클릭 시 모달이 닫히고 폼 URL에 머문다', async ({ page }) => {
    await page.goto(RETREAT_URL);

    await fillRetreatRequired(page);

    await page.getByRole("button", { name: "수양회 신청하기" }).click();
    await expect(
      page.getByRole("heading", { name: "신청 정보 확인" })
    ).toBeVisible();

    await page.getByRole("button", { name: "취소" }).click();

    await expect(
      page.getByRole("heading", { name: "신청 정보 확인" })
    ).toHaveCount(0);
    await expect(page).toHaveURL(new RegExp(`/retreat/${SLUG}/retreat`));
  });

  test('동의 미체크로 "확인" 클릭 시 동의 에러가 노출되고 모달이 유지된다', async ({
    page,
  }) => {
    await page.goto(RETREAT_URL);

    await fillRetreatRequired(page);

    await page.getByRole("button", { name: "수양회 신청하기" }).click();
    await expect(
      page.getByRole("heading", { name: "신청 정보 확인" })
    ).toBeVisible();

    await page.getByRole("button", { name: "확인" }).click();

    await expect(
      page.locator("p.text-red-500", {
        hasText: "해당 내용을 읽고 체크박스에 체크해주세요",
      })
    ).toHaveCount(2);

    // 모달은 여전히 열린 상태이며, 신청 완료로 이동하지 않는다.
    await expect(
      page.getByRole("heading", { name: "신청 정보 확인" })
    ).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`/retreat/${SLUG}/retreat`));
  });

  test("두 동의 체크 + 확인 시 신청 완료 페이지로 이동한다", async ({
    page,
  }) => {
    await page.goto(RETREAT_URL);

    await fillRetreatRequired(page);

    await page.getByRole("button", { name: "수양회 신청하기" }).click();
    await expect(
      page.getByRole("heading", { name: "신청 정보 확인" })
    ).toBeVisible();

    await toggleCheckbox(page, "scheduleChangeConsent");
    await toggleCheckbox(page, "refundPolicyConsent");
    await page.getByRole("button", { name: "확인" }).click();

    await expect(page).toHaveURL(
      new RegExp(`/retreat/${SLUG}/registration-success`)
    );
    await expect(
      page.getByRole("heading", { name: "수양회 신청 완료" })
    ).toBeVisible();
  });
});
