"use client";

import type React from "react";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
// import { format, addDays, parseISO } from "date-fns";
import {
  ArrowRight,
  ArrowLeft,
  Clock,
  CalendarDays,
  X,
  DollarSign,
  Coffee,
  Utensils,
  Moon,
  Bus
} from "lucide-react";
import { formatDate } from "@/utils/formatDate";
import {
  Tabs,
  // TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";

// Bus 데이터 타입 정의
type Bus = {
  id: number;
  retreat_id: number;
  before_schedule_id: number | null;
  after_schedule_id: number | null;
  departure_time: string;
  arrival_time: string;
  price: number;
  departure_location: string;
  arrival_location: string;
  notes: string | null;
  type: "FROM_CHURCH_TO_RETREAT" | "FROM_RETREAT_TO_CHURCH";
  created_at: string;
  updated_at: string;
};

// RegisterSchedule 데이터 타입 정의
type RegisterSchedule = {
  id: number;
  retreat_id: number;
  date: string;
  type: "BREAKFAST" | "LUNCH" | "DINNER" | "SLEEP";
  created_at: string;
};

// Mock 데이터
const buses: Bus[] = [
  {
    id: 1,
    retreat_id: 1,
    before_schedule_id: null,
    after_schedule_id: 1,
    departure_time: "08:00:00",
    arrival_time: "09:30:00",
    price: 7000,
    departure_location: "서초 사랑의교회",
    arrival_location: "총신대 양지캠퍼스",
    notes: null,
    type: "FROM_CHURCH_TO_RETREAT",
    created_at: "2024-11-07T13:06:11.336Z",
    updated_at: "2024-11-07T13:06:11.336Z"
  },
  {
    id: 2,
    retreat_id: 1,
    before_schedule_id: 2,
    after_schedule_id: 3,
    departure_time: "19:30:00",
    arrival_time: "20:30:00",
    price: 7000,
    departure_location: "서초 사랑의교회",
    arrival_location: "총신대 양지캠퍼스",
    notes: null,
    type: "FROM_CHURCH_TO_RETREAT",
    created_at: "2024-11-07T13:06:11.336Z",
    updated_at: "2024-11-07T13:06:11.336Z"
  },
  {
    id: 3,
    retreat_id: 1,
    before_schedule_id: 2,
    after_schedule_id: 3,
    departure_time: "22:00:00",
    arrival_time: "23:00:00",
    price: 7000,
    departure_location: "총신대 양지캠퍼스",
    arrival_location: "서초 사랑의교회",
    notes: null,
    type: "FROM_RETREAT_TO_CHURCH",
    created_at: "2024-11-07T13:06:11.336Z",
    updated_at: "2024-11-07T13:06:11.336Z"
  },
  {
    id: 4,
    retreat_id: 1,
    before_schedule_id: 6,
    after_schedule_id: 7,
    departure_time: "19:30:00",
    arrival_time: "20:30:00",
    price: 7000,
    departure_location: "서초 사랑의교회",
    arrival_location: "총신대 양지캠퍼스",
    notes: null,
    type: "FROM_CHURCH_TO_RETREAT",
    created_at: "2024-11-07T13:06:11.336Z",
    updated_at: "2024-11-07T13:06:11.336Z"
  },
  {
    id: 5,
    retreat_id: 1,
    before_schedule_id: 6,
    after_schedule_id: 7,
    departure_time: "22:00:00",
    arrival_time: "23:00:00",
    price: 7000,
    departure_location: "총신대 양지캠퍼스",
    arrival_location: "서초 사랑의교회",
    notes: null,
    type: "FROM_RETREAT_TO_CHURCH",
    created_at: "2024-11-07T13:06:11.336Z",
    updated_at: "2024-11-07T13:06:11.336Z"
  },
  {
    id: 6,
    retreat_id: 1,
    before_schedule_id: 10,
    after_schedule_id: 11,
    departure_time: "19:30:00",
    arrival_time: "20:30:00",
    price: 7000,
    departure_location: "서초 사랑의교회",
    arrival_location: "총신대 양지캠퍼스",
    notes: null,
    type: "FROM_CHURCH_TO_RETREAT",
    created_at: "2024-11-07T13:06:11.336Z",
    updated_at: "2024-11-07T13:06:11.336Z"
  },
  {
    id: 7,
    retreat_id: 1,
    before_schedule_id: 10,
    after_schedule_id: 11,
    departure_time: "22:00:00",
    arrival_time: "23:00:00",
    price: 7000,
    departure_location: "총신대 양지캠퍼스",
    arrival_location: "서초 사랑의교회",
    notes: null,
    type: "FROM_RETREAT_TO_CHURCH",
    created_at: "2024-11-07T13:06:11.336Z",
    updated_at: "2024-11-07T13:06:11.336Z"
  },
  {
    id: 8,
    retreat_id: 1,
    before_schedule_id: 13,
    after_schedule_id: null,
    departure_time: "17:00:00",
    arrival_time: "18:00:00",
    price: 7000,
    departure_location: "총신대 양지캠퍼스",
    arrival_location: "서초 사랑의교회",
    notes: null,
    type: "FROM_RETREAT_TO_CHURCH",
    created_at: "2024-11-07T13:06:11.336Z",
    updated_at: "2024-11-07T13:06:11.336Z"
  }
];

const registerSchedules: RegisterSchedule[] = [
  {
    id: 1,
    retreat_id: 1,
    date: "2024-12-04",
    type: "LUNCH",
    created_at: "2024-11-07T13:06:11.172Z"
  },
  {
    id: 2,
    retreat_id: 1,
    date: "2024-12-04",
    type: "DINNER",
    created_at: "2024-11-07T13:06:11.172Z"
  },
  {
    id: 3,
    retreat_id: 1,
    date: "2024-12-04",
    type: "SLEEP",
    created_at: "2024-11-07T13:06:11.172Z"
  },
  {
    id: 4,
    retreat_id: 1,
    date: "2024-12-05",
    type: "BREAKFAST",
    created_at: "2024-11-07T13:06:11.172Z"
  },
  {
    id: 5,
    retreat_id: 1,
    date: "2024-12-05",
    type: "LUNCH",
    created_at: "2024-11-07T13:06:11.172Z"
  },
  {
    id: 6,
    retreat_id: 1,
    date: "2024-12-05",
    type: "DINNER",
    created_at: "2024-11-07T13:06:11.172Z"
  },
  {
    id: 7,
    retreat_id: 1,
    date: "2024-12-05",
    type: "SLEEP",
    created_at: "2024-11-07T13:06:11.172Z"
  },
  {
    id: 8,
    retreat_id: 1,
    date: "2024-12-06",
    type: "BREAKFAST",
    created_at: "2024-11-07T13:06:11.172Z"
  },
  {
    id: 9,
    retreat_id: 1,
    date: "2024-12-06",
    type: "LUNCH",
    created_at: "2024-11-07T13:06:11.172Z"
  },
  {
    id: 10,
    retreat_id: 1,
    date: "2024-12-06",
    type: "DINNER",
    created_at: "2024-11-07T13:06:11.172Z"
  },
  {
    id: 11,
    retreat_id: 1,
    date: "2024-12-06",
    type: "SLEEP",
    created_at: "2024-11-07T13:06:11.172Z"
  },
  {
    id: 12,
    retreat_id: 1,
    date: "2024-12-07",
    type: "BREAKFAST",
    created_at: "2024-11-07T13:06:11.172Z"
  },
  {
    id: 13,
    retreat_id: 1,
    date: "2024-12-07",
    type: "LUNCH",
    created_at: "2024-11-07T13:06:11.172Z"
  }
];

export function BusRegistrationFormComponent() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedBuses, setSelectedBuses] = useState<number[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // 날짜별 스케줄을 정리
  const schedulesByDate = useMemo(() => {
    return registerSchedules.reduce((acc, schedule) => {
      if (!acc[schedule.date]) {
        acc[schedule.date] = [];
      }
      acc[schedule.date].push(schedule);
      return acc;
    }, {} as Record<string, RegisterSchedule[]>);
  }, []);

  // 사용 가능한 날짜 목록
  const availableDates = useMemo(() => {
    return Object.keys(schedulesByDate).sort();
  }, [schedulesByDate]);

  // 선택한 날짜의 스케줄을 정렬
  const sortedSchedules = useMemo(() => {
    if (!selectedDate) return [];
    return schedulesByDate[selectedDate].sort((a, b) => a.id - b.id);
  }, [selectedDate, schedulesByDate]);

  // 선택한 날짜의 스케줄 간 버스 기
  const busesByTransition = useMemo(() => {
    if (!selectedDate) return [];

    const transitions: { before: number | null; after: number | null }[] = [];

    // 정렬된 스케줄을 기반으로 전환 목록 생성
    for (let i = 0; i <= sortedSchedules.length; i++) {
      const before = i === 0 ? null : sortedSchedules[i - 1].id;
      const after = i < sortedSchedules.length ? sortedSchedules[i].id : null;
      transitions.push({ before, after });
    }

    // 각 전환에 해당하는 버스 찾기 및 출발 시간 순 정렬
    return transitions
      .map((transition) => {
        const relevantBuses = buses
          .filter(
            (bus) =>
              bus.before_schedule_id === transition.before &&
              bus.after_schedule_id === transition.after
          )
          .sort((a, b) => a.departure_time.localeCompare(b.departure_time)); // 출발 시간 순 정렬
        return {
          transition,
          buses: relevantBuses
        };
      })
      .filter((transition) => transition.buses.length > 0);
  }, [selectedDate, sortedSchedules]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log("폼 제출됨", { name, email, selectedDate, selectedBuses });
    // 여기에 실제 제출 로직 추가
  };

  const handleBusSelection = (busId: number) => {
    setSelectedBuses((prev) =>
      prev.includes(busId)
        ? prev.filter((id) => id !== busId)
        : [...prev, busId]
    );
  };

  const removeBus = (busId: number) => {
    setSelectedBuses((prev) => prev.filter((id) => id !== busId));
  };

  const totalPrice = useMemo(() => {
    return selectedBuses.reduce((total, busId) => {
      const bus = buses.find((b) => b.id === busId);
      return total + (bus?.price || 0);
    }, 0);
  }, [selectedBuses]);

  // 이벤트 타입에 따른 아이콘 매핑
  const eventIcons = {
    BREAKFAST: <Coffee className="w-5 h-5" />,
    LUNCH: <Utensils className="w-5 h-5" />,
    DINNER: <Utensils className="w-5 h-5" />,
    SLEEP: <Moon className="w-5 h-5" />
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">수양회 버스 신청</CardTitle>
        <CardDescription>교회 수양회 버스 좌석을 예약하세요</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 사용자 정보 입력 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                이름
              </Label>
              <Input
                id="name"
                placeholder="이름을 입력하세요"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                이메일
              </Label>
              <Input
                id="email"
                placeholder="이메일을 입력하세요"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* 날짜 선택 - Tabs 컴포넌트 사용 */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              이동 날짜
            </Label>
            <Tabs
              value={selectedDate || availableDates[0]}
              onValueChange={(value) => setSelectedDate(value)}
            >
              <TabsList className="flex space-x-2 overflow-x-auto">
                {availableDates.map((date) => (
                  <TabsTrigger key={date} value={date}>
                    {formatDate(date)}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* 스케줄 및 버스 정보 표시 */}
          {selectedDate && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    스케줄 및 이용 가능한 버스
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sortedSchedules.map((schedule, index) => {
                      // Find buses for the current schedule transition
                      const transitionBuses = busesByTransition.find(
                        (transition) =>
                          (transition.transition.before === schedule.id &&
                            transition.transition.after ===
                              (sortedSchedules[index + 1]?.id || null)) ||
                          (transition.transition.before === schedule.id &&
                            !transition.transition.after) ||
                          (!transition.transition.before &&
                            transition.transition.after === schedule.id)
                      );

                      // Only render the schedule if there are buses for the transition
                      if (!transitionBuses) return null;

                      return (
                        <div key={schedule.id}>
                          {/* 스케줄 이벤트 표시 */}
                          <div className="flex items-center gap-2">
                            {eventIcons[schedule.type]}
                            <span className="font-semibold">
                              {schedule.type.charAt(0) +
                                schedule.type.slice(1).toLowerCase()}
                            </span>
                          </div>

                          {/* Separator line */}
                          <hr className="my-4 border-t border-gray-300" />

                          {/* 다음 스케줄로의 전환에 해당하는 버스 선택 카드 */}
                          <div className="mt-2">
                            <div className="flex items-center gap-2 mb-2">
                              <Bus className="h-5 w-5" />
                              <span className="font-medium">
                                이동을 위한 버스 선택
                              </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {transitionBuses.buses.map((bus) => (
                                <Card
                                  key={bus.id}
                                  className={cn(
                                    "cursor-pointer transition-all",
                                    selectedBuses.includes(bus.id)
                                      ? "border-primary"
                                      : "hover:border-primary"
                                  )}
                                >
                                  <CardContent className="p-4">
                                    <div className="flex items-center gap-4">
                                      <Checkbox
                                        id={`bus-${bus.id}`}
                                        checked={selectedBuses.includes(bus.id)}
                                        onCheckedChange={() =>
                                          handleBusSelection(bus.id)
                                        }
                                      />
                                      <Label
                                        htmlFor={`bus-${bus.id}`}
                                        className="flex flex-col cursor-pointer flex-grow"
                                      >
                                        <div className="flex items-center justify-between mb-2">
                                          <div className="flex items-center gap-2">
                                            {bus.type ===
                                            "FROM_CHURCH_TO_RETREAT" ? (
                                              <ArrowRight className="h-4 w-4" />
                                            ) : (
                                              <ArrowLeft className="h-4 w-4" />
                                            )}
                                            <span className="font-medium">
                                              {bus.departure_location} →{" "}
                                              {bus.arrival_location}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <DollarSign className="h-4 w-4" />
                                            <span>
                                              {bus.price.toLocaleString()}원
                                            </span>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                          <div className="flex items-center gap-1">
                                            <Clock className="h-4 w-4" />
                                            출발:{" "}
                                            {bus.departure_time.slice(0, 5)}
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <Clock className="h-4 w-4" />
                                            도착: {bus.arrival_time.slice(0, 5)}
                                          </div>
                                        </div>
                                      </Label>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* 마지막 전환 (마지막 스케줄 이후) */}
                    {busesByTransition[sortedSchedules.length + 1] && (
                      <div className="mt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Bus className="h-5 w-5" />
                          <span className="font-medium">
                            이동을 위한 버스 선택
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {busesByTransition[
                            sortedSchedules.length + 1
                          ].buses.map((bus) => (
                            <Card
                              key={bus.id}
                              className={cn(
                                "cursor-pointer transition-all",
                                selectedBuses.includes(bus.id)
                                  ? "border-primary"
                                  : "hover:border-primary"
                              )}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-center gap-4">
                                  <Checkbox
                                    id={`bus-${bus.id}`}
                                    checked={selectedBuses.includes(bus.id)}
                                    onCheckedChange={() =>
                                      handleBusSelection(bus.id)
                                    }
                                  />
                                  <Label
                                    htmlFor={`bus-${bus.id}`}
                                    className="flex flex-col cursor-pointer flex-grow"
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        {bus.type ===
                                        "FROM_CHURCH_TO_RETREAT" ? (
                                          <ArrowRight className="h-4 w-4" />
                                        ) : (
                                          <ArrowLeft className="h-4 w-4" />
                                        )}
                                        <span className="font-medium">
                                          {bus.departure_location} →{" "}
                                          {bus.arrival_location}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <DollarSign className="h-4 w-4" />
                                        <span>
                                          {bus.price.toLocaleString()}원
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                      <div className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        출발: {bus.departure_time.slice(0, 5)}
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        도착: {bus.arrival_time.slice(0, 5)}
                                      </div>
                                    </div>
                                  </Label>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* 선택한 버스 목록 */}
          {selectedBuses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">선택한 버스</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {selectedBuses.map((busId) => {
                    const bus = buses.find((b) => b.id === busId);
                    if (!bus) return null;
                    return (
                      <div
                        key={bus.id}
                        className="flex justify-between items-center p-2 bg-muted rounded-md"
                      >
                        <div>
                          <p className="font-semibold">
                            {bus.departure_location} → {bus.arrival_location}
                          </p>
                          <p className="text-sm text-gray-600">
                            출발: {bus.departure_time.slice(0, 5)} - 도착:{" "}
                            {bus.arrival_time.slice(0, 5)}
                          </p>
                          {/* 선택된 버스의 날짜 표시 */}
                          <p className="text-sm text-gray-500">
                            날짜: {formatDate(selectedDate || "")}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>{bus.price.toLocaleString()}원</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeBus(bus.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 총 금액 표시 */}
          {selectedBuses.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">총 금액:</span>
                  <span className="text-lg font-bold">
                    {totalPrice.toLocaleString()}원
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </form>
      </CardContent>
      <CardFooter>
        <Button
          type="submit"
          className="w-full"
          disabled={
            selectedBuses.length === 0 ||
            !selectedDate ||
            !name.trim() ||
            !email.trim()
          }
        >
          신청하기 ({totalPrice.toLocaleString()}원)
        </Button>
      </CardFooter>
    </Card>
  );
}
