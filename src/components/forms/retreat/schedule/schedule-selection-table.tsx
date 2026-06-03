import { Calendar } from "lucide-react";
import { ScheduleMatrix } from "@/components/forms/retreat/schedule/schedule-matrix";
import { UserTypeField } from "@/components/forms/retreat/schedule/user-type-field";
import { ScheduleTotalPrice } from "@/components/forms/retreat/schedule/schedule-total-price";

export function ScheduleSelectionTable() {
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

      <ScheduleMatrix />

      <UserTypeField />

      <ScheduleTotalPrice />
    </div>
  );
}
