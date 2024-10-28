"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { TRetreatInfo, TGrade, TUnivGroup, TSchedule } from "../types";
import RetreatCard from "./retreat-card";

interface RetreatRegistrationComponentProps {
  retreatSlug: string;
}

// 실제 API 호출 함수 using axios
const fetchRetreatData = async (slug: string): Promise<TRetreatInfo> => {
  try {
    const response = await axios.get(`/api/v1/retreats/${slug}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data?.message || "Failed to fetch retreat data"
      );
    } else {
      throw new Error("Failed to fetch retreat data");
    }
  }
};

const groupDates = (dates: string[]): string[] => {
  if (dates.length === 0) return [];

  const sortedDates = [...dates].sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );
  const groups: string[] = [];
  let currentGroupStart = sortedDates[0];
  let previousDate = new Date(sortedDates[0]);

  for (let i = 1; i < sortedDates.length; i++) {
    const currentDate = new Date(sortedDates[i]);

    // Check if the current date is consecutive
    if (
      currentDate.getTime() - previousDate.getTime() ===
      24 * 60 * 60 * 1000
    ) {
      previousDate = currentDate;
      continue;
    } else {
      if (currentGroupStart === sortedDates[i - 1]) {
        groups.push(currentGroupStart);
      } else {
        groups.push(`${currentGroupStart}~${sortedDates[i - 1]}`);
      }
      currentGroupStart = sortedDates[i];
      previousDate = currentDate;
    }
  }

  // Add the last group
  if (currentGroupStart === sortedDates[sortedDates.length - 1]) {
    groups.push(currentGroupStart);
  } else {
    groups.push(`${currentGroupStart}~${sortedDates[sortedDates.length - 1]}`);
  }

  return groups;
};

export function RetreatRegistrationComponent({
  retreatSlug: retreatSlug
}: RetreatRegistrationComponentProps) {
  const [retreatData, setRetreatData] = useState<
    TRetreatInfo["retreat"] | null
  >(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [formData, setFormData] = useState<{
    univGroup: string;
    grade: string;
    name: string;
    phoneNumber: string;
    scheduleSelection: number[];
    privacyConsent: boolean;
  }>({
    univGroup: "",
    grade: "",
    name: "",
    phoneNumber: "",
    scheduleSelection: [],
    privacyConsent: false
  });
  const [availableGrades, setAvailableGrades] = useState<TGrade[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [formErrors, setFormErrors] = useState<{
    univGroup: string;
    grade: string;
    name: string;
    phoneNumber: string;
    scheduleSelection: string;
    privacyConsent: string;
  }>({
    univGroup: "",
    grade: "",
    name: "",
    phoneNumber: "",
    scheduleSelection: "",
    privacyConsent: ""
  });

  useEffect(() => {
    const getData = async () => {
      try {
        const data = await fetchRetreatData(retreatSlug);
        setRetreatData(data.retreat);
      } catch (error) {
        console.error("Failed to fetch retreat data:", error);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, [retreatSlug]);

  useEffect(() => {
    if (retreatData) {
      if (formData.scheduleSelection.length === retreatData.schedule.length) {
        // 전참이 선택된 경우 전체 금액을 설정
        setTotalPrice(retreatData.payment.total_price);
      } else {
        // 개별 선택된 일정 수에 따라 금액 계산
        const eventCount = formData.scheduleSelection.length;
        const calculatedPrice = Math.min(
          eventCount * retreatData.payment.partial_price_per_event,
          retreatData.payment.total_price
        );
        setTotalPrice(calculatedPrice);
      }
    }
  }, [formData.scheduleSelection, retreatData]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (!retreatData) {
    return (
      <div className="flex justify-center items-center h-screen">
        Retreat not found
      </div>
    );
  }

  const handleUnivGroupChange = (value: string) => {
    const selectedGroup: TUnivGroup | undefined =
      retreatData.univ_group_and_grade.find(
        (group: TUnivGroup) => group.univ_group_id.toString() === value
      );
    setAvailableGrades(selectedGroup ? selectedGroup.grades : []);
    setFormData({ ...formData, univGroup: value, grade: "" });
    setFormErrors({ ...formErrors, univGroup: "" });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setFormErrors({ ...formErrors, [name]: "" });

    if (name === "phoneNumber") {
      const phoneRegex = /^010-\d{4}-\d{4}$/;
      if (!phoneRegex.test(value)) {
        setFormErrors((prevErrors) => ({
          ...prevErrors,
          phoneNumber: "010-1234-5678 형식으로 적어주세요"
        }));
      } else {
        setFormErrors((prevErrors) => ({ ...prevErrors, phoneNumber: "" }));
      }
    }
  };

  const handleScheduleChange = (id: number) => {
    const updatedSelection = formData.scheduleSelection.includes(id)
      ? formData.scheduleSelection.filter((item) => item !== id)
      : [...formData.scheduleSelection, id];
    setFormData({ ...formData, scheduleSelection: updatedSelection });
    setFormErrors((prevErrors) => ({ ...prevErrors, scheduleSelection: "" }));
  };

  const handleAllScheduleChange = (checked: boolean) => {
    const allScheduleIds: number[] = retreatData.schedule.map(
      (item: TSchedule) => item.id
    );
    setFormData({
      ...formData,
      scheduleSelection: checked ? allScheduleIds : []
    });
    setFormErrors((prevErrors) => ({ ...prevErrors, scheduleSelection: "" }));
  };

  const handlePrivacyConsentChange = (checked: boolean) => {
    setFormData({ ...formData, privacyConsent: checked });
    setFormErrors((prevErrors) => ({ ...prevErrors, privacyConsent: "" }));
  };

  const validateForm = (): boolean => {
    const errors = {
      univGroup: "",
      grade: "",
      name: "",
      phoneNumber: "",
      scheduleSelection: "",
      privacyConsent: ""
    };
    let isValid = true;

    if (!formData.univGroup) {
      errors.univGroup = "부서를 선택해주세요";
      isValid = false;
    }
    if (!formData.grade) {
      errors.grade = "학년을 선택해주세요";
      isValid = false;
    }
    if (!formData.name.trim()) {
      errors.name = "이름을 입력해주세요";
      isValid = false;
    }
    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = "전화번호를 입력해주세요";
      isValid = false;
    } else {
      const phoneRegex = /^010-\d{4}-\d{4}$/;
      if (!phoneRegex.test(formData.phoneNumber)) {
        errors.phoneNumber = "010-1234-5678 형식으로 적어주세요";
        isValid = false;
      }
    }
    if (formData.scheduleSelection.length === 0) {
      errors.scheduleSelection = "수양회 일정을 선택해주세요";
      isValid = false;
    }
    if (!formData.privacyConsent) {
      errors.privacyConsent = "개인정보 수집 및 이용에 동의해주세요";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      const submissionData = {
        ...formData,
        totalPrice,
        grade: Number(formData.grade),
        univGroup: Number(formData.univGroup),
        scheduleSelection: formData.scheduleSelection,
        phoneNumber: formData.phoneNumber,
        name: formData.name,
        privacyConsent: formData.privacyConsent
      };

      console.log("Form submitted:", submissionData);
      // Example axios POST request (uncomment and adjust as needed)
      /*
      try {
        const response = await axios.post('/api/v1/register', submissionData)
        // Handle success (e.g., display a success message, redirect, etc.)
        console.log('Registration successful:', response.data)
      } catch (error: any) {
        console.error('Registration failed:', error.response?.data?.message || error.message)
        // Optionally, set form errors based on the response
      }
      */
    }
  };

  const groupedDates = groupDates(retreatData?.dates || []);

  // 헬퍼 함수: 날짜 문자열을 "M/D(요일)" 형식으로 변환
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1; // 월은 0부터 시작하므로 +1
    const day = date.getDate();

    const weekdays = ["주일", "월", "화", "수", "목", "금", "토"];
    const dayOfWeek = weekdays[date.getDay()];

    return `${month}/${day}(${dayOfWeek})`;
  };

  // 그룹화된 날짜를 포맷팅된 문자열로 변환
  const formattedGroupedDates = groupedDates.map((group) => {
    if (group.includes("~")) {
      const [start, end] = group.split("~");
      return `${formatDate(start)} ~ ${formatDate(end)}`;
    } else {
      return formatDate(group);
    }
  });

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <RetreatCard
          name={retreatData.name}
          dates={formattedGroupedDates.join(", ")}
          location={retreatData.location}
          main_verse={retreatData.main_verse}
          main_speaker={retreatData.main_speaker}
          memo={retreatData.memo}
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="privacyConsent"
                checked={formData.privacyConsent}
                onCheckedChange={handlePrivacyConsentChange}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="privacyConsent"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  개인정보 수집 및 이용에 동의합니다
                </label>
                {/* <p className="text-sm text-muted-foreground">
                  이 상자를 선택하면{" "}
                  <a className="text-primary underline">개인정보 처리방침</a> 에
                  동의하고 귀하의 개인정보 수집 및 사용에 동의하게 됩니다.
                </p> */}
              </div>
            </div>
            {formErrors.privacyConsent && (
              <p className="text-red-500 text-sm mt-1">
                {formErrors.privacyConsent}
              </p>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="univGroup">부서</Label>
            <Select
              onValueChange={handleUnivGroupChange}
              value={formData.univGroup}
            >
              <SelectTrigger>
                <SelectValue placeholder="부서를 선택해주세요" />
              </SelectTrigger>
              <SelectContent>
                {retreatData.univ_group_and_grade.map((group: TUnivGroup) => (
                  <SelectItem
                    key={group.univ_group_id}
                    value={group.univ_group_id.toString()}
                  >
                    {group.univ_group_number}부 {group.univ_group_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formErrors.univGroup && (
              <p className="text-red-500 text-sm mt-1">
                {formErrors.univGroup}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="grade">학년</Label>
            <Select
              onValueChange={(value: string) => {
                setFormData({ ...formData, grade: value });
                setFormErrors((prevErrors) => ({ ...prevErrors, grade: "" }));
              }}
              value={formData.grade}
              disabled={!formData.univGroup}
            >
              <SelectTrigger>
                <SelectValue placeholder="학년을 선택해주세요" />
              </SelectTrigger>
              <SelectContent>
                {availableGrades.map((grade: TGrade) => (
                  <SelectItem
                    key={grade.grade_id}
                    value={grade.grade_id.toString()}
                  >
                    {`${grade.grade_number}학년 ${grade.grade_name}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formErrors.grade && (
              <p className="text-red-500 text-sm mt-1">{formErrors.grade}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">이름</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
            />
            {formErrors.name && (
              <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">전화번호</Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder="010-1234-5678"
            />
            {formErrors.phoneNumber && (
              <p className="text-red-500 text-sm mt-1">
                {formErrors.phoneNumber}
              </p>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">수양회 일정 선택</h2>
          <div className="flex items-center space-x-2 mb-4">
            <Checkbox
              id="allSchedule"
              className="all-schedule-checkbox" // 전참 체크박스에 클래스 이름 추가
              checked={
                formData.scheduleSelection.length ===
                retreatData.schedule.length
              }
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
                <TableHead>일정 선택</TableHead>
                {retreatData.dates.map((date: string) => (
                  <TableHead key={date}>
                    {new Date(date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric"
                    })}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {["BREAKFAST", "LUNCH", "DINNER"].map((eventType) => (
                <TableRow key={eventType}>
                  <TableCell>{eventType}</TableCell>
                  {retreatData.dates.map((date: string) => {
                    // Find the event based on date and type
                    const event: TSchedule | undefined =
                      retreatData.schedule.find(
                        (s: TSchedule) =>
                          s.date &&
                          new Date(s.date)
                            .toISOString()
                            .startsWith(new Date(date).toISOString()) &&
                          s.type === eventType
                      );
                    return (
                      <TableCell key={date}>
                        {event ? (
                          <Checkbox
                            className="schedule-checkbox" // 일정 선택 체크박스에 클래스 이름 추가
                            checked={formData.scheduleSelection.includes(
                              event.id
                            )}
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
          {formErrors.scheduleSelection && (
            <p className="text-red-500 text-sm mt-1">
              {formErrors.scheduleSelection}
            </p>
          )}
          <div className="mt-4 text-right">
            <p className="font-bold">총금액: {totalPrice.toLocaleString()}원</p>
          </div>
        </div>

        <Button type="submit" className="w-full">
          수양회 신청하기
        </Button>
      </form>
    </div>
  );
}
