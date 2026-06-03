import { test, expect } from "@playwright/test";
import { mockRetreatApi } from "./helpers/mock-api";
import { fillRetreatRequired, confirmRetreatModal } from "./helpers/fill";

// 수양회 정상 신청(해피패스, userType none) 후 완료 페이지에 입금자명 행이
// 노출되는지 검증한다.
//
// 입금자명 렌더 출처: src/components/registration-complete.tsx
//   - 라벨: <span className="font-medium">입금자명:</span>
//   - 값  : <span>{univGroup + "부" + gradeId + name}</span>
// userType none → isSpecialType=false → "입금 안내" 블록이 렌더되어
//   입금자명 행이 표시된다. 기본 신청자 이름은 "이조원"(fillRetreatRequired).

const SLUG = "test-retreat";
const RETREAT_URL = `/retreat/${SLUG}/retreat`;

test.describe("수양회 신청 완료 페이지 입금자명 노출", () => {
  test.beforeEach(async ({ page }) => {
    await mockRetreatApi(page, { open: true });
  });

  test("정상 신청 → 완료 페이지에 입금자명 라벨과 이름이 포함된 값 표시", async ({
    page,
  }) => {
    await page.goto(RETREAT_URL);

    await fillRetreatRequired(page);

    await page.getByRole("button", { name: "수양회 신청하기" }).click();
    await expect(
      page.getByRole("heading", { name: "신청 정보 확인" })
    ).toBeVisible();

    await confirmRetreatModal(page);

    await expect(page).toHaveURL(
      new RegExp(`/retreat/${SLUG}/registration-success`)
    );
    await expect(
      page.getByRole("heading", { name: "수양회 신청 완료" })
    ).toBeVisible();

    // 입금자명 라벨(출처 그대로) 노출.
    await expect(page.getByText("입금자명:")).toBeVisible();

    // 값은 `{univGroup}부{gradeId}{name}` 포맷 → 신청자 이름("이조원")을 포함.
    await expect(
      page.getByText("이조원", { exact: false }).first()
    ).toBeVisible();
  });
});
