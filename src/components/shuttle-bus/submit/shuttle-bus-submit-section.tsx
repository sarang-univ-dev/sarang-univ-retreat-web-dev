"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShuttleBusSubmitButton } from "@/components/shuttle-bus/submit/shuttle-bus-submit-button";
import { OnewayConfirmModal } from "@/components/shuttle-bus/submit/oneway-confirm-modal";
import { ShuttleBusConfirmModal } from "@/components/shuttle-bus/submit/shuttle-bus-confirm-modal";
import { useShuttleBusInfoContext } from "@/components/shuttle-bus/shuttle-bus-info-context";
import { useShuttleBusTotalPrice } from "@/hooks/use-shuttle-bus-derived";
import { useShuttleBusRegistration } from "@/hooks/use-shuttle-bus-registration";
import { useRegistrationResultStore } from "@/store/registration-result-store";
import { getErrorMessage, logError } from "@/lib/error-handler";
import { SHUTTLE_BUS_FIELDS } from "@/schemas/registration";
import { scrollToFirstError } from "@/lib/scroll-to-error";

// 폼 시각 순서 — 제출 실패 시 이 순서로 첫 에러 필드를 찾아 스크롤한다.
// id 는 하드코딩이 아니라 SHUTTLE_BUS_FIELDS 상수를 참조한다.
const BUS_FIELD_ORDER = [
  SHUTTLE_BUS_FIELDS.privacyConsent,
  SHUTTLE_BUS_FIELDS.agreeShuttleOnly,
  SHUTTLE_BUS_FIELDS.univGroup,
  SHUTTLE_BUS_FIELDS.grade,
  SHUTTLE_BUS_FIELDS.name,
  SHUTTLE_BUS_FIELDS.gender,
  SHUTTLE_BUS_FIELDS.phoneNumber,
  SHUTTLE_BUS_FIELDS.shuttleBusIds,
];
import { useShuttleBusForm } from "@/hooks/use-shuttle-bus-form";

/**
 * 제출 버튼 + 편도/확인 모달 + 제출(mutation) 책임을 묶은 컴포넌트.
 * 부모(ShuttleBusRegistrationForm)는 mutation/제출 상태를 알지 못한다.
 */
export function ShuttleBusSubmitSection({ retreatSlug }: { retreatSlug: string }) {
  const router = useRouter();
  const { getValues, handleSubmit } = useShuttleBusForm();
  const { retreatData } = useShuttleBusInfoContext();
  const totalPrice = useShuttleBusTotalPrice();
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
      <ShuttleBusSubmitButton
        isSubmitting={isSubmitting}
        onClick={handleSubmit(onValid, (errors) =>
          scrollToFirstError(errors, BUS_FIELD_ORDER)
        )}
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
        <ShuttleBusConfirmModal
          open={showConfirmModal}
          isSubmitting={isSubmitting}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleConfirm}
        />
      )}
    </>
  );
}
