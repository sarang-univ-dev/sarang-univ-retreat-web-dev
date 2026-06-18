/**
 * 입력 중인 전화번호를 010-xxxx-xxxx 형태로 포맷한다.
 * 숫자 이외의 문자는 제거하고 최대 11자리(010 + 8자리)까지만 사용한다.
 * react-hook-form / controlled input 의 onChange 에서 호출해 입력값을 정규화한다.
 */
export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 3) {
    return digits;
  }
  if (digits.length <= 7) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  }
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}
