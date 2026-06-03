"use client";

import type React from "react";
import { createContext, useContext } from "react";
import type { RetreatInfo, ShuttleBusInfo } from "@/types";

/**
 * 폼 필드 상태는 react-hook-form 의 FormProvider 가 담당한다.
 * 이 컨텍스트는 필드가 아닌, 서버에서 받아온 정적 입력 데이터만 좁게 공유한다:
 *  - retreatData : 부서/학년 정적 데이터
 *  - busData     : 셔틀버스 정적 데이터
 *
 * 파생 값(busesByDate / availableGrades / isPartialParticipation / totalPrice)은
 * 여기서 계산하지 않고, 실제로 사용하는 자식에서 직접 계산한다.
 */
export interface ShuttleInfoContextValue {
  retreatData: RetreatInfo;
  busData: ShuttleBusInfo;
}

const ShuttleInfoContext = createContext<ShuttleInfoContextValue | null>(null);

export function ShuttleInfoProvider({
  value,
  children,
}: {
  value: ShuttleInfoContextValue;
  children: React.ReactNode;
}) {
  return (
    <ShuttleInfoContext.Provider value={value}>
      {children}
    </ShuttleInfoContext.Provider>
  );
}

export function useShuttleInfoContext(): ShuttleInfoContextValue {
  const ctx = useContext(ShuttleInfoContext);
  if (!ctx) {
    throw new Error(
      "useShuttleInfoContext must be used within a ShuttleInfoProvider"
    );
  }
  return ctx;
}
