"use client";

import { Button } from "@/components/ui/button";

interface WarningsConfirmModalProps {
  warnings: string[];
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * 제출 검증 경고를 보여주고 그래도 제출할지 확인받는 모달.
 * 오버레이 패턴은 retreat-confirm-modal 을 따른다.
 */
export function WarningsConfirmModal({
  warnings,
  isSubmitting,
  onClose,
  onConfirm,
}: WarningsConfirmModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h3 className="text-lg font-bold mb-4">제출 전 확인</h3>
        <p className="text-sm text-muted-foreground mb-3 break-keep">
          아래 항목을 다시 확인해주세요. 그대로 제출하시겠습니까?
        </p>
        <ul className="space-y-2 mb-4 list-disc pl-5">
          {warnings.map((w, i) => (
            <li key={i} className="text-sm text-yellow-700 break-keep">
              {w}
            </li>
          ))}
        </ul>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            취소
          </Button>
          <Button onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span>제출 중...</span>
                <svg
                  className="ml-2 h-4 w-4 animate-spin"
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
              </>
            ) : (
              "그대로 제출"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
