"use client";

import { useMemo } from "react";
import { useRetreatInfoContext } from "@/components/forms/retreat/retreat-info-context";
import { useRetreatForm } from "@/hooks/use-registration-form";
import type { RetreatInfo, TRetreatRegistrationSchedule } from "@/types";

/**
 * watch("univGroup") 에서 파생되는 학년 목록.
 * 학년 Select(basic-info-fields) 와 제출 시 gradeNumber 조회(submit-section)
 * 등 여러 소비자가 동일하게 사용하므로 공유 훅으로 둔다.
 */
export function useAvailableGrades(): RetreatInfo["univGroupAndGrade"][number]["grades"] {
  const { retreatData } = useRetreatInfoContext();
  const { watch } = useRetreatForm();
  const univGroup = watch("univGroup");

  return useMemo(() => {
    const selectedGroup = retreatData.univGroupAndGrade.find(
      (group) => group.univGroupId.toString() === univGroup
    );
    return selectedGroup ? selectedGroup.grades : [];
  }, [retreatData.univGroupAndGrade, univGroup]);
}

/**
 * scheduleSelection 이 전체 일정을 덮는지 여부.
 */
export function useIsAllScheduleSelected(): boolean {
  const { retreatData } = useRetreatInfoContext();
  const { watch } = useRetreatForm();
  const scheduleSelection = watch("scheduleSelection");

  return (
    retreatData.schedule.length > 0 &&
    scheduleSelection.length === retreatData.schedule.length
  );
}

/**
 * 선택된 학년의 gradeNumber (없으면 0). 1학년 여부 판정 등에 사용.
 */
export function useGradeNumber(): number {
  const { watch } = useRetreatForm();
  const grade = watch("grade");
  const availableGrades = useAvailableGrades();
  return useMemo(
    () =>
      availableGrades.find((g) => g.gradeId.toString() === grade)
        ?.gradeNumber ?? 0,
    [availableGrades, grade]
  );
}

/**
 * watch("scheduleSelection") + payment 에서 파생되는 총금액.
 * 새가족/현역 군지체/1학년은 가장 이른(early-bird) payment 를 적용하고, 그 외는
 * 현재 진행 중인 기간(없으면 가장 늦은 기간)을 적용한다. (할인/정가 표시는 없음)
 */
export function useRetreatPrice(): { totalPrice: number } {
  const { retreatData } = useRetreatInfoContext();
  const { watch } = useRetreatForm();
  const scheduleSelection = watch("scheduleSelection");
  const userType = watch("userType");
  const gradeNumber = useGradeNumber();
  const isAllScheduleSelected = useIsAllScheduleSelected();

  return useMemo(() => {
    // 적용 payment: 새가족/현역 군지체/1학년 → 가장 이른(early-bird) 기간,
    // 그 외 → 현재 진행 중(없으면 가장 늦은) 기간.
    const findApplicablePayment = () => {
      const usesEarliestPayment =
        userType === "NEW_COMER" || userType === "SOLDIER" || gradeNumber === 1;

      if (usesEarliestPayment) {
        return retreatData.payment.reduce((earliest, current) =>
          new Date(current.startAt) < new Date(earliest.startAt)
            ? current
            : earliest
        );
      }

      const now = new Date();
      const validPayment = retreatData.payment.find(
        (p) => new Date(p.startAt) <= now && new Date(p.endAt) >= now
      );
      if (validPayment) return validPayment;
      return retreatData.payment.reduce((latest, current) =>
        new Date(current.endAt) > new Date(latest.endAt) ? current : latest
      );
    };

    const payment = findApplicablePayment();

    if (isAllScheduleSelected) {
      return { totalPrice: payment.totalPrice };
    }

    const eventCount = retreatData.schedule.filter(
      (schedule: TRetreatRegistrationSchedule) =>
        scheduleSelection.includes(schedule.id)
    ).length;
    return {
      totalPrice: Math.min(
        eventCount * payment.partialPricePerSchedule,
        payment.totalPrice
      ),
    };
  }, [
    userType,
    gradeNumber,
    scheduleSelection,
    isAllScheduleSelected,
    retreatData.payment,
    retreatData.schedule,
  ]);
}
