import { test, expect, type Request } from "@playwright/test";
import { mockRetreatApi } from "./helpers/mock-api";
import {
  fillRetreatRequired,
  confirmRetreatModal,
  fillBusRequired,
} from "./helpers/fill";
import { toggleCheckbox, selectOptionByPlaceholder } from "./helpers/form";

const SLUG = "test-retreat";
const RETREAT_URL = `/retreat/${SLUG}/retreat`;
const SHUTTLE_URL = `/retreat/${SLUG}/shuttle-bus`;

const retreatPost = (r: Request) =>
  r.method() === "POST" && /\/api\/v1\/retreat\/[^/]+\/registration$/.test(r.url());
const busPost = (r: Request) =>
  r.method() === "POST" && r.url().includes("/shuttle-bus/register");

// 폼이 백엔드로 보내는 실제 payload 가 정확한지 검증한다 (응답 모킹만으로는 못 잡는 부분).
test.describe("등록 제출 payload 정확성", () => {
  test.beforeEach(async ({ page }) => {
    await mockRetreatApi(page, { open: true });
  });

  test("수양회 전참(userType none) payload", async ({ page }) => {
    await page.goto(RETREAT_URL);
    await fillRetreatRequired(page); // 1부 사랑부 / 1학년 예수마을(11) / 홍길동 / 이조원 / 남 / 전참

    const reqP = page.waitForRequest(retreatPost);
    await page.getByRole("button", { name: "수양회 신청하기" }).click();
    await confirmRetreatModal(page);
    const body = (await reqP).postDataJSON();

    expect(body.name).toBe("이조원");
    expect(body.phoneNumber).toBe("010-1234-5678");
    expect(body.gender).toBe("MALE");
    expect(body.gradeId).toBe(11); // gradeNumber(1) 가 아니라 gradeId(11)
    expect(body.retreatId).toBe(1);
    expect(body.currentLeaderName).toBe("홍길동");
    expect(body.userType).toBeNull(); // 해당 없음 → null
    expect([...body.retreatRegistrationScheduleIds].sort((a, b) => a - b)).toEqual([
      101, 102, 103, 104, 105,
    ]);
  });

  test("수양회 이름 앞뒤 공백은 trim 되어 전송된다", async ({ page }) => {
    await page.goto(RETREAT_URL);
    await fillRetreatRequired(page, { name: "  이조원  " });

    const reqP = page.waitForRequest(retreatPost);
    await page.getByRole("button", { name: "수양회 신청하기" }).click();
    await confirmRetreatModal(page);
    const body = (await reqP).postDataJSON();

    expect(body.name).toBe("이조원");
  });

  test("새가족(NEW_COMER) 선택 시 userType 가 전송된다", async ({ page }) => {
    await page.goto(RETREAT_URL);
    await fillRetreatRequired(page);
    await page.locator('label[for="userType-newcomer"]').click();

    const reqP = page.waitForRequest(retreatPost);
    await page.getByRole("button", { name: "수양회 신청하기" }).click();
    await confirmRetreatModal(page);
    const body = (await reqP).postDataJSON();

    expect(body.userType).toBe("NEW_COMER");
  });

  test("다른 부서/학년 선택 시 해당 gradeId 가 전송된다 (2부 소망부 1학년 소망마을=21)", async ({
    page,
  }) => {
    await page.goto(RETREAT_URL);
    await fillRetreatRequired(page, {
      univGroup: "2부 소망부",
      grade: "1학년 소망마을",
    });

    const reqP = page.waitForRequest(retreatPost);
    await page.getByRole("button", { name: "수양회 신청하기" }).click();
    await confirmRetreatModal(page);
    const body = (await reqP).postDataJSON();

    expect(body.gradeId).toBe(21);
  });

  test("일정 일부만 선택하면 그 일정 id 들만 전송된다", async ({ page }) => {
    await page.goto(RETREAT_URL);
    // 전참 없이 채우고, 체크박스 2개만 직접 선택
    await fillRetreatRequired(page, { allSchedule: false });
    const boxes = page.locator(".schedule-checkbox");
    await boxes.nth(0).click();
    await boxes.nth(1).click();

    const reqP = page.waitForRequest(retreatPost);
    await page.getByRole("button", { name: "수양회 신청하기" }).click();
    await confirmRetreatModal(page);
    const body = (await reqP).postDataJSON();

    expect(body.retreatRegistrationScheduleIds).toHaveLength(2);
    // 선택된 id 는 fixture schedule(101..105) 안의 값이어야 한다
    for (const id of body.retreatRegistrationScheduleIds) {
      expect([101, 102, 103, 104, 105]).toContain(id);
    }
  });

  test("셔틀버스 왕복(201,203) payload", async ({ page }) => {
    await page.goto(SHUTTLE_URL);
    await fillBusRequired(page, { busIds: [201, 203] });

    const reqP = page.waitForRequest(busPost);
    await page.getByRole("button", { name: /신청하기/ }).click();
    await expect(
      page.getByRole("heading", { name: "신청 정보 확인" })
    ).toBeVisible();
    await toggleCheckbox(page, "refundPolicyConsent");
    await page.getByRole("button", { name: "확인" }).click();
    const body = (await reqP).postDataJSON();

    expect(body.name).toBe("이조원");
    expect(body.gender).toBe("MALE");
    expect(body.gradeId).toBe(11);
    expect(body.retreatId).toBe(1);
    expect(body.isAdminContact).toBe(false);
    expect([...body.shuttleBusIds].sort((a, b) => a - b)).toEqual([201, 203]);
  });

  test("셔틀버스 편도(201) payload — 편도 확인 후 전송", async ({ page }) => {
    await page.goto(SHUTTLE_URL);
    await fillBusRequired(page, { busIds: [201] });

    const reqP = page.waitForRequest(busPost);
    await page.getByRole("button", { name: /신청하기/ }).click();
    await page.getByRole("button", { name: "예, 편도입니다" }).click();
    await expect(
      page.getByRole("heading", { name: "신청 정보 확인" })
    ).toBeVisible();
    await toggleCheckbox(page, "refundPolicyConsent");
    await page.getByRole("button", { name: "확인" }).click();
    const body = (await reqP).postDataJSON();

    expect(body.shuttleBusIds).toEqual([201]);
  });
});
