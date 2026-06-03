import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { retreatRegistrationSchema } from "@/schemas/registration";
import type { z } from "zod";

type RetreatFormValues = z.input<typeof retreatRegistrationSchema>;

interface RetreatConfirmModalProps {
  open: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function RetreatConfirmModal({
  open,
  isSubmitting,
  onClose,
  onConfirm,
}: RetreatConfirmModalProps) {
  const { getValues } = useFormContext<RetreatFormValues>();
  const { name, phoneNumber } = getValues();

  const [scheduleChangeConsent, setScheduleChangeConsent] = useState(false);
  const [refundPolicyConsent, setRefundPolicyConsent] = useState(false);
  const [modalErrors, setModalErrors] = useState({
    scheduleChangeConsent: "",
    refundPolicyConsent: "",
  });

  if (!open) return null;

  const handleConfirm = () => {
    const errors = {
      scheduleChangeConsent: "",
      refundPolicyConsent: "",
    };
    let isValid = true;

    if (!scheduleChangeConsent) {
      errors.scheduleChangeConsent = "해당 내용을 읽고 체크박스에 체크해주세요";
      isValid = false;
    }

    if (!refundPolicyConsent) {
      errors.refundPolicyConsent = "해당 내용을 읽고 체크박스에 체크해주세요";
      isValid = false;
    }

    setModalErrors(errors);

    if (!isValid) {
      return;
    }

    onConfirm();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
        <h3 className="text-lg font-bold mb-4">신청 정보 확인</h3>
        <div className="space-y-2 mb-4">
          <p>
            <span className="font-medium">이름:</span> {name}
          </p>
          <p>
            <span className="font-medium">전화번호:</span> {phoneNumber}
          </p>
        </div>

        <p className="text-sm text-muted-foreground mb-4 whitespace-normal break-keep wrap-break-word">
          위 정보가 정확한지 확인해주세요. 신청 후에는 수정이 어렵습니다.
        </p>

        <div className="space-y-4 mb-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="scheduleChangeConsent"
                checked={scheduleChangeConsent}
                onCheckedChange={(checked) =>
                  setScheduleChangeConsent(checked as boolean)
                }
              />
              <label
                htmlFor="scheduleChangeConsent"
                className="text-sm font-medium leading-none whitespace-normal break-keep wrap-break-word"
              >
                일정 변동 등 문의는 각 부서 행정간사님에게 해주시기
                바랍니다.
              </label>
            </div>
            {modalErrors.scheduleChangeConsent && (
              <p className="text-red-500 text-sm ml-6">
                {modalErrors.scheduleChangeConsent}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="refundPolicyConsent"
                checked={refundPolicyConsent}
                onCheckedChange={(checked) =>
                  setRefundPolicyConsent(checked as boolean)
                }
              />
              <label
                htmlFor="refundPolicyConsent"
                className="text-sm font-medium leading-none whitespace-normal break-keep wrap-break-word"
              >
                수양회 등록비 환불 불가에 동의합니다.
              </label>
            </div>
            {modalErrors.refundPolicyConsent && (
              <p className="text-red-500 text-sm ml-6">
                {modalErrors.refundPolicyConsent}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span>처리 중...</span>
                <svg
                  className="ml-2 h-4 w-4 animate-spin"
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
              </>
            ) : (
              "확인"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
