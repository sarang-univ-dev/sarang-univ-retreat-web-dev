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
import { formatDate } from "@/lib/format-date";
import { getKSTDateString } from "@/lib/date-utils";
import { EVENT_TYPE_MAP } from "@/constants/schedule";
import type { AttendanceStatus, LeaderMember } from "@/services/leader";
import type { TRetreatRegistrationSchedule } from "@/types";

function genderLabel(gender: string): string {
  if (gender === "MALE") return "형제";
  if (gender === "FEMALE") return "자매";
  return gender;
}

const TYPE_ORDER: Record<string, number> = {
  BREAKFAST: 0,
  LUNCH: 1,
  DINNER: 2,
  SLEEP: 3,
};

/** 조원의 현재 확정 일정을 "전참" 또는 날짜별 요약 문자열로 표시. */
function summarizeSchedule(
  memberScheduleIds: number[],
  schedule: TRetreatRegistrationSchedule[]
): string {
  const selected = schedule.filter((s) => memberScheduleIds.includes(s.id));
  if (selected.length === 0) return "일정 없음";
  if (schedule.length > 0 && selected.length === schedule.length) return "전참";

  const byDate = new Map<string, TRetreatRegistrationSchedule[]>();
  for (const s of selected) {
    const d = getKSTDateString(s.time);
    if (!byDate.has(d)) byDate.set(d, []);
    byDate.get(d)!.push(s);
  }

  return Array.from(byDate.keys())
    .toSorted()
    .map((d) => {
      const types = byDate
        .get(d)!
        .toSorted((a, b) => (TYPE_ORDER[a.type] ?? 9) - (TYPE_ORDER[b.type] ?? 9))
        .map((s) => EVENT_TYPE_MAP[s.type] ?? s.type);
      return `${formatDate(d)} ${types.join("·")}`;
    })
    .join(" / ");
}

interface MemberCardProps {
  member: LeaderMember;
  schedule: TRetreatRegistrationSchedule[];
}

export function MemberCard({ member, schedule }: MemberCardProps) {
  const id = member.userRetreatRegistrationId;
  const scheduleSummary = summarizeSchedule(member.scheduleIds, schedule);

  const draftAttendance = useLeaderDraftStore(
    (s) => s.draft.attendance[id]
  );
  const scheduleChange = useLeaderDraftStore(
    (s) => s.draft.scheduleChanges[id]
  );
  const setAttendance = useLeaderDraftStore((s) => s.setAttendance);
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

  const toggle = (next: AttendanceStatus) => {
    // mutually exclusive; 같은 값 다시 누르면 해제(null)
    setAttendance(id, attendance === next ? null : next);
  };

  const latest = member.latestScheduleChangeRequest;

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
          </div>
          <div className="flex flex-col items-end gap-1">
            {scheduleChange ? (
              <ScheduleDraftBadge />
            ) : (
              latest && <ScheduleRequestBadge status={latest.status} />
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => toggle("PRESENT")}
            className={cn(
              "flex-1 h-10 rounded-md border text-sm font-medium transition-colors",
              attendance === "PRESENT"
                ? "bg-green-600 text-white border-green-600"
                : "bg-background border-input hover:bg-accent"
            )}
          >
            출석
          </button>
          <button
            type="button"
            onClick={() => toggle("ABSENT")}
            className={cn(
              "flex-1 h-10 rounded-md border text-sm font-medium transition-colors",
              attendance === "ABSENT"
                ? "bg-red-600 text-white border-red-600"
                : "bg-background border-input hover:bg-accent"
            )}
          >
            결석
          </button>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => setShowModal(true)}
          // 검토중(PENDING) 요청이 이미 있으면 새 요청을 막는다 (서버도 409)
          disabled={!scheduleChange && latest?.status === "PENDING"}
        >
          <CalendarClock className="h-4 w-4" />
          {scheduleChange ? "일정 수정 (입력됨)" : "일정 수정"}
        </Button>

        {showModal && (
          <ScheduleChangeModal
            member={member}
            schedule={schedule}
            existingDraft={scheduleChange}
            onClose={() => setShowModal(false)}
            onSave={(draft) => {
              setScheduleChange(id, draft);
              setShowModal(false);
            }}
            onRemove={() => {
              clearScheduleChange(id);
              setShowModal(false);
            }}
          />
        )}
      </CardContent>
    </Card>
  );
}
