import { getKSTDateString } from "@/lib/date-utils";
import type { AttendanceStatus, LeaderMember } from "@/services/leader";
import type { LeaderDraft } from "@/store/leader-draft-store";
import type { TRetreatRegistrationSchedule } from "@/types";

/**
 * 제출 직전 클라이언트 검증.
 *
 * - errors: 제출을 막는다(toast 로 노출). 구조적으로 불가능해야 하는 상태나
 *   필수 입력 누락.
 * - warnings: 제출을 막지 않되 confirm 모달로 사용자에게 한번 더 확인받는다.
 *
 * "today" 는 항상 서버에서 받은 값(today.today)을 사용한다.
 */

export interface LeaderValidationResult {
  errors: string[];
  warnings: string[];
}

interface ValidateArgs {
  members: LeaderMember[];
  draft: LeaderDraft;
  schedule: TRetreatRegistrationSchedule[];
  today: string;
  isLastDay: boolean;
}

/** 오늘 날짜(KST)에 해당하는 schedule id 집합. */
export function getTodayScheduleIds(
  schedule: TRetreatRegistrationSchedule[],
  today: string
): Set<number> {
  return new Set(
    schedule
      .filter((s) => getKSTDateString(s.time) === today)
      .map((s) => s.id)
  );
}

/** 한 멤버의 (드래프트 우선) 현재 일정 id 목록. */
function effectiveScheduleIds(
  member: LeaderMember,
  draft: LeaderDraft
): number[] {
  const change = draft.scheduleChanges[member.userRetreatRegistrationId];
  return change ? change.after : member.scheduleIds;
}

/** 한 멤버의 오늘 출석 상태(드래프트 우선, 없으면 서버 값). */
function effectiveAttendance(
  member: LeaderMember,
  draft: LeaderDraft
): AttendanceStatus | null {
  const drafted = draft.attendance[member.userRetreatRegistrationId];
  if (drafted !== undefined) return drafted;
  return member.todayAttendanceStatus;
}

export function validateLeaderSubmit({
  members,
  draft,
  schedule,
  today,
  isLastDay,
}: ValidateArgs): LeaderValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const todayScheduleIds = getTodayScheduleIds(schedule, today);

  // 보고: 마지막 날이 아니면 은혜나눔 + 기도제목 필수
  if (!isLastDay) {
    if (!draft.graceSharing.trim()) {
      errors.push("은혜나눔을 입력해주세요.");
    }
    if (!draft.prayerRequests.trim()) {
      errors.push("기도제목을 입력해주세요.");
    }
  }

  // 출석: 모든 멤버가 체크되어야 함
  const uncheckedMembers = members.filter(
    (m) => effectiveAttendance(m, draft) == null
  );
  if (uncheckedMembers.length > 0) {
    errors.push(
      `출석 체크가 안 된 조원이 ${uncheckedMembers.length}명 있습니다.`
    );
  }

  // 일정변경 드래프트: 사유는 필수(구조적으로 모달에서 막지만 방어적으로 재검증)
  for (const member of members) {
    const change = draft.scheduleChanges[member.userRetreatRegistrationId];
    if (change && !change.reason.trim()) {
      errors.push(`${member.name} 조원의 일정 변경 사유를 입력해주세요.`);
    }
  }

  // 경고: 오늘 일정이 있는데 결석으로 체크 / 오늘 일정이 없는데 출석으로 체크
  for (const member of members) {
    const status = effectiveAttendance(member, draft);
    if (status == null) continue; // 미체크는 위에서 error 로 처리됨

    const memberScheduleIds = effectiveScheduleIds(member, draft);
    const hasScheduleToday = memberScheduleIds.some((id) =>
      todayScheduleIds.has(id)
    );

    if (hasScheduleToday && status === "ABSENT") {
      warnings.push(
        `${member.name} 조원은 오늘 일정이 있는데 결석으로 체크되어 있습니다.`
      );
    }
    if (!hasScheduleToday && status === "PRESENT") {
      warnings.push(
        `${member.name} 조원은 오늘 일정이 없는데 출석으로 체크되어 있습니다.`
      );
    }
  }

  return { errors, warnings };
}
