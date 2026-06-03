import { test, expect } from "@playwright/test";
import { mockRetreatApi } from "./helpers/mock-api";
import { toggleCheckbox, selectOptionByPlaceholder } from "./helpers/form";
import { fillRetreatRequired, confirmRetreatModal } from "./helpers/fill";

const SLUG = "test-retreat";
const RETREAT_URL = `/retreat/${SLUG}/retreat`;

test.describe("수양회 부서/학년 선택 동작", () => {
  test.beforeEach(async ({ page }) => {
    await mockRetreatApi(page, { open: true });
  });

  test("부서를 선택하기 전에는 학년 Select이 비활성화되어 있다", async ({
    page,
  }) => {
    await page.goto(RETREAT_URL);

    // 부서(combobox index 0), 학년(combobox index 1) 순서로 렌더된다.
    const gradeCombobox = page.getByRole("combobox").nth(1);

    // 부서 선택 전: 학년 비활성화
    await expect(gradeCombobox).toBeDisabled();

    // 부서 선택 후: 학년 활성화
    await selectOptionByPlaceholder(page, "부서를 선택해주세요", "1부 사랑부");
    await expect(gradeCombobox).toBeEnabled();
  });

  test("2부 소망부 → 1학년 소망마을 신청 → 신청 완료 페이지로 이동", async ({
    page,
  }) => {
    await page.goto(RETREAT_URL);

    await fillRetreatRequired(page, {
      univGroup: "2부 소망부",
      grade: "1학년 소망마을",
    });

    await page.getByRole("button", { name: "수양회 신청하기" }).click();
    await expect(page.getByText("신청 정보 확인")).toBeVisible();

    await confirmRetreatModal(page);

    await expect(page).toHaveURL(
      new RegExp(`/retreat/${SLUG}/registration-success`)
    );
    await expect(
      page.getByRole("heading", { name: "수양회 신청 완료" })
    ).toBeVisible();
  });

  test("부서를 다른 부서로 변경하면 선택했던 학년이 초기화된다", async ({
    page,
  }) => {
    await page.goto(RETREAT_URL);

    // 1부 사랑부 → 1학년 예수마을 선택
    await selectOptionByPlaceholder(page, "부서를 선택해주세요", "1부 사랑부");
    await selectOptionByPlaceholder(
      page,
      "학년을 선택해주세요",
      "1학년 예수마을"
    );
    // 학년 트리거에 선택값 반영 (shadcn은 숨은 native <option>도 렌더하므로 combobox로 한정)
    const gradeCombobox = page.getByRole("combobox").nth(1);
    await expect(gradeCombobox).toContainText("1학년 예수마을");

    // 다른 부서(2부 소망부)로 변경하면 학년이 초기화되어 placeholder가 다시 보인다.
    await selectOptionByPlaceholder(page, "1부 사랑부", "2부 소망부");

    await expect(gradeCombobox).toHaveText("학년을 선택해주세요");
    await expect(gradeCombobox).not.toContainText("1학년 예수마을");
  });
});
