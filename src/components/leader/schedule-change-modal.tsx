"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScheduleSlotMatrix } from "@/components/leader/schedule-slot-matrix";
import type { LeaderMember } from "@/services/leader";
import type { ScheduleChangeDraft } from "@/store/leader-draft-store";
import type { TRetreatRegistrationSchedule } from "@/types";

interface ScheduleChangeModalProps {
  member: LeaderMember;
  schedule: TRetreatRegistrationSchedule[];
  /** 기존에 저장된 드래프트(편집 진입 시 복원) */
  existingDraft?: ScheduleChangeDraft;
  onClose: () => void;
  onSave: (draft: ScheduleChangeDraft) => void;
  /** 드래프트 제거(변경 취소) */
  onRemove: () => void;
}

function sameIds(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  const setB = new Set(b);
  return a.every((id) => setB.has(id));
}

/**
 * 한 조원의 일정 변경 모달.
 * - slot 체크박스는 member.scheduleIds(또는 기존 드래프트의 after)로 pre-check
 * - 변경된 slot 강조 (ScheduleSlotMatrix 의 originalIds)
 * - 사유 필수
 * - 저장 시 드래프트({before, after, reason})를 부모로 올린다 (즉시 서버 호출 X)
 *
 * 오버레이 패턴은 retreat-confirm-modal 을 그대로 따른다.
 */
export function ScheduleChangeModal({
  member,
  schedule,
  existingDraft,
  onClose,
  onSave,
  onRemove,
}: ScheduleChangeModalProps) {
  // 원본 = 멤버의 현재 확정 일정
  const originalIds = member.scheduleIds;

  const [selectedIds, setSelectedIds] = useState<number[]>(
    existingDraft ? existingDraft.after : originalIds
  );
  const [reason, setReason] = useState<string>(existingDraft?.reason ?? "");
  const [reasonError, setReasonError] = useState("");

  const isChanged = useMemo(
    () => !sameIds(selectedIds, originalIds),
    [selectedIds, originalIds]
  );

  const handleToggle = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    if (!isChanged) {
      setReasonError("변경된 일정이 없습니다.");
      return;
    }
    if (selectedIds.length === 0) {
      setReasonError("일정을 한 개 이상 선택해주세요.");
      return;
    }
    if (!reason.trim()) {
      setReasonError("일정 변경 사유를 입력해주세요.");
      return;
    }
    onSave({
      before: originalIds,
      after: selectedIds,
      reason: reason.trim(),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold mb-1">{member.name} 조원 일정 수정</h3>
        <p className="text-sm text-muted-foreground mb-4 break-keep">
          변경할 일정을 체크하고 사유를 입력해주세요. 저장하면 제출 시 함께
          반영됩니다.
        </p>

        <div className="mb-4 overflow-x-auto">
          <ScheduleSlotMatrix
            schedule={schedule}
            selectedIds={selectedIds}
            onToggle={handleToggle}
            originalIds={originalIds}
          />
        </div>

        <div className="space-y-2 mb-4">
          <Label htmlFor="schedule-change-reason">변경 사유</Label>
          <Textarea
            id="schedule-change-reason"
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (reasonError) setReasonError("");
            }}
            placeholder="예) 늦은 합류로 인한 일정 변경"
          />
          {reasonError && (
            <p className="text-red-500 text-sm">{reasonError}</p>
          )}
        </div>

        <div className="flex justify-between gap-2">
          {existingDraft ? (
            <Button
              type="button"
              variant="outline"
              onClick={onRemove}
              className="text-red-600"
            >
              변경 취소
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              닫기
            </Button>
            <Button type="button" onClick={handleSave}>
              저장
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
