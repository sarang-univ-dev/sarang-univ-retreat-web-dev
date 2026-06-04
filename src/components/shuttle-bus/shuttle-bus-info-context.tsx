"use client";

import type React from "react";
import { createContext, useContext } from "react";
import type { RetreatInfo, ShuttleBusInfo } from "@/types";

/**
 * 폼 필드 상태는 react-hook-form 의 FormProvider 가 담당한다.
 * 이 컨텍스트는 필드가 아닌, 서버에서 받아온 정적 입력 데이터만 좁게 공유한다:
 *  - retreatData : 부서/학년 정적 데이터
 *  - shuttleBusData     : 셔틀버스 정적 데이터
 *
 * 파생 값(busesByDate / availableGrades / isPartialParticipation / totalPrice)은
 * 여기서 계산하지 않고, 실제로 사용하는 자식에서 직접 계산한다.
 */
export interface ShuttleBusInfoContextValue {
  retreatData: RetreatInfo;
  shuttleBusData: ShuttleBusInfo;
}

const ShuttleBusInfoContext = createContext<ShuttleBusInfoContextValue | null>(null);

export function ShuttleBusInfoProvider({
  value,
  children,
}: {
  value: ShuttleBusInfoContextValue;
  children: React.ReactNode;
}) {
  return (
    <ShuttleBusInfoContext.Provider value={value}>
      {children}
    </ShuttleBusInfoContext.Provider>
  );
}

export function useShuttleBusInfoContext(): ShuttleBusInfoContextValue {
  const ctx = useContext(ShuttleBusInfoContext);
  if (!ctx) {
    throw new Error(
      "useShuttleBusInfoContext must be used within a ShuttleBusInfoProvider"
    );
  }
  return ctx;
}
