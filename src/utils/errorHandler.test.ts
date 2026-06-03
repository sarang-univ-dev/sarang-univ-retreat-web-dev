import { describe, it, expect, vi, afterEach } from "vitest";
import { HTTPError } from "ky";
import { getErrorMessage, logError } from "@/utils/errorHandler";
import type { NormalizedHTTPError } from "@/lib/ky";

/**
 * getErrorMessage 가 읽는 것은 error.response?.status 와 (우리 ky 훅이 붙이는)
 * serverMessage 뿐이다. 실제 fetch/Response 전역 없이도 동작하도록, 생성자가
 * 참조하는 최소 필드만 가진 객체를 Response/Request 로 캐스팅해 HTTPError 를 만든다.
 */
function makeHttpError(
  status: number,
  opts: { serverMessage?: string; url?: string } = {}
): HTTPError {
  const response = { status, statusText: "" } as unknown as Response;
  const request = { url: opts.url ?? "" } as unknown as Request;
  const err = new HTTPError(response, request, {} as never);
  if (opts.serverMessage) {
    (err as NormalizedHTTPError).serverMessage = opts.serverMessage;
  }
  return err;
}

describe("getErrorMessage", () => {
  it("서버가 내려준 메시지(serverMessage)를 최우선으로 반환한다", () => {
    expect(
      getErrorMessage(
        makeHttpError(400, { serverMessage: "정원이 초과되었습니다" })
      )
    ).toBe("정원이 초과되었습니다");
  });

  it.each([
    [400, "잘못된 요청입니다."],
    [401, "인증이 필요합니다."],
    [403, "접근 권한이 없습니다."],
    [404, "요청한 정보를 찾을 수 없습니다."],
    [409, "요청이 현재 서버의 상태와 충돌합니다."],
    [500, "서버 오류가 발생했습니다."],
  ])("serverMessage 가 없으면 상태 %i → '%s'", (status, expected) => {
    expect(getErrorMessage(makeHttpError(status as number))).toBe(expected);
  });

  it("매핑되지 않은 상태는 HTTPError.message 로 폴백한다", () => {
    const msg = getErrorMessage(makeHttpError(418));
    expect(typeof msg).toBe("string");
    expect(msg.length).toBeGreaterThan(0);
    expect(msg).not.toBe("알 수 없는 오류가 발생했습니다.");
  });

  it("일반 Error 는 그 message 를 반환한다", () => {
    expect(getErrorMessage(new Error("네트워크 실패"))).toBe("네트워크 실패");
  });

  it.each([undefined, null, "문자열", 42, {}])(
    "Error 가 아닌 값은 알 수 없는 오류 메시지",
    (v) => {
      expect(getErrorMessage(v)).toBe("알 수 없는 오류가 발생했습니다.");
    }
  );
});

describe("logError", () => {
  afterEach(() => vi.restoreAllMocks());

  it("HTTPError 에 대해 throw 하지 않는다", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() =>
      logError(makeHttpError(500, { url: "http://x/api" }), "ctx")
    ).not.toThrow();
    expect(spy).toHaveBeenCalled();
  });

  it("일반 에러에 대해서도 throw 하지 않는다", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => logError(new Error("boom"))).not.toThrow();
    expect(() => logError("그냥 문자열")).not.toThrow();
  });
});
