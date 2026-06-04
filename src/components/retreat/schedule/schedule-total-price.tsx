import { useRetreatPrice } from "@/hooks/use-retreat-derived";
import { useRetreatForm } from "@/hooks/use-retreat-form";

/**
 * 선택한 일정/유형에 따른 총금액.
 * 새가족·현역 군지체는 실제 금액이 관리자 확인 후 확정되므로 "예상 총금액"으로
 * 추정치를 보여준다(이전엔 "입금 대기"로 금액을 숨겼음).
 */
export function ScheduleTotalPrice() {
  const { totalPrice } = useRetreatPrice();
  const { watch } = useRetreatForm();
  const userType = watch("userType");
  const isEstimate = userType === "NEW_COMER" || userType === "SOLDIER";

  return (
    <div className="mt-4 text-right">
      <p className="font-bold">
        {isEstimate ? "예상 총금액" : "총금액"}: {totalPrice.toLocaleString()}원
      </p>
    </div>
  );
}
