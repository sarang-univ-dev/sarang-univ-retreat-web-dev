"use client";

import { useMemo } from "react";
import { useShuttleBusInfoContext } from "@/components/shuttle-bus/shuttle-bus-info-context";
import { useShuttleBusForm } from "@/hooks/use-shuttle-bus-form";

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
