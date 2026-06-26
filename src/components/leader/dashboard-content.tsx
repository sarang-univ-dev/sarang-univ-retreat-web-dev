"use client";

import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { MemberCard } from "@/components/leader/member-card";
import { ReportSection } from "@/components/leader/report-section";
import { SubmitBar } from "@/components/leader/submit-bar";
import { useLeaderMembers, useLeaderToday } from "@/hooks/use-leader-queries";
import { useRetreatInfo } from "@/hooks/use-retreat-queries";
import { useLeaderDraftStore } from "@/store/leader-draft-store";
import type { LeaderMe } from "@/services/leader";

interface DashboardContentProps {
  slug: string;
  leader: LeaderMe;
}

export function DashboardContent({ slug, leader }: DashboardContentProps) {
  const todayQuery = useLeaderToday(slug);
  const today = todayQuery.data?.today ?? null;
  const isLastDay = todayQuery.data?.isLastDay ?? false;

  const membersQuery = useLeaderMembers(slug);
  const retreatInfoQuery = useRetreatInfo(slug);

  // 드래프트 컨텍스트 초기화 (slug/gbsId/today). today 가 정해진 뒤에만.
  const initDraft = useLeaderDraftStore((s) => s.init);
  const draftAttendance = useLeaderDraftStore((s) => s.draft.attendance);
  useEffect(() => {
    if (today) {
      initDraft(slug, leader.gbsId, today);
    }
  }, [slug, leader.gbsId, today, initDraft]);

  const isLoading =
    todayQuery.isLoading ||
    membersQuery.isLoading ||
    retreatInfoQuery.isLoading;

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (
    todayQuery.isError ||
    membersQuery.isError ||
    retreatInfoQuery.isError ||
    !membersQuery.data ||
    !retreatInfoQuery.data
  ) {
    return (
      <p className="text-red-500 text-center py-8">
        데이터를 불러오는데 실패했습니다.
      </p>
    );
  }

  // today 가 없으면(수양회 기간 밖) 출석/보고 입력 불가
  if (!today) {
    return (
      <p className="text-muted-foreground text-center py-8 break-keep">
        오늘은 수양회 기간이 아닙니다. 수양회 기간에 다시 확인해주세요.
      </p>
    );
  }

  const members = membersQuery.data.members;
  const schedule = retreatInfoQuery.data.schedule;

  // 출석 입력 진행률 (드래프트 우선, 없으면 서버 값) — 제출 전 완료도 표시
  const attendanceCheckedCount = members.filter((m) => {
    const drafted = draftAttendance[m.userRetreatRegistrationId];
    const status = drafted !== undefined ? drafted : m.todayAttendanceStatus;
    return status != null;
  }).length;
  const attendancePct =
    members.length > 0
      ? Math.round((attendanceCheckedCount / members.length) * 100)
      : 0;
  const attendanceAllChecked =
    members.length > 0 && attendanceCheckedCount === members.length;

  return (
    <>
      {members.length > 0 && (
        <div className="mb-3">
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="font-medium">출석 체크</span>
            <span className="text-muted-foreground">
              {attendanceCheckedCount} / {members.length}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all ${
                attendanceAllChecked ? "bg-green-500" : "bg-primary"
              }`}
              style={{ width: `${attendancePct}%` }}
            />
          </div>
        </div>
      )}

      <div className="space-y-3 pb-4">
        {members.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            조원이 없습니다.
          </p>
        ) : (
          members.map((m) => (
            <MemberCard
              key={m.userRetreatRegistrationId}
              member={m}
              schedule={schedule}
            />
          ))
        )}

        <ReportSection isLastDay={isLastDay} />
      </div>

      <SubmitBar
        slug={slug}
        members={members}
        schedule={schedule}
        today={today}
        isLastDay={isLastDay}
      />
    </>
  );
}
