import { test, expect } from "@playwright/test";
import { mockRetreatApi } from "./helpers/mock-api";
import { fillRetreatRequired } from "./helpers/fill";

const SLUG = "test-retreat";
const RETREAT_URL = `/retreat/${SLUG}/retreat`;

// 제출은 버튼(type=button) 클릭으로만 일어난다. <form> 은 preventDefault 이므로
// 입력 필드에서 Enter 를 눌러도 제출/모달이 발생하지 않아야 한다.
test.describe("Enter 키로는 제출되지 않는다", () => {
  test("유효 입력 후 입력 필드에서 Enter 를 눌러도 확인 모달이 열리지 않는다", async ({
    page,
  }) => {
    await mockRetreatApi(page, { open: true });
    await page.goto(RETREAT_URL);

    await fillRetreatRequired(page);

    await page.locator("#name").press("Enter");
    await page.locator("#phoneNumber").press("Enter");

    await expect(page.getByText("신청 정보 확인")).toHaveCount(0);
    await expect(page).toHaveURL(new RegExp(`/retreat/${SLUG}/retreat$`));

    // 버튼 클릭 시에는 정상적으로 모달이 열린다 (대조).
    await page.getByRole("button", { name: "수양회 신청하기" }).click();
    await expect(
      page.getByRole("heading", { name: "신청 정보 확인" })
    ).toBeVisible();
  });
});
