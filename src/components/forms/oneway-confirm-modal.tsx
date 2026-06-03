import { Button } from "@/components/ui/button";

interface OnewayConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function OnewayConfirmModal({
  open,
  onClose,
  onConfirm,
}: OnewayConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
        <h3 className="text-lg font-bold mb-4">편도 신청 확인</h3>
        <p className="text-sm mb-4">
          편도 이동이 확인되었습니다.<br />
          편도로 신청하시겠습니까?
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            버스 추가 선택
          </Button>
          <Button onClick={onConfirm}>예, 편도입니다</Button>
        </div>
      </div>
    </div>
  );
}
