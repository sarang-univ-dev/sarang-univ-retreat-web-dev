import type { FieldErrors, FieldValues } from "react-hook-form";

/**
 * 에러 필드를 화면 최상단에 딱 붙이지 않고, 위쪽으로 이만큼(px) 여유를 두고
 * 배치한다. 값이 클수록 필드가 화면에서 더 아래쪽에 위치한다.
 */
const VIEWPORT_TOP_OFFSET = 120;

/**
 * '신청하기' 제출 시 유효성 검사에 실패한 **첫 번째** 필드로 부드럽게 스크롤하고
 * 포커스를 옮긴다. (RHF handleSubmit 의 onInvalid 콜백에서 호출)
 *
 * fieldOrder 는 폼의 시각적 순서. 각 필드는 동일한 id(또는 name)를 가진
 * 엘리먼트로 매핑된다 — Select 트리거/입력/체크박스에 RHF name 과 같은 id 가 부여돼 있다.
 */
export function scrollToFirstError<T extends FieldValues>(
  errors: FieldErrors<T>,
  fieldOrder: string[]
): void {
  const first = fieldOrder.find(
    (name) => errors[name as keyof FieldErrors<T>]
  );
  if (!first) return;

  const el =
    document.getElementById(first) ??
    document.querySelector<HTMLElement>(`[name="${first}"]`);
  if (!el) return;

  // 화면 상단에서 VIEWPORT_TOP_OFFSET 만큼 아래에 오도록 스크롤.
  const top =
    el.getBoundingClientRect().top + window.scrollY - VIEWPORT_TOP_OFFSET;
  window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });

  // 스크롤과 별개로 포커스(추가 점프 방지).
  if (typeof el.focus === "function") {
    el.focus({ preventScroll: true });
  }
}
