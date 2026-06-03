"use client";

import type React from "react";
import { createContext, useContext } from "react";
import type { RetreatInfo, ShuttleBusInfo } from "@/types";

/**
 * 폼 필드 상태는 react-hook-form 의 FormProvider 가 담당한다.
 * 이 컨텍스트는 필드가 아닌 "정적 입력 데이터"만 좁게 공유한다:
 *  - retreatData : 부서/학년 정적 데이터
 *  - busData     : 셔틀버스 정적 데이터
 *
 * 파생 값(busesByDate / availableGrades / isPartialParticipation / totalPrice)은
 * 더 이상 여기서 계산하지 않고, 실제로 사용하는 자식에서 직접 계산한다.
 */
export interface BusDataContextValue {
  retreatData: RetreatInfo;
  busData: ShuttleBusInfo;
}

const BusDataContext = createContext<BusDataContextValue | null>(null);

export function BusDataProvider({
  value,
  children,
}: {
  value: BusDataContextValue;
  children: React.ReactNode;
}) {
  return (
    <BusDataContext.Provider value={value}>
      {children}
    </BusDataContext.Provider>
  );
}

export function useBusData(): BusDataContextValue {
  const ctx = useContext(BusDataContext);
  if (!ctx) {
    throw new Error("useBusData must be used within a BusDataProvider");
  }
  return ctx;
}
