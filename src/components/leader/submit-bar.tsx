"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { WarningsConfirmModal } from "@/components/leader/warnings-confirm-modal";
import { useToastStore } from "@/store/toast-store";
import { useLeaderDraftStore } from "@/store/leader-draft-store";
import { leaderQueryKeys } from "@/hooks/use-leader-queries";
import { validateLeaderSubmit } from "@/lib/leader-validation";
import { getErrorMessage, logError } from "@/lib/error-handler";
import {
  submitLeaderAttendance,
  submitLeaderReport,
  submitLeaderScheduleChangeRequest,
  type AttendanceEntry,
  type AttendanceStatus,
  type LeaderMember,
} from "@/services/leader";
import type { TRetreatRegistrationSchedule } from "@/types";

interface SubmitBarProps {
  slug: string;
  members: LeaderMember[];
  schedule: TRetreatRegistrationSchedule[];
  today: string;
  isLastDay: boolean;
}

/**
 * 모든 변경(출석 + 일정변경요청 + 보고)을 한 번에 순차 제출하는 sticky bar.
 *
 * 순서: POST /attendance → (멤버별) POST /schedule-change-requests → POST /reports.
 * 첫 에러에서 중단하고 드래프트를 비우지 않는다(재시도 가능).
 * 전부 성공하면 /members 무효화 + 드래프트 clear + 성공 toast.
 */
export function SubmitBar({
  slug,
  members,
  schedule,
  today,
  isLastDay,
}: SubmitBarProps) {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.add);

  const draft = useLeaderDraftStore((s) => s.draft);
  const clearDraft = useLeaderDraftStore((s) => s.clear);

  const [pendingWarnings, setPendingWarnings] = useState<string[] | null>(null);

  // 모든 변경(출석 → 일정변경요청 → 보고)을 순차 제출하는 단일 mutation.
  // 첫 에러에서 중단하고 드래프트는 유지(재시도). 성공 시 /members 무효화 + 드래프트 clear.
  const submitMutation = useMutation({
    mutationFn: async () => {
      // 1) 출석 — 드래프트 우선, 없으면 서버 값. PRESENT/ABSENT 만 전송.
      const entries: AttendanceEntry[] = [];
      for (const m of members) {
        const drafted = draft.attendance[m.userRetreatRegistrationId];
        const status: AttendanceStatus | null =
          drafted !== undefined ? drafted : m.todayAttendanceStatus;
        if (status === "PRESENT" || status === "ABSENT") {
          const memoDraft = draft.memo[m.userRetreatRegistrationId];
          const memo = memoDraft !== undefined ? memoDraft : m.todayMemo ?? "";
          entries.push({
            userRetreatRegistrationId: m.userRetreatRegistrationId,
            status,
            memo,
          });
        }
      }
      if (entries.length > 0) {
        await submitLeaderAttendance(slug, { date: today, entries });
      }

      // 2) 일정 변경 요청 — 드래프트된 멤버별로 하나씩
      for (const [idStr, change] of Object.entries(draft.scheduleChanges)) {
        await submitLeaderScheduleChangeRequest(slug, {
          userRetreatRegistrationId: Number(idStr),
          afterScheduleIds: change.after,
          reason: change.reason,
        });
      }

      // 3) 보고 — 마지막 날이 아니면
      if (!isLastDay) {
        await submitLeaderReport(slug, {
          date: today,
          graceSharing: draft.graceSharing,
          prayerRequests: draft.prayerRequests,
        });
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: leaderQueryKeys.members(slug),
      });
      clearDraft();
      addToast({ title: "제출이 완료되었습니다", variant: "success" });
    },
    onError: (error) => {
      logError(error, "leader-submit");
      addToast({
        title: "제출에 실패했습니다",
        description: getErrorMessage(error),
        variant: "destructive",
      });
      // 드래프트는 그대로 유지(재시도 가능)
    },
    onSettled: () => {
      setPendingWarnings(null);
    },
  });

  const handleSubmit = () => {
    const { errors, warnings } = validateLeaderSubmit({
      members,
      draft,
      schedule,
      today,
      isLastDay,
    });

    if (errors.length > 0) {
      addToast({
        title: "제출할 수 없습니다",
        description: errors.join(" "),
        variant: "destructive",
      });
      return;
    }

    if (warnings.length > 0) {
      setPendingWarnings(warnings);
      return;
    }

    submitMutation.mutate();
  };

  return (
    <>
      <div className="sticky bottom-0 left-0 right-0 z-40 border-t bg-white p-3 shadow-[0_-2px_8px_rgba(0,0,0,0.05)]">
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={submitMutation.isPending}
          className="w-full text-md flex items-center justify-center"
        >
          <span>제출하기</span>
          {submitMutation.isPending && (
            <svg
              className="ml-2 h-5 w-5 animate-spin text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              ></path>
            </svg>
          )}
        </Button>
      </div>

      {pendingWarnings && (
        <WarningsConfirmModal
          warnings={pendingWarnings}
          isSubmitting={submitMutation.isPending}
          onClose={() => setPendingWarnings(null)}
          onConfirm={() => submitMutation.mutate()}
        />
      )}
    </>
  );
}
