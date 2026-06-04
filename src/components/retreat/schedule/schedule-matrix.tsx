import { useMemo } from "react";
import { Controller } from "react-hook-form";
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
import { useRetreatInfoContext } from "@/components/retreat/retreat-info-context";
import { useIsAllScheduleSelected } from "@/hooks/use-retreat-derived";
import { useRetreatForm } from "@/hooks/use-retreat-form";
import { EVENT_TYPE_MAP } from "@/constants/schedule";
import type { TRetreatRegistrationSchedule } from "@/types";

const EVENT_TYPES = ["BREAKFAST", "LUNCH", "DINNER", "SLEEP"] as const;

const EVENT_TYPE_ICON: Record<string, React.ReactNode> = {
  BREAKFAST: <Sunrise className="mr-2" />,
  LUNCH: <Sun className="mr-2" />,
  DINNER: <Sunset className="mr-2" />,
  SLEEP: <Bed className="mr-2" />,
};

/** 날짜 × 식사/숙박 매트릭스에서 일정을 체크하는 표 + 전참 체크박스. */
export function ScheduleMatrix() {
  const { retreatData } = useRetreatInfoContext();
  const isAllScheduleSelected = useIsAllScheduleSelected();
  const {
    control,
    formState: { errors },
  } = useRetreatForm();

  const schedule = retreatData.schedule;

  // 표시 목적으로 일정에서 고유한 날짜 추출 (KST 기준)
  const retreatDatesForDisplay = useMemo(
    () =>
      Array.from(
        new Set(schedule.map((s) => getKSTDateString(s.time)))
      ).toSorted(),
    [schedule]
  );

  return (
    <>
      <Controller
        control={control}
        name="scheduleSelection"
        render={({ field }) => {
          const selection = field.value;

          const handleAllScheduleChange = (checked: boolean) => {
            const allScheduleIds = schedule.map(
              (item: TRetreatRegistrationSchedule) => item.id
            );
            field.onChange(checked ? allScheduleIds : []);
          };

          const handleScheduleChange = (id: number) => {
            const updatedSelection = selection.includes(id)
              ? selection.filter((item) => item !== id)
              : [...selection, id];
            field.onChange(updatedSelection);
          };

          return (
            <>
              <div className="flex items-center space-x-2 mb-4">
                <Checkbox
                  id="allSchedule"
                  className="all-schedule-checkbox"
                  checked={isAllScheduleSelected}
                  onCheckedChange={(checked: boolean) =>
                    handleAllScheduleChange(checked)
                  }
                />
                <label
                  htmlFor="allSchedule"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  전참
                </label>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center whitespace-nowrap sm:px-2 px-1">
                      일정 선택
                    </TableHead>
                    {retreatDatesForDisplay.map((date: string) => (
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
                      {retreatDatesForDisplay.map((date: string) => {
                        const event = schedule.find(
                          (s) =>
                            getKSTDateString(s.time) === date &&
                            s.type === eventType
                        );
                        return (
                          <TableCell
                            key={`${date}-${eventType}`}
                            className="text-center p-2 sm:px-3 sm:py-2 whitespace-nowrap"
                          >
                            {event ? (
                              <Checkbox
                                className="schedule-checkbox m-2"
                                checked={selection.includes(event.id)}
                                onCheckedChange={() =>
                                  handleScheduleChange(event.id)
                                }
                              />
                            ) : (
                              <span className="text-gray-300">-</span>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          );
        }}
      />
      {errors.scheduleSelection && (
        <p className="text-red-500 text-sm mt-1">
          {errors.scheduleSelection.message}
        </p>
      )}
    </>
  );
}
