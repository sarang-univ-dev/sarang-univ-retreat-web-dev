import type { Page } from "@playwright/test";

/**
 * shadcn(Radix) Checkbox는 내부적으로 button 요소라, label[for]을 통해
 * 사용자 인터랙션과 동일한 경로로 토글한다.
 */
export async function toggleCheckbox(page: Page, id: string) {
  await page.locator(`label[for="${id}"]`).click();
}

/**
 * shadcn Select 트리거는 role="combobox" 버튼으로 렌더되지만 id가 없다.
 * 폼에 나타난 순서(index)로 트리거를 열고 옵션을 선택한다.
 */
export async function selectOptionAt(
  page: Page,
  index: number,
  optionName: RegExp | string
) {
  await page.getByRole("combobox").nth(index).click();
  await page.getByRole("option", { name: optionName }).click();
}

/**
 * placeholder 텍스트로 아직 선택되지 않은 Select 트리거를 열고 옵션을 선택한다.
 */
export async function selectOptionByPlaceholder(
  page: Page,
  placeholder: RegExp | string,
  optionName: RegExp | string
) {
  await page
    .getByRole("combobox")
    .filter({ hasText: placeholder })
    .first()
    .click();
  await page.getByRole("option", { name: optionName }).click();
}
