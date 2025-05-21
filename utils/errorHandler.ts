import axios, { AxiosError } from "axios";

/**
 * 에러 메시지를 추출하는 함수
 * @param error - 발생한 에러
 * @returns 적절한 에러 메시지
 */
export function getErrorMessage(error: unknown): string {
  // Axios 에러 처리
  if (axios.isAxiosError(error)) {
    // 서버에서 반환한 에러 메시지가 있다면 사용
    if (error.response?.data?.message) {
      return error.response.data.message;
    }

    // 일반적인 에러 메시지
    if (error.response?.data?.error) {
      return error.response.data.error;
    }

    // HTTP 상태 코드별 메시지
    if (error.response?.status) {
      switch (error.response.status) {
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
      }
    }

    return error.message || "데이터를 불러오는 데 실패했습니다.";
  }
  // 일반적인 에러 처리
  else if (error instanceof Error) {
    return error.message || "예상치 못한 오류가 발생했습니다.";
  }
  // 기타 타입의 에러 처리
  else {
    return "알 수 없는 오류가 발생했습니다.";
  }
}

/**
 * 에러를 로깅하는 함수
 * @param error - 발생한 에러
 * @param context - 에러가 발생한 컨텍스트
 */
export function logError(error: unknown, context?: string): void {
  if (context) {
    console.error(`Error in ${context}:`, error);
  } else {
    console.error("Error:", error);
  }

  // 에러 세부 정보 로깅
  if (axios.isAxiosError(error)) {
    console.error("Request URL:", error.config?.url);
    console.error("Request Method:", error.config?.method);
    console.error("Status:", error.response?.status);
    console.error("Response data:", error.response?.data);
  }
}
