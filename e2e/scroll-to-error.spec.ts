import { test, expect } from "@playwright/test";
import { mockRetreatApi } from "./helpers/mock-api";
import { fillRetreatRequired } from "./helpers/fill";
import { toggleCheckbox } from "./helpers/form";

const SLUG = "test-retreat";
const RETREAT_URL = `/retreat/${SLUG}/retreat`;
const SHUTTLE_URL = `/retreat/${SLUG}/shuttle-bus`;

// '신청하기' 클릭 시 invalid 한 첫 필드로 스크롤 + 포커스 이동.
// (부드러운 스크롤 자체는 단언하기 어려워, 관찰 가능한 '포커스 이동'으로 검증)
test.describe("제출 시 첫 invalid 필드로 포커스/스크롤", () => {
  test.beforeEach(async ({ page }) => {
    await mockRetreatApi(page, { open: true });
  });

  test("수양회: 빈 폼 제출 → 첫 필드(개인정보 동의)로 포커스", async ({
    page,
  }) => {
    await page.goto(RETREAT_URL);
    await page.getByRole("button", { name: "수양회 신청하기" }).click();
    await expect(page.locator("#privacyConsent")).toBeFocused();
  });

  test("수양회: 전화번호만 비우면 그 필드로 포커스 이동", async ({ page }) => {
    await page.goto(RETREAT_URL);
    await fillRetreatRequired(page, { phone: "" });
    await page.getByRole("button", { name: "수양회 신청하기" }).click();
    await expect(page.locator("#phoneNumber")).toBeFocused();
  });

  test("수양회: 일정 미선택만 → 일정 섹션으로 스크롤된다", async ({ page }) => {
    await page.goto(RETREAT_URL);
    await fillRetreatRequired(page, { allSchedule: false });
    await page.getByRole("button", { name: "수양회 신청하기" }).click();
    // scheduleSelection 컨테이너가 뷰포트 안으로 들어온다.
    await expect(page.locator("#scheduleSelection")).toBeInViewport();
  });

  test("셔틀버스: 이름/전화/버스만 채우고 제출 → 첫 동의 필드로 포커스", async ({
    page,
  }) => {
    await page.goto(SHUTTLE_URL);
    await page.locator("#name").fill("이조원");
    await page.locator("#phoneNumber").fill("010-1234-5678");
    await toggleCheckbox(page, "bus-201");
    await toggleCheckbox(page, "bus-203");
    // 동의/부서/학년/성별 미입력 상태로 제출 (버튼은 활성)
    await page.getByRole("button", { name: /신청하기/ }).click();
    await expect(page.locator("#privacyConsent")).toBeFocused();
  });
});
