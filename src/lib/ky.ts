import ky, { HTTPError } from "ky";
import { SERVER_URL } from "@/config/env";

/**
 * 서버에서 내려준 에러 메시지를 HTTPError에 부착하기 위한 확장 필드.
 * getErrorMessage()가 동기적으로 읽을 수 있도록 beforeError 훅에서 채운다.
 */
export interface NormalizedHTTPError extends HTTPError {
  serverMessage?: string;
}

/**
 * 비 2xx 응답 body 의 message/error 를 error.serverMessage 로 정규화하는 beforeError 훅.
 * `api` 와 leader 전용 클라이언트(`leader-api.ts`)가 동일한 에러 정규화를 공유하도록 분리했다.
 */
export const normalizeServerError = async (error: HTTPError) => {
  const { response } = error;
  if (response) {
    try {
      const data = (await response.clone().json()) as {
        message?: string;
        error?: string;
      };
      const message = data?.message ?? data?.error;
      if (message) {
        (error as NormalizedHTTPError).serverMessage = message;
      }
    } catch {
      // JSON 이 아닌 응답이면 무시 (상태 코드 기반 메시지로 폴백)
    }
  }
  return error;
};

/**
 * 공용 ky 인스턴스. prefixUrl 기준이므로 호출 시 경로 앞에 "/" 를 붙이지 않는다.
 * 예) api.get(`api/v1/retreat/${slug}/info`)
 *
 * 기존 axios 동작과의 호환:
 *  - 최종 URL = SERVER_URL + "/" + path (axios baseURL + "/api/..." 와 동일)
 *  - 비 2xx 응답은 HTTPError로 throw (axios의 reject 동작과 동일)
 *  - 서버 응답 body 의 message/error 를 error.serverMessage 로 정규화
 */
export const api = ky.create({
  prefixUrl: SERVER_URL,
  retry: 0,
  hooks: {
    beforeError: [normalizeServerError],
  },
});

export { HTTPError };
