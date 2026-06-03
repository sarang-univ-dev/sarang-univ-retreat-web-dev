import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { X, CheckCircle } from "lucide-react";
import { formatDate } from "@/lib/format-date";
import { getKSTDateString } from "@/lib/date-utils";
import { useShuttleInfoContext } from "@/components/shuttle/shuttle-info-context";
import { useBusForm } from "@/hooks/use-registration-form";

export function SelectedBusesCard() {
  const { busData } = useShuttleInfoContext();
  const { watch, setValue } = useBusForm();
  const selectedBusIds = watch("shuttleBusIds");
  const shuttleBuses = busData.shuttleBuses;

  // 부분참여 여부 (이 카드의 유일한 소비자)
  const isPartialParticipation = useMemo(() => {
    const buses = busData.shuttleBuses;
    if (buses.length < 2) return false; // 데이터가 없거나 1개면 부분참여 판단 불가

    const firstBusId = buses[0].id;
    const lastBusId = buses[buses.length - 1].id;

    return selectedBusIds.some(
      (id) => id !== firstBusId && id !== lastBusId
    );
  }, [selectedBusIds, busData]);

  const handleBusSelection = (busId: number) => {
    const updatedSelection = selectedBusIds.includes(busId)
      ? selectedBusIds.filter((item) => item !== busId)
      : [...selectedBusIds, busId];
    setValue("shuttleBusIds", updatedSelection, { shouldValidate: true });
  };

  return (
    <Card>
      <div className="flex items-center gap-2 p-4">
        <CheckCircle className="h-5 w-5" />
        <CardTitle className="text-lg">선택한 셔틀버스</CardTitle>
      </div>
      <CardContent>
        <div className="space-y-2">
          {selectedBusIds.map((busId) => {
            const bus = shuttleBuses.find((b) => b.id === busId);
            if (!bus) return null;

            // 버스의 실제 날짜 계산 (KST 기준)
            const busDate = getKSTDateString(bus.departureTime);

            return (
              <div
                key={bus.id}
                className="flex justify-between items-center p-2 bg-muted rounded-md"
              >
                <div>
                  <p className="font-semibold">{bus.name}</p>
                  <p className="text-sm text-gray-600 break-words whitespace-pre-line">
                    출발 :{" "}
                    {bus.departureTime
                      ? new Date(bus.departureTime).toLocaleTimeString(
                          "ko-KR",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                            timeZone: "Asia/Seoul",
                          }
                        )
                      : "미정"}
                    {bus.arrivalTime && (
                      <>
                        {"\n"}
                        도착 :{" "}
                        {new Date(bus.arrivalTime).toLocaleTimeString(
                          "ko-KR",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                            timeZone: "Asia/Seoul",
                          }
                        )}
                      </>
                    )}
                  </p>
                  {/* 버스의 실제 날짜 표시 */}
                  <p className="text-sm text-gray-500">
                    날짜: {formatDate(busDate)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span>{bus.price.toLocaleString()}원</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleBusSelection(bus.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
          {isPartialParticipation && (
            <div className="mt-4 text-sm text-red-500">
              부분참 셔틀버스는 저녁 시간 이후에 운행되기 때문에, 저녁
              식사를 신청한 경우 일정 변동 처리를 위해 각 부서
              행정간사님에게 문의해주세요.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
