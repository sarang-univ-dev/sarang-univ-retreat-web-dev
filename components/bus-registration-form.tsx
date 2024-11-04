"use client";

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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { format, addDays } from "date-fns";
import {
  ArrowRight,
  ArrowLeft,
  Clock,
  CalendarDays,
  X,
  DollarSign
} from "lucide-react";
import { formatDate } from "@/utils/formatDate";

// 날짜별 이용 가능한 버스 데이터
const availableBusesByDate = {
  [format(new Date(), "yyyy-MM-dd")]: [
    {
      id: "1",
      direction: "리트릿행",
      departureTime: "오전 08:00",
      arrivalTime: "오전 09:30",
      from: "교회",
      to: "리트릿 센터",
      price: 15000
    },
    {
      id: "2",
      direction: "교회행",
      departureTime: "오후 05:00",
      arrivalTime: "오후 06:30",
      from: "리트릿 센터",
      to: "교회",
      price: 15000
    }
  ],
  [format(addDays(new Date(), 1), "yyyy-MM-dd")]: [
    {
      id: "3",
      direction: "리트릿행", 
      departureTime: "오전 09:00",
      arrivalTime: "오전 10:30",
      from: "교회",
      to: "리트릿 센터",
      price: 15000
    },
    {
      id: "4",
      direction: "교회행",
      departureTime: "오후 04:00",
      arrivalTime: "오후 05:30",
      from: "리트릿 센터",
      to: "교회",
      price: 15000
    }
  ],
  [format(addDays(new Date(), 2), "yyyy-MM-dd")]: [
    {
      id: "5",
      direction: "리트릿행",
      departureTime: "오전 10:00",
      arrivalTime: "오전 11:30",
      from: "교회",
      to: "리트릿 센터",
      price: 15000
    },
    {
      id: "6",
      direction: "교회행",
      departureTime: "오후 03:00",
      arrivalTime: "오후 04:30",
      from: "리트릿 센터",
      to: "교회",
      price: 15000
    }
  ]
};

export function BusRegistrationFormComponent() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedBuses, setSelectedBuses] = useState<string[]>([]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log("폼 제출됨", { selectedDate, selectedBuses });
  };

  const dateOptions = [
    new Date(),
    addDays(new Date(), 1),
    addDays(new Date(), 2)
  ];

  const handleBusSelection = (busId: string) => {
    setSelectedBuses((prev) =>
      prev.includes(busId)
        ? prev.filter((id) => id !== busId)
        : [...prev, busId]
    );
  };

  const removeBus = (busId: string) => {
    setSelectedBuses((prev) => prev.filter((id) => id !== busId));
  };

  const totalPrice = useMemo(() => {
    return selectedBuses.reduce((total, busId) => {
      const bus = Object.values(availableBusesByDate)
        .flat()
        .find((b) => b.id === busId);
      return total + (bus?.price || 0);
    }, 0);
  }, [selectedBuses]);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">수양회 버스 신청</CardTitle>
        <CardDescription>
          교회 수양회 버스 좌석을 예약하세요
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                이름
              </Label>
              <Input id="name" placeholder="이름을 입력하세요" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                이메일
              </Label>
              <Input
                id="email"
                placeholder="이메일을 입력하세요"
                type="email"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              이동 날짜
            </Label>
            <RadioGroup
              value={selectedDate?.toISOString() || ""}
              onValueChange={(value) => setSelectedDate(new Date(value))}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {dateOptions.map((date) => (
                  <Card
                    key={date.toISOString()}
                    className={cn(
                      "cursor-pointer transition-all",
                      selectedDate?.toISOString() === date.toISOString()
                        ? "border-primary"
                        : "hover:border-primary"
                    )}
                  >
                    <CardContent className="p-4">
                      <RadioGroupItem
                        value={date.toISOString()}
                        id={date.toISOString()}
                        className="sr-only"
                      />
                      <Label
                        htmlFor={date.toISOString()}
                        className="flex items-center justify-between cursor-pointer"
                      >
                        <span>{formatDate(date.toISOString())}</span>
                      </Label>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </RadioGroup>
          </div>

          {selectedDate && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                이용 가능한 버스
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableBusesByDate[format(selectedDate, "yyyy-MM-dd")].map(
                  (bus) => (
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
                            id={bus.id}
                            checked={selectedBuses.includes(bus.id)}
                            onCheckedChange={() => handleBusSelection(bus.id)}
                          />
                          <Label
                            htmlFor={bus.id}
                            className="flex flex-col cursor-pointer flex-grow"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {bus.direction === "리트릿행" ? (
                                  <ArrowRight className="h-4 w-4" />
                                ) : (
                                  <ArrowLeft className="h-4 w-4" />
                                )}
                                <span className="font-medium">
                                  {bus.from} → {bus.to}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                <span>{bus.price.toLocaleString()}원</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                출발: {bus.departureTime}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                도착: {bus.arrivalTime}
                              </div>
                            </div>
                          </Label>
                        </div>
                      </CardContent>
                    </Card>
                  )
                )}
              </div>
            </div>
          )}

          {selectedBuses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">선택한 버스</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {selectedBuses.map((busId) => {
                    const bus = Object.values(availableBusesByDate)
                      .flat()
                      .find((b) => b.id === busId);
                    if (!bus) return null;
                    return (
                      <div
                        key={bus.id}
                        className="flex justify-between items-center p-2 bg-muted rounded-md"
                      >
                        <div>
                          <p className="font-semibold">
                            {bus.from} → {bus.to}
                          </p>
                          <p className="text-sm text-gray-600">
                            출발: {bus.departureTime} - 도착: {bus.arrivalTime}
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
          disabled={selectedBuses.length === 0 || !selectedDate}
        >
          신청하기 ({totalPrice.toLocaleString()}원)
        </Button>
      </CardFooter>
    </Card>
  );
}
