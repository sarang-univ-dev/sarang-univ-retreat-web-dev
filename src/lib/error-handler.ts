import { HTTPError } from "ky";
import type { NormalizedHTTPError } from "@/lib/ky";

/**
 * HTTP 상태 코드별 한국어 메시지.
 */
function statusMessage(status?: number): string | undefined {
  switch (status) {
    case 400:
      return "잘못된 요청입니다.";
    case 401:
      return "인증이 필요합니다.";
    case 403:
      return "접근 권한이 없습니다.";
    case 404:
      return "요청한 정보를 찾을 수 없습니다.";
    case 409:
      return "요청이 현재 서버의 상태와 충돌합니다.";
    case 500:
      return "서버 오류가 발생했습니다.";
    default:
      return undefined;
  }
}

/**
 * 에러 메시지를 추출하는 함수.
 * 데이터 패칭은 전부 ky 를 사용하므로 HTTPError 를 우선 처리한다.
 * @param error - 발생한 에러
 * @returns 적절한 에러 메시지
 */
export function getErrorMessage(error: unknown): string {
  // ky HTTPError (서버 응답이 비 2xx)
  if (error instanceof HTTPError) {
    const serverMessage = (error as NormalizedHTTPError).serverMessage;
    if (serverMessage) {
      return serverMessage;
    }
    const byStatus = statusMessage(error.response?.status);
    if (byStatus) {
      return byStatus;
    }
    return error.message || "데이터를 불러오는 데 실패했습니다.";
  }

  // 네트워크 오류 등 일반 Error (ky 는 네트워크 실패 시 TypeError 를 던진다)
  if (error instanceof Error) {
    return error.message || "예상치 못한 오류가 발생했습니다.";
  }

  // 기타 타입의 에러
  return "알 수 없는 오류가 발생했습니다.";
}

/**
 * 에러를 로깅하는 함수.
 * @param error - 발생한 에러
 * @param context - 에러가 발생한 컨텍스트
 */
export function logError(error: unknown, context?: string): void {
  console.error(context ? `Error in ${context}:` : "Error:", error);

  if (error instanceof HTTPError) {
    console.error("Request URL:", error.request?.url);
    console.error("Status:", error.response?.status);
  }
}
