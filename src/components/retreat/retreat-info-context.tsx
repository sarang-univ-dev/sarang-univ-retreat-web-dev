"use client";

import type React from "react";
import { createContext, useContext } from "react";
import type { RetreatInfo } from "@/types";

/**
 * 폼 필드 상태는 react-hook-form 의 FormProvider 가 담당한다.
 * 이 컨텍스트는 필드가 아닌, 서버에서 받아온 정적 입력 데이터만 좁게 공유한다:
 *  - retreatData : 부서/학년/일정/결제 정적 데이터
 *
 * 파생 값(availableGrades / isAllScheduleSelected / totalPrice /
 * retreatDatesForDisplay)은 여기서 계산하지 않고, 공유 훅
 * (use-retreat-derived) 혹은 실제로 사용하는 자식에서 직접 계산한다.
 */
export interface RetreatInfoContextValue {
  retreatData: RetreatInfo;
}

const RetreatInfoContext = createContext<RetreatInfoContextValue | null>(null);

export function RetreatInfoProvider({
  value,
  children,
}: {
  value: RetreatInfoContextValue;
  children: React.ReactNode;
}) {
  return (
    <RetreatInfoContext.Provider value={value}>
      {children}
    </RetreatInfoContext.Provider>
  );
}

export function useRetreatInfoContext(): RetreatInfoContextValue {
  const ctx = useContext(RetreatInfoContext);
  if (!ctx) {
    throw new Error(
      "useRetreatInfoContext must be used within a RetreatInfoProvider"
    );
  }
  return ctx;
}
