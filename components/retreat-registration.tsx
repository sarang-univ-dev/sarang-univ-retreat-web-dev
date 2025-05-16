"use client";

import type React from "react";

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
import type { RetreatInfo, TRetreatRegistrationSchedule } from "../types";
import RetreatCard from "./retreat-card";
import { useRouter } from "next/navigation";

// lucide-react 아이콘 추가
import {
  Users,
  Hash,
  User,
  UserRoundCheck,
  Phone,
  UserCheck,
  Calendar,
  Sunrise,
  Sun,
  Sunset,
  Bed,
  TriangleAlert,
  Star
} from "lucide-react";

import { formatDate } from "@/utils/formatDate";
import { useRegistration } from "@/context/retreatRegistrationContext";
import { server } from "@/utils/axios";

interface RetreatRegistrationComponentProps {
  retreatSlug: string;
}

// 이벤트 타입을 한글로 매핑
const EVENT_TYPE_MAP: Record<string, string> = {
  BREAKFAST: "아침",
  LUNCH: "점심",
  DINNER: "저녁",
  SLEEP: "숙박"
};

// 실제 API 호출 함수 using axios
const fetchRetreatData = async (slug: string): Promise<RetreatInfo> => {
  try {
    const response = await server.get(`/api/v1/retreat/${slug}/info`);
    return response.data.retreatInfo;
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

// 그룹화된 날짜를 포맷팅된 문자열으로 변환 (로컬 시간 기준)
const groupDates = (dates: string[]): string[] => {
  const sortedDates = [...dates].sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );
  const groups: string[] = [];
  let currentGroupStart = sortedDates[0];
  let previousDate = new Date(sortedDates[0]);

  for (let i = 1; i < sortedDates.length; i++) {
    const currentDate = new Date(sortedDates[i]);

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
  retreatSlug
}: RetreatRegistrationComponentProps) {
  const router = useRouter();
  const [retreatData, setRetreatData] = useState<RetreatInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [formData, setFormData] = useState<{
    univGroup: string;
    grade: string;
    currentLeaderName: string;
    name: string;
    phoneNumber: string;
    scheduleSelection: number[];
    privacyConsent: boolean;
    gender: string;
  }>({
    univGroup: "",
    grade: "",
    currentLeaderName: "",
    name: "",
    phoneNumber: "",
    scheduleSelection: [],
    privacyConsent: false,
    gender: ""
  });
  const [availableGrades, setAvailableGrades] = useState<
    RetreatInfo["univGroupAndGrade"][number]["grades"]
  >([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [formErrors, setFormErrors] = useState<{
    univGroup: string;
    grade: string;
    currentLeaderName: string;
    name: string;
    phoneNumber: string;
    scheduleSelection: string;
    privacyConsent: string;
    gender: string;
  }>({
    univGroup: "",
    grade: "",
    currentLeaderName: "",
    name: "",
    phoneNumber: "",
    scheduleSelection: "",
    privacyConsent: "",
    gender: ""
  });

  const [isAllScheduleSelected, setIsAllScheduleSelected] = useState(false);

  const { setRegistrationData } = useRegistration();

  useEffect(() => {
    const getData = async () => {
      try {
        const data = await fetchRetreatData(retreatSlug);
        setRetreatData(data);
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
      if (isAllScheduleSelected) {
        setTotalPrice(retreatData.payment[0].totalPrice);
      } else {
        const selectedSchedules = retreatData.schedule.filter(
          (schedule: TRetreatRegistrationSchedule) =>
            formData.scheduleSelection.includes(schedule.id)
        );

        const groupedByDate: Record<string, string[]> = {};
        selectedSchedules.forEach((schedule: TRetreatRegistrationSchedule) => {
          const date = new Date(schedule.time).toLocaleDateString("ko-KR");
          if (!groupedByDate[date]) {
            groupedByDate[date] = [];
          }
          groupedByDate[date].push(schedule.type);
        });

        let eventCount = 0;
        Object.values(groupedByDate).forEach((types) => {
          if (types.includes("DINNER") && types.includes("SLEEP")) {
            eventCount += types.length - 1;
          } else {
            eventCount += types.length;
          }
        });

        const calculatedPrice = Math.min(
          eventCount * retreatData.payment[0].partialPricePerSchedule,
          retreatData.payment[0].totalPrice
        );
        setTotalPrice(calculatedPrice);
      }
    }
  }, [formData.scheduleSelection, isAllScheduleSelected, retreatData]);

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
    const selectedGroup = retreatData.univGroupAndGrade.find(
      (group: RetreatInfo["univGroupAndGrade"][number]) =>
        group.univGroupId.toString() === value
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

    if (updatedSelection.length === retreatData.schedule.length) {
      setIsAllScheduleSelected(true);
    } else {
      setIsAllScheduleSelected(false);
    }
  };

  const handleAllScheduleChange = (checked: boolean) => {
    setIsAllScheduleSelected(checked);
    const allScheduleIds: number[] = retreatData.schedule.map(
      (item: TRetreatRegistrationSchedule) => item.id
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

  const handleGenderChange = (value: string) => {
    setFormData({ ...formData, gender: value });
    setFormErrors({ ...formErrors, gender: "" });
  };

  const handleCurrentLeaderNameChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { value } = e.target;
    setFormData({ ...formData, currentLeaderName: value });
    setFormErrors({ ...formErrors, currentLeaderName: "" });
  };

  const validateForm = (): boolean => {
    const errors = {
      univGroup: "",
      grade: "",
      currentLeaderName: "",
      name: "",
      phoneNumber: "",
      scheduleSelection: "",
      privacyConsent: "",
      gender: ""
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
    if (!formData.currentLeaderName.trim()) {
      errors.currentLeaderName = "현재 GBS/EBS 리더를 입력해주세요";
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
    if (!formData.gender) {
      errors.gender = "성별을 선택해주세요";
      isValid = false;
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
      setIsSubmitting(true);

      const submissionData = {
        grade_id: Number(formData.grade),
        current_leader_name: formData.currentLeaderName,
        schedule_selection: formData.scheduleSelection,
        phone_number: formData.phoneNumber,
        name: formData.name,
        gender: formData.gender
      };

      try {
        await axios.post(
          `https://dev.api.sarang-univ.com/api/v1/retreat/${retreatSlug}/register`,
          submissionData
        );

        setRegistrationData({
          name: formData.name,
          gender: formData.gender,
          phoneNumber: formData.phoneNumber,
          price: totalPrice
        });

        router.push(`/retreats/${retreatSlug}/registration-success`);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        router.push(`/retreats/${retreatSlug}/registration-failure`);
      }
    }
  };

  // Derive unique dates from the schedule for display purposes
  const retreatDatesForDisplay = retreatData
    ? Array.from(
        new Set(
          retreatData.schedule.map(
            (s) => new Date(s.time).toISOString().split("T")[0]
          )
        )
      ).sort()
    : [];

  const groupedDates = groupDates(retreatDatesForDisplay);

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
          name={retreatData.retreat.name}
          dates={formattedGroupedDates.join(", ")} // Join multiple groups with commas
          location={retreatData.retreat.location}
          main_verse={retreatData.retreat.mainVerse}
          main_speaker={retreatData.retreat.mainSpeaker}
          memo={retreatData.retreat.memo}
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
              <div className="flex gap-1.5 items-center">
                {" "}
                <TriangleAlert className="text-red-500" size={20} />{" "}
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

        <div className="grid grid-cols-1 gap-4 pt-4 border-t">
          <h2 className="text-2xl font-bold flex items-center">
            <UserCheck className="mr-2" size={24} />
            기본 정보 입력
          </h2>

          <div className="space-y-2">
            <Label htmlFor="univGroup" className="flex items-center">
              <Users className="mr-2" />
              부서
            </Label>
            <Select
              onValueChange={handleUnivGroupChange}
              value={formData.univGroup}
            >
              <SelectTrigger>
                <SelectValue placeholder="부서를 선택해주세요" />
              </SelectTrigger>
              <SelectContent>
                {retreatData.univGroupAndGrade.map(
                  (group: {
                    univGroupId: number;
                    univGroupName: string;
                    univGroupNumber: number;
                    grades: {
                      id: number;
                      name: string;
                      number: number;
                    }[];
                  }) => (
                    <SelectItem
                      key={group.univGroupId}
                      value={group.univGroupId.toString()}
                    >
                      {group.univGroupNumber}부 {group.univGroupName}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
            {formErrors.univGroup && (
              <p className="text-red-500 text-sm mt-1">
                {formErrors.univGroup}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="grade" className="flex items-center">
              <Hash className="mr-2" />
              학년
            </Label>
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
                {availableGrades.map(
                  (grade: { id: number; name: string; number: number }) => (
                    <SelectItem key={grade.id} value={grade.id.toString()}>
                      {`${grade.number}학년 ${grade.name}`}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
            {formErrors.grade && (
              <p className="text-red-500 text-sm mt-1">{formErrors.grade}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentLeaderName" className="flex items-center">
              <Star className="mr-2" /> 현재 GBS/EBS 리더
            </Label>
            <Input
              id="currentLeaderName"
              name="currentLeaderName"
              value={formData.currentLeaderName}
              onChange={handleCurrentLeaderNameChange}
              placeholder="현재 GBS/EBS 리더 이름을 입력해주세요"
            />
            {formErrors.currentLeaderName && (
              <p className="text-red-500 text-sm mt-1">
                {formErrors.currentLeaderName}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center">
              <User className="mr-2" />
              이름
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="이름을 입력해주세요"
            />
            {formErrors.name && (
              <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender" className="flex items-center">
              <UserRoundCheck className="mr-2" />
              성별
            </Label>
            <Select onValueChange={handleGenderChange} value={formData.gender}>
              <SelectTrigger>
                <SelectValue placeholder="성별을 선택해주세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MALE">남</SelectItem>
                <SelectItem value="FEMALE">여</SelectItem>
              </SelectContent>
            </Select>
            {formErrors.gender && (
              <p className="text-red-500 text-sm mt-1">{formErrors.gender}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="flex items-center">
              <Phone className="mr-2" />
              전화번호
            </Label>
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

        <div className="pt-4 border-t">
          <h2 className="text-2xl font-bold flex items-center mb-4">
            <Calendar className="mr-2" size={24} />
            수양회 일정 선택
          </h2>
          <div className="flex items-center space-x-2 mb-4">
            <Checkbox
              id="allSchedule"
              className="all-schedule-checkbox" // 전참 체크박스에 클래스 이름 추가
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
              {["BREAKFAST", "LUNCH", "DINNER", "SLEEP"].map((eventType) => (
                <TableRow key={eventType}>
                  <TableCell className="flex items-center justify-center whitespace-nowrap sm:px-2 px-1">
                    {eventType === "BREAKFAST" && <Sunrise className="mr-2" />}
                    {eventType === "LUNCH" && <Sun className="mr-2" />}
                    {eventType === "DINNER" && <Sunset className="mr-2" />}
                    {eventType === "SLEEP" && <Bed className="mr-2" />}
                    {EVENT_TYPE_MAP[eventType]}
                  </TableCell>
                  {retreatDatesForDisplay.map((date: string) => {
                    const event: TRetreatRegistrationSchedule | undefined =
                      retreatData.schedule.find(
                        (s: TRetreatRegistrationSchedule) =>
                          new Date(s.time).toLocaleDateString("ko-KR") ===
                            new Date(date).toLocaleDateString("ko-KR") &&
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

        {/* 3. Update the Submit Button to include a spinner */}
        <Button
          type="submit"
          className="w-full text-md flex items-center justify-center"
          disabled={isSubmitting}
        >
          <span>수양회 신청하기</span>
          {isSubmitting && (
            <svg
              className="ml-2 h-5 w-5 animate-spin text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              ></path>
            </svg>
          )}
        </Button>
      </form>
    </div>
  );
}
