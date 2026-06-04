import type { FieldErrors, FieldValues } from "react-hook-form";

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

  // 해당 필드가 화면 '상단'에 오도록 스크롤(약간의 여백 포함).
  el.style.scrollMarginTop = "16px";
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  // scrollIntoView 가 진행되는 동안 추가 점프가 생기지 않도록 preventScroll.
  if (typeof el.focus === "function") {
    el.focus({ preventScroll: true });
  }
}
