import { create } from "zustand";

/**
 * 등록 제출 → 완료/실패 페이지로 넘기는 "staging" 데이터의 단일 출처.
 *
 * 폼과 완료/실패 페이지는 별도 라우트라 라우트 간 브리지가 필요하다. 클라이언트
 * 네비게이션은 같은 JS 컨텍스트이므로 **인메모리 전역 상태로 충분**하다(localStorage
 * /sessionStorage 영속 불필요). 새로고침 등으로 상태가 비면 완료/실패 페이지는
 * 첫 신청 페이지로 리다이렉트한다 — 의도된 동작.
 */

export interface RetreatRegistrationResult {
  name: string;
  gender: string;
  phoneNumber: string;
  price: number | string;
  userType: string | null;
  univGroup: string | number;
  gradeId: number;
  registrationType: string;
}

export interface ShuttleBusRegistrationResult {
  name: string;
  phoneNumber: string;
  gender: string;
  gradeId: number;
  gradeNumber?: number;
  retreatId: number;
  shuttleBusIds: number[];
  isAdminContact: boolean;
  totalPrice: number;
  univGroup?: number;
}

export interface RegistrationFailureResult {
  errorMessage: string;
  timestamp: string;
  retreatName: string;
  registrationType: string;
}

interface RegistrationResultState {
  retreatResult: RetreatRegistrationResult | null;
  shuttleBusResult: ShuttleBusRegistrationResult | null;
  failure: RegistrationFailureResult | null;
  setRetreatResult: (result: RetreatRegistrationResult) => void;
  setShuttleBusResult: (result: ShuttleBusRegistrationResult) => void;
  setFailure: (failure: RegistrationFailureResult) => void;
  clearRetreatResult: () => void;
  clearShuttleBusResult: () => void;
  clearFailure: () => void;
}

export const useRegistrationResultStore = create<RegistrationResultState>(
  (set) => ({
    retreatResult: null,
    shuttleBusResult: null,
    failure: null,
    setRetreatResult: (retreatResult) => set({ retreatResult }),
    setShuttleBusResult: (shuttleBusResult) => set({ shuttleBusResult }),
    setFailure: (failure) => set({ failure }),
    clearRetreatResult: () => set({ retreatResult: null }),
    clearShuttleBusResult: () => set({ shuttleBusResult: null }),
    clearFailure: () => set({ failure: null }),
  })
);
