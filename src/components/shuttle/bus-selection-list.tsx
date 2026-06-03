import { useMemo } from "react";
import { Controller } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { ArrowRight, Clock } from "lucide-react";
import { formatDate } from "@/lib/format-date";
import { getKSTDateString } from "@/lib/date-utils";
import { useShuttleInfoContext } from "@/components/shuttle/shuttle-info-context";
import { useBusForm } from "@/hooks/use-bus-form";

export function BusSelectionList() {
  const { busData } = useShuttleInfoContext();
  const { control } = useBusForm();
  const retreatLocation = busData.retreat.location;

  // 셔틀버스를 시간순으로 정렬하고 날짜별로 그룹화 (이 목록의 유일한 소비자)
  const busesByDate = useMemo(() => {
    // 시간순 정렬
    const sortedBuses = busData.shuttleBuses.toSorted(
      (a, b) =>
        new Date(a.departureTime).getTime() -
        new Date(b.departureTime).getTime()
    );

    // 날짜별 그룹화
    const grouped: Record<string, typeof sortedBuses> = {};
    sortedBuses.forEach((bus) => {
      const dateStr = getKSTDateString(bus.departureTime);
      if (!grouped[dateStr]) {
        grouped[dateStr] = [];
      }
      grouped[dateStr].push(bus);
    });

    // 날짜순으로 정렬된 배열로 변환
    return Object.entries(grouped)
      .toSorted(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([date, buses]) => ({ date, buses }));
  }, [busData.shuttleBuses]);

  return (
    <Controller
      control={control}
      name="shuttleBusIds"
      render={({ field }) => {
        const selectedBusIds = field.value;

        const handleBusSelection = (busId: number) => {
          const updatedSelection = selectedBusIds.includes(busId)
            ? selectedBusIds.filter((item) => item !== busId)
            : [...selectedBusIds, busId];
          field.onChange(updatedSelection);
        };

        return (
          <div className="space-y-6">
            {busesByDate.map(({ date, buses }) => (
              <div key={date} className="space-y-3">
                <h3 className="text-lg font-semibold text-primary border-b pb-2">
                  {formatDate(date)}
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {buses.map((bus) => (
                    <Card
                      key={bus.id}
                      className={cn(
                        "cursor-pointer transition-all",
                        selectedBusIds.includes(bus.id)
                          ? "border-primary"
                          : "hover:border-primary"
                      )}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <Checkbox
                            id={`bus-${bus.id}`}
                            checked={selectedBusIds.includes(bus.id)}
                            onCheckedChange={() => handleBusSelection(bus.id)}
                          />
                          <Label
                            htmlFor={`bus-${bus.id}`}
                            className="flex flex-col cursor-pointer flex-grow"
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <div className="flex items-center gap-2 flex-wrap min-w-0">
                                  <span className="font-medium break-words text-sm sm:text-base">
                                    {bus.name}
                                  </span>
                                  {bus.direction ===
                                  "FROM_CHURCH_TO_RETREAT" ? (
                                    <div className="space-x-1 sm:space-x-2 inline-flex items-center flex-wrap break-words text-xs sm:text-sm">
                                      <span>{"(서초 사랑의교회 참나리길"}</span>
                                      <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                                      <span>{retreatLocation})</span>
                                    </div>
                                  ) : (
                                    <div className="space-x-1 sm:space-x-2 inline-flex items-center flex-wrap break-words text-xs sm:text-sm">
                                      <span>({retreatLocation}</span>
                                      <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                                      <span>{"서초 사랑의교회 참나리길)"}</span>
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <span className="text-sm sm:text-base font-semibold whitespace-nowrap">
                                    {bus.price.toLocaleString()}원
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 flex-wrap">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                                  출발:{" "}
                                  {bus.departureTime
                                    ? new Date(
                                        bus.departureTime
                                      ).toLocaleTimeString("ko-KR", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: true,
                                        timeZone: "Asia/Seoul",
                                      })
                                    : "미정"}
                                </div>
                                {bus.arrivalTime && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                                    도착:{" "}
                                    {new Date(
                                      bus.arrivalTime
                                    ).toLocaleTimeString("ko-KR", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      hour12: true,
                                      timeZone: "Asia/Seoul",
                                    })}
                                  </div>
                                )}
                              </div>
                            </div>
                          </Label>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      }}
    />
  );
}
