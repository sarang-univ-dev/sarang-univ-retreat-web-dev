import { CheckCheck, Clock, XCircle } from "lucide-react";
import type { ScheduleChangeRequestStatus } from "@/services/leader";

/**
 * 캡슐형 chip (admin badges.tsx 패턴과 동일한 톤 매핑).
 * 일정 변경 요청 상태와 드래프트 상태를 표시한다.
 */

function Chip({
  color,
  icon,
  label,
}: {
  color: "green" | "yellow" | "gray" | "blue";
  icon: React.ReactNode;
  label: string;
}) {
  const tone: Record<string, string> = {
    green: "bg-green-50 border-green-200 text-green-700",
    yellow: "bg-yellow-50 border-yellow-200 text-yellow-700",
    gray: "bg-gray-50 border-gray-200 text-gray-700",
    blue: "bg-blue-50 border-blue-200 text-blue-700",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full border ${tone[color]}`}
    >
      {icon}
      <span className="text-xs font-medium whitespace-nowrap">{label}</span>
    </span>
  );
}

export function ScheduleRequestBadge({
  status,
}: {
  status: ScheduleChangeRequestStatus;
}) {
  switch (status) {
    case "APPROVED":
      return (
        <Chip
          color="green"
          icon={<CheckCheck className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />}
          label="일정변경 승인됨"
        />
      );
    case "PENDING":
      return (
        <Chip
          color="yellow"
          icon={<Clock className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />}
          label="일정변경 검토중"
        />
      );
    case "REJECTED":
      return (
        <Chip
          color="gray"
          icon={<XCircle className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />}
          label="일정변경 반려됨"
        />
      );
    default:
      return null;
  }
}

export function ScheduleDraftBadge() {
  return (
    <Chip
      color="blue"
      icon={<Clock className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />}
      label="일정변경 입력됨 (미제출)"
    />
  );
}
