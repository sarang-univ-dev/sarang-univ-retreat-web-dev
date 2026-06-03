"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFormContext } from "react-hook-form";
import type { z } from "zod";
import { BusSubmitButton } from "@/components/forms/bus-submit-button";
import { OnewayConfirmModal } from "@/components/forms/oneway-confirm-modal";
import { BusConfirmModal } from "@/components/forms/bus-confirm-modal";
import { useBusData } from "@/components/forms/bus-derived-context";
import { useBusTotalPrice } from "@/components/forms/use-bus-derived";
import { useShuttleBusRegistration } from "@/hooks/use-registration";
import { useRegistrationResultStore } from "@/store/registration-result-store";
import { getErrorMessage, logError } from "@/utils/errorHandler";
import type { busRegistrationSchema } from "@/schemas/registration";

type BusFormValues = z.input<typeof busRegistrationSchema>;

/**
 * 제출 버튼 + 편도/확인 모달 + 제출(mutation) 책임을 묶은 컴포넌트.
 * 부모(BusRegistrationFormComponent)는 mutation/제출 상태를 알지 못한다.
 */
export function BusSubmitSection({ retreatSlug }: { retreatSlug: string }) {
  const router = useRouter();
  const { getValues, handleSubmit } = useFormContext<BusFormValues>();
  const { retreatData } = useBusData();
  const totalPrice = useBusTotalPrice();
  const setShuttleBusResult = useRegistrationResultStore(
    (s) => s.setShuttleBusResult
  );
  const setFailure = useRegistrationResultStore((s) => s.setFailure);

  const registration = useShuttleBusRegistration(retreatSlug);
  const isSubmitting = registration.isPending;
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showOneWayConfirmModal, setShowOneWayConfirmModal] = useState(false);

  const onValid = () => {
    // 버스 선택이 홀수면 편도 확인 모달 먼저 표시
    if (getValues("shuttleBusIds").length % 2 === 1) {
      setShowOneWayConfirmModal(true);
    } else {
      setShowConfirmModal(true);
    }
  };

  const handleConfirm = () => {
    setShowConfirmModal(false);
    const values = getValues();

    const submissionData = {
      name: values.name.trim(),
      phoneNumber: values.phoneNumber,
      gender: values.gender,
      gradeId: Number(values.grade),
      retreatId: retreatData.retreat.id,
      shuttleBusIds: values.shuttleBusIds,
      isAdminContact: values.isAdminContact,
    };

    const selectedGroup = retreatData.univGroupAndGrade.find(
      (group) => group.univGroupId.toString() === values.univGroup
    );
    const selectedGrade = selectedGroup?.grades.find(
      (grade) => grade.gradeId.toString() === values.grade
    );

    registration.mutate(submissionData, {
      onSuccess: () => {
        setShuttleBusResult({
          name: values.name,
          phoneNumber: values.phoneNumber,
          gender: values.gender,
          gradeId: Number(values.grade),
          gradeNumber: selectedGrade?.gradeNumber,
          retreatId: retreatData.retreat.id,
          shuttleBusIds: values.shuttleBusIds,
          isAdminContact: values.isAdminContact,
          totalPrice: totalPrice,
          univGroup: selectedGroup?.univGroupId,
        });
        router.push(`/retreat/${retreatSlug}/shuttle-bus-registration-success`);
      },
      onError: (error) => {
        logError(error, "bus-registration");
        setFailure({
          errorMessage: getErrorMessage(error),
          timestamp: new Date().toISOString(),
          retreatName: retreatData.retreat.name,
          registrationType: "bus-registration",
        });
        router.push(`/retreat/${retreatSlug}/registration-failure`);
      },
    });
  };

  return (
    <>
      <BusSubmitButton
        isSubmitting={isSubmitting}
        onClick={handleSubmit(onValid)}
      />

      {showOneWayConfirmModal && (
        <OnewayConfirmModal
          open={showOneWayConfirmModal}
          onClose={() => setShowOneWayConfirmModal(false)}
          onConfirm={() => {
            setShowOneWayConfirmModal(false);
            setShowConfirmModal(true);
          }}
        />
      )}

      {showConfirmModal && (
        <BusConfirmModal
          open={showConfirmModal}
          isSubmitting={isSubmitting}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleConfirm}
        />
      )}
    </>
  );
}
