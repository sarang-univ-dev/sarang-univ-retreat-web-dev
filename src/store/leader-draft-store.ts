import { create } from "zustand";
import type { AttendanceStatus } from "@/services/leader";

/**
 * 리더 대시보드 로컬 드래프트 캐시.
 *
 * 리더가 휴대폰으로 출석/일정변경/보고를 입력하다가 제출 전에 새로고침하거나
 * 앱을 닫아도 입력값이 보존되도록 localStorage 에 영속한다.
 *
 * 키는 컨텍스트별로 분리: `leader-draft-v3:<slug>:<gbsId>:<today>`.
 * - 다른 GBS / 다른 날짜의 드래프트가 섞이지 않는다.
 * - "today" 는 서버(/today)에서만 받는다(클라이언트 계산 금지, timezone-safe).
 *
 * `persist` 미들웨어 대신 수동 직렬화를 쓰는 이유: 영속 키가 store 생성 시점이
 * 아니라 런타임(slug/gbsId/today)에 결정되기 때문. SSR 에서는 localStorage 가
 * 없으므로 모든 접근을 가드한다.
 */

export interface ScheduleChangeDraft {
  before: number[];
  after: number[];
  reason: string;
}

export interface LeaderDraft {
  /** userRetreatRegistrationId → 출석 상태 (미체크는 키 없음) */
  attendance: Record<number, AttendanceStatus | null>;
  /** userRetreatRegistrationId → 일정변경 드래프트 */
  scheduleChanges: Record<number, ScheduleChangeDraft>;
  graceSharing: string;
  prayerTopics: string;
}

interface LeaderDraftState {
  /** 현재 활성화된 드래프트 컨텍스트 키 (null = 미초기화) */
  key: string | null;
  draft: LeaderDraft;
  /** 컨텍스트(slug/gbsId/today)로 드래프트를 로드(없으면 빈 드래프트). */
  init: (slug: string, gbsId: number, today: string) => void;
  setAttendance: (id: number, status: AttendanceStatus | null) => void;
  setScheduleChange: (id: number, change: ScheduleChangeDraft) => void;
  clearScheduleChange: (id: number) => void;
  setGraceSharing: (value: string) => void;
  setPrayerTopics: (value: string) => void;
  /** 입력된 게 하나라도 있는지(제출 전 이탈 경고용). */
  hasUnsavedChanges: () => boolean;
  /** 제출 성공 후 드래프트 + 영속 데이터 비우기. */
  clear: () => void;
}

const emptyDraft = (): LeaderDraft => ({
  attendance: {},
  scheduleChanges: {},
  graceSharing: "",
  prayerTopics: "",
});

export function leaderDraftKey(
  slug: string,
  gbsId: number,
  today: string
): string {
  return `leader-draft-v3:${slug}:${gbsId}:${today}`;
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function loadDraft(key: string): LeaderDraft {
  if (!isBrowser()) return emptyDraft();
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return emptyDraft();
    const parsed = JSON.parse(raw) as Partial<LeaderDraft>;
    return {
      attendance: parsed.attendance ?? {},
      scheduleChanges: parsed.scheduleChanges ?? {},
      graceSharing: parsed.graceSharing ?? "",
      prayerTopics: parsed.prayerTopics ?? "",
    };
  } catch {
    return emptyDraft();
  }
}

function persistDraft(key: string | null, draft: LeaderDraft): void {
  if (!isBrowser() || !key) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(draft));
  } catch {
    // quota 초과 등은 무시 (드래프트는 best-effort 캐시)
  }
}

function removeDraft(key: string | null): void {
  if (!isBrowser() || !key) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // 무시
  }
}

export const useLeaderDraftStore = create<LeaderDraftState>((set, get) => ({
  key: null,
  draft: emptyDraft(),

  init: (slug, gbsId, today) => {
    const key = leaderDraftKey(slug, gbsId, today);
    if (get().key === key) return; // 이미 같은 컨텍스트면 재로드하지 않음
    set({ key, draft: loadDraft(key) });
  },

  setAttendance: (id, status) =>
    set((state) => {
      const attendance = { ...state.draft.attendance };
      if (status === null) {
        delete attendance[id];
      } else {
        attendance[id] = status;
      }
      const draft = { ...state.draft, attendance };
      persistDraft(state.key, draft);
      return { draft };
    }),

  setScheduleChange: (id, change) =>
    set((state) => {
      const draft = {
        ...state.draft,
        scheduleChanges: { ...state.draft.scheduleChanges, [id]: change },
      };
      persistDraft(state.key, draft);
      return { draft };
    }),

  clearScheduleChange: (id) =>
    set((state) => {
      const scheduleChanges = { ...state.draft.scheduleChanges };
      delete scheduleChanges[id];
      const draft = { ...state.draft, scheduleChanges };
      persistDraft(state.key, draft);
      return { draft };
    }),

  setGraceSharing: (graceSharing) =>
    set((state) => {
      const draft = { ...state.draft, graceSharing };
      persistDraft(state.key, draft);
      return { draft };
    }),

  setPrayerTopics: (prayerTopics) =>
    set((state) => {
      const draft = { ...state.draft, prayerTopics };
      persistDraft(state.key, draft);
      return { draft };
    }),

  hasUnsavedChanges: () => {
    const { draft } = get();
    return (
      Object.keys(draft.attendance).length > 0 ||
      Object.keys(draft.scheduleChanges).length > 0 ||
      draft.graceSharing.trim().length > 0 ||
      draft.prayerTopics.trim().length > 0
    );
  },

  clear: () =>
    set((state) => {
      removeDraft(state.key);
      return { draft: emptyDraft() };
    }),
}));
