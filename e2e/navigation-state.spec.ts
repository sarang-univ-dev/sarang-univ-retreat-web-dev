import { test, expect } from "@playwright/test";
import { mockRetreatApi } from "./helpers/mock-api";
import { fillRetreatRequired, confirmRetreatModal } from "./helpers/fill";
import { toggleCheckbox } from "./helpers/form";

const SLUG = "test-retreat";
const RETREAT_URL = `/retreat/${SLUG}/retreat`;

test.describe("네비게이션 / 제출 상태", () => {
  test("성공 페이지에서 새로고침하면 store 가 비워져 신청 폼으로 돌려보낸다", async ({
    page,
  }) => {
    await mockRetreatApi(page, { open: true });
    await page.goto(RETREAT_URL);
    await fillRetreatRequired(page);
    await page.getByRole("button", { name: "수양회 신청하기" }).click();
    await confirmRetreatModal(page);

    await expect(page).toHaveURL(
      new RegExp(`/retreat/${SLUG}/registration-success`)
    );

    // 새로고침 → 스냅샷 store 가 이미 비워졌으므로 폼으로 리다이렉트
    await page.reload();
    await expect(page).toHaveURL(new RegExp(`/retreat/${SLUG}/retreat$`));
  });

  test("제출 중(pending)에는 신청 버튼이 비활성화되어 중복 제출을 막는다", async ({
    page,
  }) => {
    await mockRetreatApi(page, { open: true });
    // 등록 POST 응답을 지연시켜 pending 상태를 관찰 (mockRetreatApi 보다 나중에 등록 → 우선).
    await page.route("**/api/v1/retreat/*/registration", async (route) => {
      if (route.request().method() !== "POST") return route.fallback();
      await new Promise((r) => setTimeout(r, 1500));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true }),
      });
    });

    await page.goto(RETREAT_URL);
    await fillRetreatRequired(page);
    await page.getByRole("button", { name: "수양회 신청하기" }).click();

    // 모달 동의 후 확인 → pending 동안 "처리 중..." 노출
    await toggleCheckbox(page, "scheduleChangeConsent");
    await toggleCheckbox(page, "refundPolicyConsent");
    await page.getByRole("button", { name: "확인" }).click();

    // 모달이 닫히고(즉시 setShowConfirmModal(false)) pending 동안 메인 신청 버튼이 잠긴다.
    await expect(
      page.getByRole("button", { name: "수양회 신청하기" })
    ).toBeDisabled();

    // 결국 성공 페이지로 이동
    await expect(page).toHaveURL(
      new RegExp(`/retreat/${SLUG}/registration-success`),
      { timeout: 5000 }
    );
  });

  test("실패 페이지에서 새로고침하면 기본 안내 문구를 유지한다(크래시 없음)", async ({
    page,
  }) => {
    await mockRetreatApi(page, { open: true, registerStatus: 500 });
    await page.goto(RETREAT_URL);
    await fillRetreatRequired(page);
    await page.getByRole("button", { name: "수양회 신청하기" }).click();
    await confirmRetreatModal(page);

    await expect(page).toHaveURL(
      new RegExp(`/retreat/${SLUG}/registration-failure`)
    );
    await expect(page.getByText("신청 오류")).toBeVisible();

    // 새로고침 → store 비워짐 → 기본 문구로 여전히 실패 페이지에 머문다
    await page.reload();
    await expect(page).toHaveURL(
      new RegExp(`/retreat/${SLUG}/registration-failure`)
    );
    await expect(page.getByText("신청 오류")).toBeVisible();
  });
});
