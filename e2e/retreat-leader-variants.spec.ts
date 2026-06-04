import { test, expect } from "@playwright/test";
import { mockRetreatApi } from "./helpers/mock-api";

/**
 * 현재 GBS/EBS 리더(#currentLeaderName) 필드의 실시간(onChange) 유효성 검사.
 * 메시지/패턴은 src/schemas/registration.ts 단일 출처와 동일:
 *   INVALID_NAME_PATTERN  -> "리더 이름을 정확히 입력해주세요"
 *   TITLE_SUFFIX_PATTERN  -> "이름만 적어주세요"
 * 리더 필드만 입력하고 에러는 p.text-red-500 로 한정해 단정한다.
 */

const RETREAT_URL = "/retreat/test-retreat/retreat";

const INVALID_MESSAGE = "리더 이름을 정확히 입력해주세요";
const TITLE_SUFFIX_MESSAGE = "이름만 적어주세요";

// INVALID_NAME_PATTERN 에 매칭되는 입력들.
const INVALID_NAMES = ["없음", "모르겠음", "몰라요", "??", "--", "x", "X", "..."];

// TITLE_SUFFIX_PATTERN 에 매칭되는 입력들 (직책 접미사).
const TITLE_SUFFIX_NAMES = [
  "김간사",
  "이순장",
  "박고을지기",
  "최마을장",
  "정GBS",
  "한EBS",
  "새가족",
  "홍길동 리더",
];

test.describe("retreat 리더명 실시간 유효성 검사", () => {
  test.beforeEach(async ({ page }) => {
    await mockRetreatApi(page, { open: true });
    await page.goto(RETREAT_URL);
  });

  for (const name of INVALID_NAMES) {
    test(`유효하지 않은 이름 "${name}" 입력 시 정확히 입력 안내`, async ({
      page,
    }) => {
      await page.locator("#currentLeaderName").fill(name);

      await expect(
        page.locator("p.text-red-500", { hasText: INVALID_MESSAGE })
      ).toBeVisible();
    });
  }

  for (const name of TITLE_SUFFIX_NAMES) {
    test(`직책 접미사 "${name}" 입력 시 이름만 적어주세요 안내`, async ({
      page,
    }) => {
      await page.locator("#currentLeaderName").fill(name);

      await expect(
        page.locator("p.text-red-500", { hasText: TITLE_SUFFIX_MESSAGE })
      ).toBeVisible();
    });
  }

  test('정상 이름 "김하늘" 입력 시 리더 에러 없음', async ({ page }) => {
    await page.locator("#currentLeaderName").fill("김하늘");

    // 실시간 검증을 거치도록 다른 곳으로 포커스 이동.
    await page.locator("#currentLeaderName").blur();

    await expect(
      page.locator("p.text-red-500", { hasText: INVALID_MESSAGE })
    ).toHaveCount(0);
    await expect(
      page.locator("p.text-red-500", { hasText: TITLE_SUFFIX_MESSAGE })
    ).toHaveCount(0);
  });
});
