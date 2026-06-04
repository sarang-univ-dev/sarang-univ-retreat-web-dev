import { test, expect, type Page } from "@playwright/test";
import { mockRetreatApi } from "./helpers/mock-api";
import { fillRetreatRequired, confirmRetreatModal } from "./helpers/fill";

const SLUG = "test-retreat";

// 각 페이지에서 uncaught 예외(pageerror)와 console.error 가 없어야 한다.
// Next 개발 모드의 알려진 무해 경고는 화이트리스트로 무시한다.
const IGNORED = [
  /Download the React DevTools/i,
  /Fast Refresh/i,
  // 네트워크 상태 로그(예: 404 라우트의 문서 응답)는 JS 에러가 아니다.
  /Failed to load resource/i,
];

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
  page.on("console", (msg) => {
    if (msg.type() !== "error") return;
    const text = msg.text();
    if (IGNORED.some((re) => re.test(text))) return;
    errors.push(`console.error: ${text}`);
  });
  return errors;
}

test.describe("런타임 콘솔/예외 청결성", () => {
  test("수양회 폼 진입 시 콘솔 에러/예외 없음", async ({ page }) => {
    const errors = collectErrors(page);
    await mockRetreatApi(page, { open: true });
    await page.goto(`/retreat/${SLUG}/retreat`);
    await expect(page.locator("#name")).toBeVisible();
    await page.waitForTimeout(500);
    expect(errors, errors.join("\n")).toEqual([]);
  });

  test("셔틀버스 폼 진입 시 콘솔 에러/예외 없음", async ({ page }) => {
    const errors = collectErrors(page);
    await mockRetreatApi(page, { open: true });
    await page.goto(`/retreat/${SLUG}/shuttle-bus`);
    await expect(page.locator("#name")).toBeVisible();
    await page.waitForTimeout(500);
    expect(errors, errors.join("\n")).toEqual([]);
  });

  test("not-found 페이지 콘솔 에러/예외 없음", async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto(`/this-route-does-not-exist`);
    await page.waitForTimeout(500);
    expect(errors, errors.join("\n")).toEqual([]);
  });

  test("수양회 신청 성공 플로우 전체 콘솔 에러/예외 없음", async ({ page }) => {
    const errors = collectErrors(page);
    await mockRetreatApi(page, { open: true });
    await page.goto(`/retreat/${SLUG}/retreat`);
    await fillRetreatRequired(page);
    await page.getByRole("button", { name: "수양회 신청하기" }).click();
    await expect(
      page.getByRole("heading", { name: "신청 정보 확인" })
    ).toBeVisible();
    await confirmRetreatModal(page);
    await expect(page).toHaveURL(
      new RegExp(`/retreat/${SLUG}/registration-success`)
    );
    await page.waitForTimeout(500);
    expect(errors, errors.join("\n")).toEqual([]);
  });
});
