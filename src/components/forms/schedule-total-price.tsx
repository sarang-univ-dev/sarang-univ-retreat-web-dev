import { useRetreatPrice } from "@/components/forms/use-retreat-derived";
import { useRetreatForm } from "@/hooks/use-registration-form";

/** 선택한 일정/유형에 따른 총금액. 새가족·현역 군지체는 "입금 대기". */
export function ScheduleTotalPrice() {
  const { totalPrice } = useRetreatPrice();
  const { watch } = useRetreatForm();
  const userType = watch("userType");

  return (
    <div className="mt-4 text-right">
      <p className="font-bold">
        총금액:{" "}
        {userType === "NEW_COMER" || userType === "SOLDIER"
          ? "입금 대기"
          : `${totalPrice.toLocaleString()}원`}
      </p>
    </div>
  );
}
