import { test, expect } from "@playwright/test";
import { mockRetreatApi } from "./helpers/mock-api";
import { fillRetreatRequired } from "./helpers/fill";

const SLUG = "test-retreat";
const RETREAT_URL = `/retreat/${SLUG}/retreat`;

// 이름이 공백뿐("   ")이면 zod의 .trim().min(1)에 의해 빈 값으로 취급되어
// "이름을 입력해주세요" 에러가 떠야 하고, 확인 모달은 열리지 않아야 한다.
test.describe("수양회 등록 폼 - 이름 공백 검증", () => {
  test.beforeEach(async ({ page }) => {
    await mockRetreatApi(page, { open: true });
  });

  test('이름을 공백("   ")으로 제출하면 "이름을 입력해주세요" 에러가 뜨고 모달이 열리지 않는다', async ({
    page,
  }) => {
    await page.goto(RETREAT_URL);

    // 이름만 공백으로 덮어쓰고 나머지는 모두 유효하게 채운다.
    await fillRetreatRequired(page, { name: "   " });

    await page.getByRole("button", { name: "수양회 신청하기" }).click();

    // 에러 문구(Select placeholder와 겹칠 수 있어 p.text-red-500 로 한정).
    await expect(
      page.locator("p.text-red-500", { hasText: "이름을 입력해주세요" })
    ).toBeVisible();

    // 확인 모달이 열리지 않는다 (제목 "신청 정보 확인" 없음).
    await expect(
      page.getByRole("heading", { name: "신청 정보 확인" })
    ).toHaveCount(0);

    // 폼 페이지에 머문다.
    await expect(page).toHaveURL(new RegExp(`/retreat/${SLUG}/retreat$`));
  });
});
