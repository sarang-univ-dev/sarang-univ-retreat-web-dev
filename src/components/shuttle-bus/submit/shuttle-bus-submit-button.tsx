import { Button } from "@/components/ui/button";
import { useShuttleBusTotalPrice } from "@/hooks/use-shuttle-bus-derived";

interface ShuttleBusSubmitButtonProps {
  isSubmitting: boolean;
  onClick: () => void;
}

// 필수 입력(이름/전화/버스 선택)은 zod 가 검증하고, 미충족 시 scrollToFirstError 가
// 해당 필드로 안내한다. 따라서 버튼은 제출 중에만 비활성화한다(수양회 CTA 와 동일).
export function ShuttleBusSubmitButton({
  isSubmitting,
  onClick,
}: ShuttleBusSubmitButtonProps) {
  const totalPrice = useShuttleBusTotalPrice();

  return (
    <Button
      type="button"
      onClick={onClick}
      className="w-full text-md flex items-center justify-center"
      disabled={isSubmitting}
    >
      <span>신청하기 ({totalPrice.toLocaleString()}원)</span>
      {isSubmitting && (
        <svg
          className="ml-2 h-5 w-5 animate-spin text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          ></path>
        </svg>
      )}
    </Button>
  );
}
