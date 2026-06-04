import { test, expect } from "@playwright/test";
import { mockRetreatApi } from "./helpers/mock-api";

const SLUG = "test-retreat";
const RETREAT_URL = `/retreat/${SLUG}/retreat`;
const SHUTTLE_URL = `/retreat/${SLUG}/shuttle-bus`;

// 접근성/문서 의미 구조에 대한 사소하지만 중요한 검증.
test.describe("문서 의미 구조 / 접근성", () => {
  test.beforeEach(async ({ page }) => {
    await mockRetreatApi(page, { open: true });
  });

  test("html lang 은 한국어(ko) 콘텐츠에 맞아야 한다", async ({ page }) => {
    await page.goto(RETREAT_URL);
    await expect(page.locator("html")).toHaveAttribute("lang", "ko");
  });

  test("문서 title 이 수양회 신청 페이지를 나타낸다", async ({ page }) => {
    await page.goto(RETREAT_URL);
    await expect(page).toHaveTitle(/수양회 신청/);
  });

  test("수양회 폼: 모든 label[for] 이 실제 컨트롤을 가리킨다", async ({
    page,
  }) => {
    await page.goto(RETREAT_URL);
    await expect(page.locator("#name")).toBeVisible();

    const labels = await page.locator("label[for]").all();
    expect(labels.length).toBeGreaterThan(0);
    for (const label of labels) {
      const forId = await label.getAttribute("for");
      // label[for=X] 는 id=X 인 요소가 정확히 하나 있어야 연결이 유효하다.
      await expect(
        page.locator(`[id="${forId}"]`),
        `label[for="${forId}"] 가 가리키는 컨트롤이 없음`
      ).toHaveCount(1);
    }
  });

  test("셔틀버스 폼: 모든 label[for] 이 실제 컨트롤을 가리킨다", async ({
    page,
  }) => {
    await page.goto(SHUTTLE_URL);
    await expect(page.locator("#name")).toBeVisible();

    const labels = await page.locator("label[for]").all();
    expect(labels.length).toBeGreaterThan(0);
    for (const label of labels) {
      const forId = await label.getAttribute("for");
      await expect(
        page.locator(`[id="${forId}"]`),
        `label[for="${forId}"] 가 가리키는 컨트롤이 없음`
      ).toHaveCount(1);
    }
  });

  test("필수 텍스트 입력은 라벨과 연결돼 있다 (수양회)", async ({ page }) => {
    await page.goto(RETREAT_URL);
    for (const id of ["name", "phoneNumber", "currentLeaderName"]) {
      await expect(page.locator(`#${id}`)).toBeVisible();
      await expect(page.locator(`label[for="${id}"]`)).toHaveCount(1);
    }
  });

  test("페이지에 최소 하나의 제목(heading)이 있다", async ({ page }) => {
    await page.goto(RETREAT_URL);
    await expect(
      page.getByRole("heading").first()
    ).toBeVisible();
  });
});
