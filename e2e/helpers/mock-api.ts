import type { Page } from "@playwright/test";
import {
  openPeriodRetreatInfo,
  closedPeriodRetreatInfo,
  shuttleBusInfo,
  univGroupInfoResponse,
} from "../fixtures/retreat";

type RetreatMock = {
  open?: boolean;
  shuttleBus?: boolean;
  univGroupInfo?: boolean;
  registerStatus?: number;
  registerError?: string;
  busRegisterStatus?: number;
  busRegisterError?: string;
  /** GET /info 응답 상태 (기본 200). 비 2xx 면 페이지가 에러 상태가 된다. */
  infoStatus?: number;
};

/**
 * 백엔드 API를 Playwright route로 모킹한다. 실제 서버 없이 결정적 E2E 가능.
 * 엔드포인트는 main 코드가 실제 호출하는 경로와 일치한다:
 *  - GET  /api/v1/retreat/:slug/info               -> { retreatInfo }
 *  - GET  /api/v1/retreat/:slug/shuttle-bus/info   -> { shuttleBusInfo }
 *  - GET  /api/v1/retreat/:slug/univ-group-info    -> { retreatUnivGroup }
 *  - POST /api/v1/retreat/:slug/registration       (수양회 등록)
 *  - POST /api/v1/retreat/:slug/shuttle-bus/register (셔틀버스 등록)
 */
export async function mockRetreatApi(page: Page, options: RetreatMock = {}) {
  const {
    open = true,
    shuttleBus = true,
    univGroupInfo = true,
    registerStatus = 200,
    registerError,
    busRegisterStatus = 200,
    busRegisterError,
    infoStatus = 200,
  } = options;

  // shuttle-bus/info 가 /info glob 에 먼저 잡히지 않도록 더 구체적인 라우트를 먼저 등록한다.
  if (shuttleBus) {
    await page.route("**/api/v1/retreat/*/shuttle-bus/info", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ shuttleBusInfo }),
      });
    });
  }

  await page.route("**/api/v1/retreat/*/shuttle-bus/register", async (route) => {
    if (route.request().method() !== "POST") return route.fallback();
    if (busRegisterStatus >= 200 && busRegisterStatus < 400) {
      return route.fulfill({
        status: busRegisterStatus,
        contentType: "application/json",
        body: JSON.stringify({ ok: true }),
      });
    }
    return route.fulfill({
      status: busRegisterStatus,
      contentType: "application/json",
      body: JSON.stringify({ message: busRegisterError ?? "등록 실패" }),
    });
  });

  if (univGroupInfo) {
    await page.route("**/api/v1/retreat/*/univ-group-info", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(univGroupInfoResponse),
      });
    });
  }

  await page.route("**/api/v1/retreat/*/registration", async (route) => {
    if (route.request().method() !== "POST") return route.fallback();
    if (registerStatus >= 200 && registerStatus < 400) {
      return route.fulfill({
        status: registerStatus,
        contentType: "application/json",
        body: JSON.stringify({ ok: true }),
      });
    }
    return route.fulfill({
      status: registerStatus,
      contentType: "application/json",
      body: JSON.stringify({ message: registerError ?? "등록 실패" }),
    });
  });

  // 가장 일반적인 /info 는 마지막에 등록 (덜 구체적인 glob).
  await page.route("**/api/v1/retreat/*/info", async (route) => {
    if (infoStatus >= 200 && infoStatus < 400) {
      return route.fulfill({
        status: infoStatus,
        contentType: "application/json",
        body: JSON.stringify({
          retreatInfo: open ? openPeriodRetreatInfo : closedPeriodRetreatInfo,
        }),
      });
    }
    return route.fulfill({
      status: infoStatus,
      contentType: "application/json",
      body: JSON.stringify({ message: "정보를 불러오지 못했습니다" }),
    });
  });
}
