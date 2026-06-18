"use client";

import { useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Sunrise, Sun, Sunset, Bed } from "lucide-react";
import { formatDate } from "@/lib/format-date";
import { getKSTDateString } from "@/lib/date-utils";
import { EVENT_TYPE_MAP } from "@/constants/schedule";
import { cn } from "@/lib/utils";
import type { TRetreatRegistrationSchedule } from "@/types";

const EVENT_TYPES = ["BREAKFAST", "LUNCH", "DINNER", "SLEEP"] as const;

const EVENT_TYPE_ICON: Record<string, React.ReactNode> = {
  BREAKFAST: <Sunrise className="mr-2 h-4 w-4" />,
  LUNCH: <Sun className="mr-2 h-4 w-4" />,
  DINNER: <Sunset className="mr-2 h-4 w-4" />,
  SLEEP: <Bed className="mr-2 h-4 w-4" />,
};

interface ScheduleSlotMatrixProps {
  schedule: TRetreatRegistrationSchedule[];
  /** 현재 선택된 schedule id 목록 */
  selectedIds: number[];
  onToggle: (id: number) => void;
  /** 변경된(원본 대비 추가/제거된) slot 강조용 원본 id 목록 */
  originalIds?: number[];
}

/**
 * 일정 변경 모달에서 쓰는 날짜 × 식사/숙박 매트릭스.
 * schedule-matrix.tsx 의 렌더링을 그대로 따르되 RHF 의존을 빼고
 * controlled(selectedIds/onToggle) 로 동작한다. 변경된 slot 은 강조한다.
 */
export function ScheduleSlotMatrix({
  schedule,
  selectedIds,
  onToggle,
  originalIds = [],
}: ScheduleSlotMatrixProps) {
  const dates = useMemo(
    () =>
      Array.from(
        new Set(schedule.map((s) => getKSTDateString(s.time)))
      ).toSorted(),
    [schedule]
  );

  const originalSet = useMemo(() => new Set(originalIds), [originalIds]);
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-center whitespace-nowrap sm:px-2 px-1">
            일정
          </TableHead>
          {dates.map((date) => (
            <TableHead
              key={date}
              className="text-center whitespace-nowrap sm:px-2 px-1"
            >
              {formatDate(date)}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {EVENT_TYPES.map((eventType) => (
          <TableRow key={eventType}>
            <TableCell className="flex items-center justify-center whitespace-nowrap sm:px-2 px-1">
              {EVENT_TYPE_ICON[eventType]}
              {EVENT_TYPE_MAP[eventType]}
            </TableCell>
            {dates.map((date) => {
              const event = schedule.find(
                (s) =>
                  getKSTDateString(s.time) === date && s.type === eventType
              );
              if (!event) {
                return (
                  <TableCell
                    key={`${date}-${eventType}`}
                    className="text-center p-2 sm:px-3 sm:py-2 whitespace-nowrap"
                  >
                    <span className="text-gray-300">-</span>
                  </TableCell>
                );
              }
              const changed =
                selectedSet.has(event.id) !== originalSet.has(event.id);
              return (
                <TableCell
                  key={`${date}-${eventType}`}
                  className={cn(
                    "text-center p-2 sm:px-3 sm:py-2 whitespace-nowrap",
                    changed && "bg-yellow-100"
                  )}
                >
                  <Checkbox
                    className="m-2"
                    checked={selectedSet.has(event.id)}
                    onCheckedChange={() => onToggle(event.id)}
                  />
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
