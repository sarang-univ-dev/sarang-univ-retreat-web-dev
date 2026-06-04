import { test, expect } from "@playwright/test";
import { mockRetreatApi } from "./helpers/mock-api";

// Characterization tests for the GET /info failure branches.
// Sources under test:
//   src/app/retreat/[slug]/retreat/page.tsx     (isError || !retreatData branch)
//   src/app/retreat/[slug]/shuttle-bus/page.tsx (retreatError || !retreatData branch)
// All Korean copy is quoted verbatim from those sources.

const SLUG = "test-retreat";
const RETREAT_URL = `/retreat/${SLUG}/retreat`;
const SHUTTLE_URL = `/retreat/${SLUG}/shuttle-bus`;

test.describe("retreat info load error", () => {
  test("retreat page shows error when /info fails", async ({ page }) => {
    await mockRetreatApi(page, { infoStatus: 500 });

    await page.goto(RETREAT_URL);

    await expect(
      page.locator("p.text-red-500", {
        hasText: "데이터를 불러오는데 실패했습니다.",
      })
    ).toBeVisible();
  });

  test("shuttle-bus page shows error when /info fails", async ({ page }) => {
    await mockRetreatApi(page, { infoStatus: 500 });

    await page.goto(SHUTTLE_URL);

    await expect(
      page.locator("p.text-red-500", {
        hasText: "수양회 정보를 찾을 수 없습니다.",
      })
    ).toBeVisible();
  });
});
