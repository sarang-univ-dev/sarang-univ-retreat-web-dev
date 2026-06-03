import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useBusTotalPrice } from "@/components/forms/use-bus-derived";
import { busRegistrationSchema } from "@/schemas/registration";
import type { z } from "zod";

type BusFormValues = z.input<typeof busRegistrationSchema>;

interface BusSubmitButtonProps {
  isSubmitting: boolean;
  onClick: () => void;
}

// 전화번호 유효성 체크 (버튼 활성화용, 기존 느슨한 정규식 그대로)
const isValidPhoneNumber = (phone: string) => {
  const phoneRegex = /^\d{3}-\d{4}-\d{4}$/;
  return phoneRegex.test(phone);
};

export function BusSubmitButton({
  isSubmitting,
  onClick,
}: BusSubmitButtonProps) {
  const { watch } = useFormContext<BusFormValues>();
  const name = watch("name");
  const phoneNumber = watch("phoneNumber");
  const shuttleBusIds = watch("shuttleBusIds");
  const isAdminContact = watch("isAdminContact");
  const totalPrice = useBusTotalPrice();

  return (
    <Button
      type="button"
      onClick={onClick}
      className="w-full text-md flex items-center justify-center"
      disabled={
        (!isAdminContact && shuttleBusIds.length === 0) ||
        !name.trim() ||
        !phoneNumber.trim() ||
        !isValidPhoneNumber(phoneNumber) ||
        isSubmitting
      }
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
