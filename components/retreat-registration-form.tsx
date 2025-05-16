"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/utils/formatDate";
import type { RetreatInfo, TRetreatRegistrationSchedule } from "@/types";
import { server } from "@/utils/axios";

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
  Star,
} from "lucide-react";

// 이벤트 타입을 한글로 매핑
const EVENT_TYPE_MAP: Record<string, string> = {
  BREAKFAST: "아침",
  LUNCH: "점심",
  DINNER: "저녁",
  SLEEP: "숙박",
};

interface RetreatRegistrationFormProps {
  retreatData: RetreatInfo;
  retreatSlug: string;
}

export function RetreatRegistrationForm({
  retreatData,
  retreatSlug,
}: RetreatRegistrationFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [formData, setFormData] = useState<{
    univGroup: string;
    grade: string;
    currentLeaderName: string;
    name: string;
    phoneNumber: string;
    scheduleSelection: number[];
    privacyConsent: boolean;
    gender: string;
    userType: string | null;
  }>({
    univGroup: "",
    grade: "",
    currentLeaderName: "",
    name: "",
    phoneNumber: "",
    scheduleSelection: [],
    privacyConsent: false,
    gender: "",
    userType: null,
  });

  console.log(JSON.stringify(retreatData, null, 2));

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
    userType: string;
  }>({
    univGroup: "",
    grade: "",
    currentLeaderName: "",
    name: "",
    phoneNumber: "",
    scheduleSelection: "",
    privacyConsent: "",
    gender: "",
    userType: "",
  });

  const [isAllScheduleSelected, setIsAllScheduleSelected] = useState(false);

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

  const handleUnivGroupChange = (value: string) => {
    const selectedGroup = retreatData.univGroupAndGrade.find(
      (group) => group.univGroupId.toString() === value
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
          phoneNumber: "010-1234-5678 형식으로 적어주세요",
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
      scheduleSelection: checked ? allScheduleIds : [],
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

  const handleUserTypeChange = (value: string) => {
    setFormData({ ...formData, userType: value === "NONE" ? null : value });
    setFormErrors((prevErrors) => ({ ...prevErrors, userType: "" }));
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
      gender: "",
      userType: "",
    };
    let isValid = true;
    let firstErrorElement: HTMLElement | null = null;

    if (!formData.univGroup) {
      errors.univGroup = "부서를 선택해주세요";
      isValid = false;
      if (!firstErrorElement)
        firstErrorElement = document.getElementById("univGroup");
    }
    if (!formData.grade) {
      errors.grade = "학년을 선택해주세요";
      isValid = false;
      if (!firstErrorElement)
        firstErrorElement = document.getElementById("grade");
    }
    if (!formData.currentLeaderName.trim()) {
      errors.currentLeaderName = "현재 GBS/EBS 리더를 입력해주세요";
      isValid = false;
      if (!firstErrorElement)
        firstErrorElement = document.getElementById("currentLeaderName");
    }
    if (!formData.name.trim()) {
      errors.name = "이름을 입력해주세요";
      isValid = false;
      if (!firstErrorElement)
        firstErrorElement = document.getElementById("name");
    }
    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = "전화번호를 입력해주세요";
      isValid = false;
      if (!firstErrorElement)
        firstErrorElement = document.getElementById("phoneNumber");
    } else {
      const phoneRegex = /^010-\d{4}-\d{4}$/;
      if (!phoneRegex.test(formData.phoneNumber)) {
        errors.phoneNumber = "010-1234-5678 형식으로 적어주세요";
        isValid = false;
        if (!firstErrorElement)
          firstErrorElement = document.getElementById("phoneNumber");
      }
    }
    if (!formData.gender) {
      errors.gender = "성별을 선택해주세요";
      isValid = false;
      if (!firstErrorElement)
        firstErrorElement = document.getElementById("gender");
    }
    if (formData.scheduleSelection.length === 0) {
      errors.scheduleSelection = "수양회 일정을 선택해주세요";
      isValid = false;
      if (!firstErrorElement)
        firstErrorElement = document.getElementById("allSchedule");
    }
    if (!formData.privacyConsent) {
      errors.privacyConsent = "개인정보 수집 및 이용에 동의해주세요";
      isValid = false;
      if (!firstErrorElement)
        firstErrorElement = document.getElementById("privacyConsent");
    }

    setFormErrors(errors);

    // 첫 번째 오류 요소로 스크롤
    if (firstErrorElement) {
      setTimeout(() => {
        firstErrorElement?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      setShowConfirmModal(true);
    }
  };

  const confirmSubmission = async () => {
    setShowConfirmModal(false);
    setIsSubmitting(true);

    const submissionData = {
      name: formData.name,
      phoneNumber: formData.phoneNumber,
      gender: formData.gender,
      gradeId: Number(formData.grade),
      retreatId: retreatData.retreat.id,
      currentLeaderName: formData.currentLeaderName,
      retreatRegistrationScheduleIds: formData.scheduleSelection,
      userType: formData.userType,
    };

    //try {
    // 모의 제출 성공 - 실제 API 호출 없이 처리
    console.log("제출 데이터:", submissionData);

    const response = await server.post(
      `/api/v1/retreat/${retreatSlug}/registration`,
      submissionData
    );

    //THROW ERROR TEST RUN
    // throw {
    //   response: {
    //     status: 400,
    //     data: {
    //       message: "이미 신청한 내역이 있습니다.",
    //     },
    //   },
    // };

    // API 호출 지연 시뮬레이션
    //setTimeout(() => {
    // 성공 페이지를 위해 localStorage에 등록 데이터 저장

    if (response.status >= 200 && response.status <= 399) {
      localStorage.setItem(
        "registrationData",
        JSON.stringify({
          name: formData.name,
          gender: formData.gender,
          phoneNumber: formData.phoneNumber,
          price:
            formData.userType === "NEW_COMER" || formData.userType === "SOLDIER"
              ? "입금 대기"
              : totalPrice,
          userType: formData.userType,
          univGroup: formData.univGroup,
          registrationType: "retreat-registration",
        })
      );

      router.push(`/retreat/${retreatSlug}/registration-success`);
    } else {
      console.error("response message: " + response.data.message);

      // 실패 정보를 localStorage에 저장
      localStorage.setItem(
        "registrationFailureData",
        JSON.stringify({
          errorMessage: response.data.message,
          timestamp: new Date().toISOString(),
          retreatName: retreatData.retreat.name,
          registrationType: "retreat-registration",
        })
      );

      router.push(`/retreat/${retreatSlug}/registration-failure`);
    }

    //}, 1000);
    //} catch (error: any) {

    //}
  };

  // 표시 목적으로 일정에서 고유한 날짜 추출
  const retreatDatesForDisplay = retreatData
    ? Array.from(
        new Set(
          retreatData.schedule.map(
            (s) => new Date(s.time).toISOString().split("T")[0]
          )
        )
      ).sort()
    : [];

  return (
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
              <TriangleAlert className="text-red-500" size={20} />
              <label
                htmlFor="privacyConsent"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                개인정보 수집 및 이용에 동의합니다
              </label>
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
              {retreatData.univGroupAndGrade.map((group) => (
                <SelectItem
                  key={group.univGroupId}
                  value={group.univGroupId.toString()}
                >
                  {group.univGroupNumber}부 {group.univGroupName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formErrors.univGroup && (
            <p className="text-red-500 text-sm mt-1">{formErrors.univGroup}</p>
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
              {availableGrades.map((grade) => (
                <SelectItem key={grade.id} value={grade.id.toString()}>
                  {`${grade.number}학년 ${grade.name}`}
                </SelectItem>
              ))}
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
          <p className="text-sm text-muted-foreground mb-2">
            리더는 본인 이름을 적어주세요
          </p>
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
          <p className="text-sm text-muted-foreground mb-2">
            문자 수신이 가능한 번호로 입력해주시기 바랍니다. 가능한 번호가
            없다면 각 부서 행정간사님에게 요청부탁드립니다.
          </p>
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
                  const event = retreatData.schedule.find(
                    (s) =>
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
                          onCheckedChange={() => handleScheduleChange(event.id)}
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

        <p className="text-sm text-muted-foreground mt-3 mb-3">
          부분참으로 참여하는 경우 저녁식사를 하지 않기 때문에 해당 요일
          숙박부터 체크해주시기 바랍니다.
        </p>

        <div className="space-y-2 mt-4 mb-4 pt-4">
          <Label htmlFor="userType" className="flex items-center">
            <UserCheck className="mr-2" />
            신청 유형
          </Label>
          <RadioGroup
            value={formData.userType === null ? "NONE" : formData.userType}
            onValueChange={handleUserTypeChange}
            className="flex flex-col space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="NONE" id="userType-none" />
              <Label htmlFor="userType-none">해당 없음</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="NEW_COMER" id="userType-newcomer" />
              <Label htmlFor="userType-newcomer">수양회 EBS</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="SOLDIER" id="userType-soldier" />
              <Label htmlFor="userType-soldier">군지체</Label>
            </div>
          </RadioGroup>
          {formErrors.userType && (
            <p className="text-red-500 text-sm mt-1">{formErrors.userType}</p>
          )}
        </div>

        <div className="mt-4 text-right">
          <p className="font-bold">
            총금액:{" "}
            {formData.userType === "NEW_COMER" ||
            formData.userType === "SOLDIER"
              ? "입금 대기"
              : `${totalPrice.toLocaleString()}원`}
          </p>
        </div>
      </div>

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
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">신청 정보 확인</h3>
            <div className="space-y-2 mb-4">
              <p>
                <span className="font-medium">이름:</span> {formData.name}
              </p>
              <p>
                <span className="font-medium">전화번호:</span>{" "}
                {formData.phoneNumber}
              </p>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              위 정보가 정확한지 확인해주세요. 신청 후에는 수정이 어렵습니다.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowConfirmModal(false)}
              >
                취소
              </Button>
              <Button onClick={confirmSubmission} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span>처리 중...</span>
                    <svg
                      className="ml-2 h-4 w-4 animate-spin"
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
                  </>
                ) : (
                  "확인"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
