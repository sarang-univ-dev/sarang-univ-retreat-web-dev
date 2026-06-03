import { Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/utils/formatDate";
import { getKSTDateString } from "@/lib/date-utils";
import {
  UserCheck,
  Calendar,
  Sunrise,
  Sun,
  Sunset,
  Bed,
} from "lucide-react";
import { useMemo } from "react";
import { useRetreatData } from "@/components/forms/retreat-derived-context";
import {
  useIsAllScheduleSelected,
  useRetreatPrice,
} from "@/components/forms/use-retreat-derived";
import { EVENT_TYPE_MAP } from "@/constants/schedule";
import type { TRetreatRegistrationSchedule } from "@/types";
import { useRetreatForm } from "@/hooks/use-registration-form";

export function ScheduleSelectionTable() {
  const { retreatData } = useRetreatData();
  const isAllScheduleSelected = useIsAllScheduleSelected();
  const { totalPrice } = useRetreatPrice();
  const {
    control,
    watch,
    formState: { errors },
  } = useRetreatForm();

  const schedule = retreatData.schedule;
  const userType = watch("userType");

  // 표시 목적으로 일정에서 고유한 날짜 추출 (KST 기준)
  const retreatDatesForDisplay = useMemo(
    () =>
      Array.from(
        new Set(retreatData.schedule.map((s) => getKSTDateString(s.time)))
      ).toSorted(),
    [retreatData.schedule]
  );

  return (
    <div className="pt-4 border-t">
      <h2 className="text-2xl font-bold flex items-center mb-4">
        <Calendar className="mr-2" size={24} />
        수양회 일정 선택
      </h2>
      <p className="text-sm text-muted-foreground mt-3 mb-3 break-keep break-words">
        <b>
          <u>부분참 셔틀버스</u>
        </b>{" "}
        이용시, 저녁 식사 이후에 도착하게 됩니다. 해당 요일의{" "}
        <b>
          <u>숙박부터</u>
        </b>{" "}
        체크해주시기 바랍니다.
        <br />
        (잘못 체크한 경우 환불 불가)
      </p>
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
                  {["BREAKFAST", "LUNCH", "DINNER", "SLEEP"].map(
                    (eventType) => (
                      <TableRow key={eventType}>
                        <TableCell className="flex items-center justify-center whitespace-nowrap sm:px-2 px-1">
                          {eventType === "BREAKFAST" && (
                            <Sunrise className="mr-2" />
                          )}
                          {eventType === "LUNCH" && <Sun className="mr-2" />}
                          {eventType === "DINNER" && (
                            <Sunset className="mr-2" />
                          )}
                          {eventType === "SLEEP" && <Bed className="mr-2" />}
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
                    )
                  )}
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
      <div className="space-y-2 mt-4 mb-4 pt-4">
        <Label htmlFor="userType" className="flex items-center">
          <UserCheck className="mr-2" />
          신청 유형
        </Label>
        {/* <p className="text-sm text-muted-foreground mb-2 break-keep break-words">
          복음 GBS 신청은 각 부서 새가족 간사님을 통해 신청해주시기 바랍니다.
        </p> */}
        <Controller
          control={control}
          name="userType"
          render={({ field }) => (
            <RadioGroup
              value={field.value === null ? "NONE" : field.value}
              onValueChange={(value) =>
                field.onChange(value === "NONE" ? null : value)
              }
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="NONE" id="userType-none" />
                <Label htmlFor="userType-none">해당 없음</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="NEW_COMER" id="userType-newcomer" />
                <Label htmlFor="userType-newcomer">
                  새가족 (부서에서 등반하지 않은 지체)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="SOLDIER" id="userType-soldier" />
                <Label htmlFor="userType-soldier">
                  현역 군지체 (사회복무요원, 직업군인, 카투사 제외)
                </Label>
              </div>
            </RadioGroup>
          )}
        />
        {errors.userType && (
          <p className="text-red-500 text-sm mt-1">
            {errors.userType.message}
          </p>
        )}
      </div>

      <div className="mt-4 text-right">
        <p className="font-bold">
          총금액:{" "}
          {userType === "NEW_COMER" || userType === "SOLDIER"
            ? "입금 대기"
            : `${totalPrice.toLocaleString()}원`}
        </p>
      </div>
    </div>
  );
}
