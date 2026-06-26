"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ScheduleSlotMatrix } from "@/components/leader/schedule-slot-matrix";
import type { AttendanceStatus, LeaderMember } from "@/services/leader";
import type { ScheduleChangeDraft } from "@/store/leader-draft-store";
import type { TRetreatRegistrationSchedule } from "@/types";

interface ScheduleChangeModalProps {
  member: LeaderMember;
  schedule: TRetreatRegistrationSchedule[];
  /** 기존에 저장된 일정변경 드래프트(편집 진입 시 복원) */
  existingDraft?: ScheduleChangeDraft;
  initialAttendance: AttendanceStatus | null;
  initialMemo: string;
  onClose: () => void;
  onSave: (result: {
    attendance: AttendanceStatus | null;
    memo: string;
    scheduleChange: ScheduleChangeDraft | null;
  }) => void;
}

function sameIds(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  const setB = new Set(b);
  return a.every((id) => setB.has(id));
}

/**
 * 한 조원의 출석 · 일정 · 비고를 입력하는 모달.
 * - 출석/결석 토글 (전원 입력 필수는 제출 단계에서 검증)
 * - 일정 매트릭스: 변경 시 사유 필수, 드래프트로 저장(즉시 서버 호출 X).
 *   검토중 요청이 있어도 다시 제출하면 서버가 같은 리더의 요청을 upsert 하므로 항상 편집 가능.
 * - 비고(특이사항): 출석과 함께 저장되어 인원관리 간사가 모아 본다
 * 오버레이 패턴은 retreat-confirm-modal 을 그대로 따른다.
 */
export function ScheduleChangeModal({
  member,
  schedule,
  existingDraft,
  initialAttendance,
  initialMemo,
  onClose,
  onSave,
}: ScheduleChangeModalProps) {
  // 원본 = 멤버의 현재 확정 일정
  const originalIds = member.scheduleIds;

  const [attendance, setAttendance] = useState<AttendanceStatus | null>(
    initialAttendance
  );
  const [memo, setMemo] = useState<string>(initialMemo);
  const [selectedIds, setSelectedIds] = useState<number[]>(
    existingDraft ? existingDraft.after : originalIds
  );
  const [reason, setReason] = useState<string>(existingDraft?.reason ?? "");
  const [error, setError] = useState("");

  const isChanged = useMemo(
    () => !sameIds(selectedIds, originalIds),
    [selectedIds, originalIds]
  );

  const handleToggleSlot = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleAttendance = (next: AttendanceStatus) => {
    setAttendance((prev) => (prev === next ? null : next));
  };

  const handleSave = () => {
    let scheduleChange: ScheduleChangeDraft | null = null;
    if (isChanged) {
      if (selectedIds.length === 0) {
        setError("일정을 한 개 이상 선택해주세요.");
        return;
      }
      if (!reason.trim()) {
        setError("일정 변경 사유를 입력해주세요.");
        return;
      }
      scheduleChange = {
        before: originalIds,
        after: selectedIds,
        reason: reason.trim(),
      };
    }
    onSave({ attendance, memo: memo.trim(), scheduleChange });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold mb-1">{member.name} 조원</h3>
        <p className="text-sm text-muted-foreground mb-4 break-keep">
          출석을 체크하고, 필요하면 일정/비고를 입력해주세요. 저장하면 제출 시
          함께 반영됩니다.
        </p>

        {/* 출석 */}
        <div className="space-y-2 mb-5">
          <Label>오늘 출석</Label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => toggleAttendance("PRESENT")}
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
              onClick={() => toggleAttendance("ABSENT")}
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
        </div>

        {/* 일정 */}
        <div className="mb-5">
          <Label className="mb-2 block">일정</Label>
          <div className="overflow-x-auto">
            <ScheduleSlotMatrix
              schedule={schedule}
              selectedIds={selectedIds}
              onToggle={handleToggleSlot}
              originalIds={originalIds}
            />
          </div>
        </div>

        {/* 변경 사유 (일정 변경 시 필수) */}
        {isChanged && (
          <div className="space-y-2 mb-5">
            <Label htmlFor="schedule-change-reason">
              일정 변경 사유 <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="schedule-change-reason"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError("");
              }}
              placeholder="예) 늦은 합류로 인한 일정 변경"
            />
          </div>
        )}

        {/* 비고 */}
        <div className="space-y-2 mb-4">
          <Label htmlFor="member-memo">비고 (특이사항)</Label>
          <Textarea
            id="member-memo"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="예) 컨디션 난조, 중간 합류 등 — 인원관리 간사에게 전달됩니다"
          />
        </div>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            닫기
          </Button>
          <Button type="button" onClick={handleSave}>
            저장
          </Button>
        </div>
      </div>
    </div>
  );
}
