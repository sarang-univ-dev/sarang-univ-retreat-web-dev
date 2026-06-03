"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RetreatConfirmModal } from "@/components/retreat/submit/retreat-confirm-modal";
import { useRetreatInfoContext } from "@/components/retreat/retreat-info-context";
import {
  useAvailableGrades,
  useRetreatPrice,
} from "@/hooks/use-retreat-derived";
import { useRetreatRegistration } from "@/hooks/use-registration";
import { useRegistrationResultStore } from "@/store/registration-result-store";
import { getErrorMessage, logError } from "@/lib/error-handler";
import { useRetreatForm } from "@/hooks/use-registration-form";

/**
 * 제출 버튼 + 확인 모달 + 제출(mutation) 책임을 한곳에 묶은 컴포넌트.
 * 부모(RetreatRegistrationForm)는 mutation/제출 상태를 알지 못한다.
 */
export function RetreatSubmitSection({ retreatSlug }: { retreatSlug: string }) {
  const router = useRouter();
  const { handleSubmit, getValues } = useRetreatForm();
  const { retreatData } = useRetreatInfoContext();
  const { totalPrice } = useRetreatPrice();
  const availableGrades = useAvailableGrades();
  const setRetreatResult = useRegistrationResultStore(
    (s) => s.setRetreatResult
  );
  const setFailure = useRegistrationResultStore((s) => s.setFailure);

  const registration = useRetreatRegistration(retreatSlug);
  const isSubmitting = registration.isPending;
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleConfirm = () => {
    const values = getValues();
    setShowConfirmModal(false);

    const gradeNumber =
      availableGrades.find((g) => g.gradeId.toString() === values.grade)
        ?.gradeNumber ?? 0;

    const submissionData = {
      name: values.name.trim(),
      phoneNumber: values.phoneNumber,
      gender: values.gender,
      gradeId: Number(values.grade),
      retreatId: retreatData.retreat.id,
      currentLeaderName: values.currentLeaderName.trim(),
      retreatRegistrationScheduleIds: values.scheduleSelection,
      userType: values.userType,
    };

    registration.mutate(submissionData, {
      onSuccess: () => {
        setRetreatResult({
          name: values.name,
          gender: values.gender,
          phoneNumber: values.phoneNumber,
          price:
            values.userType === "NEW_COMER" || values.userType === "SOLDIER"
              ? "입금 대기"
              : totalPrice,
          userType: values.userType,
          univGroup: values.univGroup,
          gradeId: gradeNumber,
          registrationType: "retreat-registration",
        });
        router.push(`/retreat/${retreatSlug}/registration-success`);
      },
      onError: (error) => {
        logError(error, "retreat-registration");
        setFailure({
          errorMessage: getErrorMessage(error),
          timestamp: new Date().toISOString(),
          retreatName: retreatData.retreat.name,
          registrationType: "retreat-registration",
        });
        router.push(`/retreat/${retreatSlug}/registration-failure`);
      },
    });
  };

  return (
    <>
      <Button
        type="button"
        onClick={handleSubmit(() => setShowConfirmModal(true))}
        className="w-full text-md flex items-center justify-center"
        disabled={isSubmitting}
      >
        <span>수양회 신청하기</span>
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
      {showConfirmModal && (
        <RetreatConfirmModal
          open={showConfirmModal}
          isSubmitting={isSubmitting}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleConfirm}
        />
      )}
    </>
  );
}
