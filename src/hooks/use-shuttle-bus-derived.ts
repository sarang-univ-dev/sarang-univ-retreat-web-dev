"use client";

import { useMemo } from "react";
import { useShuttleBusInfoContext } from "@/components/shuttle-bus/shuttle-bus-info-context";
import { useShuttleBusForm } from "@/hooks/use-shuttle-bus-form";
import type { RetreatInfo } from "@/types";

/**
 * watch("univGroup") 에서 파생되는 학년 목록.
 * 학년 Select(grade-field) 가 소비하며, retreat 폼의 useAvailableGrades 와
 * 같은 역할을 셔틀버스 폼 컨텍스트 기준으로 수행한다.
 */
export function useAvailableGrades(): RetreatInfo["univGroupAndGrade"][number]["grades"] {
  const { retreatData } = useShuttleBusInfoContext();
  const { watch } = useShuttleBusForm();
  const univGroup = watch("univGroup");

  return useMemo(() => {
    const selectedGroup = retreatData.univGroupAndGrade.find(
      (group) => group.univGroupId.toString() === univGroup
    );
    return selectedGroup ? selectedGroup.grades : [];
  }, [retreatData.univGroupAndGrade, univGroup]);
}

/**
 * 선택한 셔틀버스(watch("shuttleBusIds")) + shuttleBusData 로부터 총 금액을 계산한다.
 * 제출 버튼, 총 금액 카드, 정보 확인 모달, 부모의 handleConfirm 등
 * 여러 소비자가 동일하게 사용하므로 공유 훅으로 둔다.
 */
export function useShuttleBusTotalPrice(): number {
  const { shuttleBusData } = useShuttleBusInfoContext();
  const { watch } = useShuttleBusForm();
  const shuttleBusIds = watch("shuttleBusIds");

  return useMemo(() => {
    const buses = shuttleBusData.shuttleBuses;

    return shuttleBusIds.reduce((total, busId) => {
      const bus = buses.find((b) => b.id === busId);
      return total + (bus?.price || 0);
    }, 0);
  }, [shuttleBusIds, shuttleBusData]);
}
