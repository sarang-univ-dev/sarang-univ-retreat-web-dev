import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useShuttleInfoContext } from "@/components/forms/shuttle/shuttle-info-context";
import { useBusTotalPrice } from "@/components/forms/shuttle/use-bus-derived";
import { useBusForm } from "@/hooks/use-registration-form";

interface BusConfirmModalProps {
  open: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function BusConfirmModal({
  open,
  isSubmitting,
  onClose,
  onConfirm,
}: BusConfirmModalProps) {
  const { busData } = useShuttleInfoContext();
  const totalPrice = useBusTotalPrice();
  const { getValues } = useBusForm();
  const { name, phoneNumber, shuttleBusIds } = getValues();
  const selectedBusIds = shuttleBusIds;
  const shuttleBuses = busData.shuttleBuses;

  const [refundPolicyConsent, setRefundPolicyConsent] = useState(false);
  const [modalError, setModalError] = useState({
    refundPolicyConsent: "",
  });

  if (!open) return null;

  const handleConfirm = () => {
    const errors = {
      refundPolicyConsent: "",
    };
    let isValid = true;

    if (!refundPolicyConsent) {
      errors.refundPolicyConsent = "해당 내용을 읽고 체크박스에 체크해주세요";
      isValid = false;
    }

    setModalError(errors);

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
            <span className="font-medium">전화번호:</span>{" "}
            {phoneNumber}
          </p>
          <p>
            <span className="font-medium">총 금액:</span>{" "}
            {totalPrice.toLocaleString()}원
          </p>
          <div>
            <span className="font-medium">선택한 버스 및 출발 시간:</span>
            <div className="mt-1 space-y-1">
              {selectedBusIds.map((busId) => {
                const bus = shuttleBuses.find(
                  (b) => b.id === busId
                );
                if (!bus) return null;

                const departureTime = bus.departureTime
                  ? new Date(bus.departureTime).toLocaleTimeString(
                      "ko-KR",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                        timeZone: "Asia/Seoul",
                      }
                    )
                  : "미정";

                return (
                  <p key={bus.id} className="text-sm text-gray-600">
                    {bus.name} ({departureTime})
                  </p>
                );
              })}
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4 whitespace-normal break-keep wrap-break-word">
          위 정보가 정확한지 확인해주세요. 신청 후에는 수정이 어렵습니다.
        </p>
        <div className="space-y-4 mb-4">
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
                셔틀 버스 환불은 불가함에 동의합니다.
              </label>
            </div>
            {modalError.refundPolicyConsent && (
              <p className="text-red-500 text-sm ml-6">
                {modalError.refundPolicyConsent}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
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
