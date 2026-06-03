/**
 * 런타임/빌드 타임 환경 변수 단일 진입점.
 * ky 클라이언트의 prefixUrl 기본값(http://localhost:4000)으로 쓰인다.
 */
export const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:4000";

export const IS_E2E = process.env.NEXT_PUBLIC_E2E === "true";
