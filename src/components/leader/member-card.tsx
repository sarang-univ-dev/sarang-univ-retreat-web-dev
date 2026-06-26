"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarClock } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScheduleChangeModal } from "@/components/leader/schedule-change-modal";
import {
  ScheduleDraftBadge,
  ScheduleRequestBadge,
} from "@/components/leader/leader-badges";
import { useLeaderDraftStore } from "@/store/leader-draft-store";
import { getKSTDateString, getKSTWeekday } from "@/lib/date-utils";
import type { AttendanceStatus, LeaderMember } from "@/services/leader";
import type { TRetreatRegistrationSchedule } from "@/types";

function genderLabel(gender: string): string {
  if (gender === "MALE") return "형제";
  if (gender === "FEMALE") return "자매";
  return gender;
}

// 끼니 약어 / 정렬 순서 (겨울 리더보고서식: 요일 1글자 + 끼니 1글자, 예 "수점")
const MEAL_SHORT: Record<string, string> = {
  BREAKFAST: "아",
  LUNCH: "점",
  DINNER: "저",
  SLEEP: "숙",
};
const MEAL_ORDER: Record<string, number> = {
  BREAKFAST: 0,
  LUNCH: 1,
  DINNER: 2,
  SLEEP: 3,
};

function formatScheduleCompact(
  selectedIds: number[],
  schedule: TRetreatRegistrationSchedule[]
): string {
  const ordered = [...schedule].toSorted((a, b) => {
    const da = getKSTDateString(a.time);
    const db = getKSTDateString(b.time);
    if (da !== db) return da < db ? -1 : 1;
    return (MEAL_ORDER[a.type] ?? 9) - (MEAL_ORDER[b.type] ?? 9);
  });
  if (ordered.length === 0) return "일정 없음";

  const selected = new Set(selectedIds);
  const count = ordered.filter((s) => selected.has(s.id)).length;
  if (count === 0) return "일정 없음";
  if (count === ordered.length) return "전참";

  const label = (s: TRetreatRegistrationSchedule) =>
    `${getKSTWeekday(s.time)}${MEAL_SHORT[s.type] ?? s.type}`;

  const ranges: string[] = [];
  let start: TRetreatRegistrationSchedule | null = null;
  let end: TRetreatRegistrationSchedule | null = null;
  const flush = () => {
    if (!start || !end) return;
    ranges.push(start === end ? label(start) : `${label(start)}~${label(end)}`);
    start = null;
    end = null;
  };
  for (const s of ordered) {
    if (selected.has(s.id)) {
      if (!start) start = s;
      end = s;
    } else {
      flush();
    }
  }
  flush();
  return ranges.join(", ");
}

interface MemberCardProps {
  member: LeaderMember;
  schedule: TRetreatRegistrationSchedule[];
}

export function MemberCard({ member, schedule }: MemberCardProps) {
  const id = member.userRetreatRegistrationId;

  const draftAttendance = useLeaderDraftStore((s) => s.draft.attendance[id]);
  const draftMemo = useLeaderDraftStore((s) => s.draft.memo[id]);
  const scheduleChange = useLeaderDraftStore(
    (s) => s.draft.scheduleChanges[id]
  );
  const setAttendance = useLeaderDraftStore((s) => s.setAttendance);
  const setMemo = useLeaderDraftStore((s) => s.setMemo);
  const setScheduleChange = useLeaderDraftStore((s) => s.setScheduleChange);
  const clearScheduleChange = useLeaderDraftStore(
    (s) => s.clearScheduleChange
  );

  const [showModal, setShowModal] = useState(false);

  // 드래프트 우선, 없으면 서버 값
  const attendance: AttendanceStatus | null =
    draftAttendance !== undefined
      ? draftAttendance
      : member.todayAttendanceStatus;
  const memo = draftMemo !== undefined ? draftMemo : member.todayMemo ?? "";

  const latest = member.latestScheduleChangeRequest;

  const scheduleSummary = formatScheduleCompact(member.scheduleIds, schedule);

  // 변경 전→후 (드래프트 우선, 없으면 검토중 요청)
  const change = scheduleChange
    ? { before: scheduleChange.before, after: scheduleChange.after }
    : latest && latest.status === "PENDING"
      ? { before: member.scheduleIds, after: latest.afterScheduleIds }
      : null;

  const attendanceChip =
    attendance === "PRESENT"
      ? { label: "출석", cls: "bg-green-50 border-green-200 text-green-700" }
      : attendance === "ABSENT"
        ? { label: "결석", cls: "bg-red-50 border-red-200 text-red-700" }
        : { label: "미입력", cls: "bg-gray-50 border-gray-200 text-gray-500" };

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="font-semibold text-base">
              {member.name}
              {member.isLeader && (
                <span className="ml-1.5 text-xs text-primary">(리더)</span>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              {member.univGroupNumber}부 · {member.gradeNumber}학년 ·{" "}
              {genderLabel(member.gender)}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5 break-keep">
              현재 일정:{" "}
              <span className="text-foreground">{scheduleSummary}</span>
            </div>
            {change && (
              <div className="text-xs mt-0.5 break-keep text-amber-600">
                {formatScheduleCompact(change.before, schedule)} →{" "}
                {formatScheduleCompact(change.after, schedule)}
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-1">
            <span
              className={cn(
                "inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-medium whitespace-nowrap",
                attendanceChip.cls
              )}
            >
              {attendanceChip.label}
            </span>
            {scheduleChange ? (
              <ScheduleDraftBadge />
            ) : (
              latest && <ScheduleRequestBadge status={latest.status} />
            )}
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => setShowModal(true)}
        >
          <CalendarClock className="h-4 w-4" />
          출석 · 일정 수정
        </Button>

        {showModal && (
          <ScheduleChangeModal
            member={member}
            schedule={schedule}
            existingDraft={scheduleChange}
            initialAttendance={attendance}
            initialMemo={memo}
            onClose={() => setShowModal(false)}
            onSave={({ attendance: a, memo: m, scheduleChange: sc }) => {
              setAttendance(id, a);
              setMemo(id, m);
              if (sc) {
                setScheduleChange(id, sc);
              } else {
                clearScheduleChange(id);
              }
              setShowModal(false);
            }}
          />
        )}
      </CardContent>
    </Card>
  );
}
