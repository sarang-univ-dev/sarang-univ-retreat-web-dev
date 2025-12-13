"use client";

import React from "react";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type {
  RetreatInfo,
  ShuttleBusInfo,
} from "@/types";
// import { format, addDays, parseISO } from "date-fns";
import {
  ArrowRight,
  Clock,
  X,
  TriangleAlert,
  UserCheck,
  User,
  UserRoundCheck,
  Phone,
  Hash,
  Users,
  Calendar,
  CheckCircle,
  CircleAlert,
} from "lucide-react";
import { formatDate } from "@/utils/formatDate";
import { getKSTDateString } from "@/lib/date-utils";
import {
  Tabs,
  // TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { server } from "@/utils/axios";
import { useRouter } from "next/navigation";
import { getErrorMessage, logError } from "@/utils/errorHandler";

interface BusRegistrationFormProps {
  retreatData: RetreatInfo;
  busData: ShuttleBusInfo;
  retreatSlug: string;
}

export function BusRegistrationFormComponent({
  retreatData,
  busData,
  retreatSlug,
}: BusRegistrationFormProps) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [availableGrades, setAvailableGrades] = useState<
    RetreatInfo["univGroupAndGrade"][number]["grades"]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [refundPolicyConsent, setRefundPolicyConsent] = useState(false);
  const [modalError, setModalError] = useState({
    refundPolicyConsent: "",
  });

  const [formData, setFormData] = useState<{
    name: string;
    phoneNumber: string;
    gender: string;
    univGroup: string;
    grade: string;
    retreatId: number;
    shuttleBusIds: number[];
    isAdminContact: boolean;
    privacyConsent: boolean;
    agreeShuttleOnly: boolean;
  }>({
    name: "",
    phoneNumber: "",
    gender: "",
    univGroup: "",
    grade: "",
    retreatId: -1,
    shuttleBusIds: [],
    isAdminContact: false,
    privacyConsent: false,
    agreeShuttleOnly: false,
  });

  const [formErrors, setFormErrors] = useState<{
    name: string;
    phoneNumber: string;
    gender: string;
    univGroup: string;
    grade: string;
    privacyConsent: string;
    agreeShuttleOnly: string;
  }>({
    name: "",
    phoneNumber: "",
    gender: "",
    univGroup: "",
    grade: "",
    privacyConsent: "",
    agreeShuttleOnly: "",
  });

  // 전화번호 유효성 체크
  const isValidPhoneNumber = (phone: string) => {
    const phoneRegex = /^\d{3}-\d{4}-\d{4}$/;
    return phoneRegex.test(phone);
  };

  // 부분참여 여부
  const isPartialParticipation = useMemo(() => {
    const buses = busData.shuttleBuses;
    if (buses.length < 2) return false; // 데이터가 없거나 1개면 부분참여 판단 불가

    const firstBusId = buses[0].id;
    const lastBusId = buses[buses.length - 1].id;

    return formData.shuttleBusIds.some(
      (id) => id !== firstBusId && id !== lastBusId
    );
  }, [formData.shuttleBusIds, busData]);

  // 셔틀버스 출발 날짜 기준으로 사용 가능한 날짜 목록 생성
  const availableDates = useMemo(() => {
    const busDateSet = new Set(
      busData.shuttleBuses.map((bus) => getKSTDateString(bus.departureTime))
    );
    return Array.from(busDateSet).sort();
  }, [busData.shuttleBuses]);

  const validateForm = (): boolean => {
    const errors = {
      univGroup: "",
      grade: "",
      name: "",
      phoneNumber: "",
      gender: "",
      privacyConsent: "",
      agreeShuttleOnly: "",
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
    if (!formData.privacyConsent) {
      errors.privacyConsent = "개인정보 수집 및 이용에 동의해주세요";
      isValid = false;
      if (!firstErrorElement)
        firstErrorElement = document.getElementById("privacyConsent");
    }
    if (!formData.agreeShuttleOnly) {
      errors.agreeShuttleOnly = "셔틀 이외의 이동 금지 사항에 동의해주세요";
      isValid = false;
      if (!firstErrorElement)
        firstErrorElement = document.getElementById("agreeShuttleOnly");
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

  // 선택된 날짜가 없으면 첫 번째 가능한 날짜로 설정
  if (!selectedDate && availableDates.length > 0) {
    setSelectedDate(availableDates[0]);
  }

  const totalPrice = useMemo(() => {
    const buses = busData.shuttleBuses;

    return formData.shuttleBusIds.reduce((total, busId) => {
      const bus = buses.find((b) => b.id === busId);
      return total + (bus?.price || 0);
    }, 0);
  }, [formData.shuttleBusIds, busData]);

  // input 타입 (name, phoneNumber)
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

  const handlePrivacyConsentChange = (checked: boolean) => {
    setFormData({ ...formData, privacyConsent: checked });
    setFormErrors((prevErrors) => ({ ...prevErrors, privacyConsent: "" }));
  };

  const handleAgreeShuttleOnlyChange = (checked: boolean) => {
    setFormData({ ...formData, agreeShuttleOnly: checked });
    setFormErrors((prevErrors) => ({ ...prevErrors, agreeShuttleOnly: "" }));
  };

  const handleGenderChange = (value: string) => {
    setFormData({ ...formData, gender: value });
    setFormErrors({ ...formErrors, gender: "" });
  };

  const handleUnivGroupChange = (value: string) => {
    const selectedGroup = retreatData.univGroupAndGrade.find(
      (group) => group.univGroupId.toString() === value
    );
    setAvailableGrades(selectedGroup ? selectedGroup.grades : []);
    setFormData({ ...formData, univGroup: value, grade: "" });
    setFormErrors({ ...formErrors, univGroup: "" });
  };

  const handleBusSelection = (busId: number) => {
    const updatedSelection = formData.shuttleBusIds.includes(busId)
      ? formData.shuttleBusIds.filter((item) => item !== busId)
      : [...formData.shuttleBusIds, busId];
    setFormData({ ...formData, shuttleBusIds: updatedSelection });
    // setFormErrors((prevErrors) => ({ ...prevErrors, shuttleBusIds: "" }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      setShowConfirmModal(true);
    }
  };

  const confirmSubmission = async () => {
    const errors = {
      refundPolicyConsent: "",
    };

    let isValid = true;

    if (!refundPolicyConsent) {
      errors.refundPolicyConsent = "해당 내용을 읽고 체크박스에 체크해주세요";
      isValid = false;
    }

    setModalError(errors);

    if (!isValid) {
      return;
    }

    setShowConfirmModal(false);
    setIsSubmitting(true);

    const submissionData = {
      name: formData.name,
      phoneNumber: formData.phoneNumber,
      gender: formData.gender,
      gradeId: Number(formData.grade),
      retreatId: retreatData.retreat.id,
      shuttleBusIds: formData.shuttleBusIds,
      isAdminContact: formData.isAdminContact,
    };

    try {
      const response = await server.post(
        `/api/v1/retreat/${retreatSlug}/shuttle-bus/register`,
        submissionData
      );

      if (response.status >= 200 && response.status <= 399) {
        // 부서 번호를 찾기 위해 univGroup 정보 가져오기
        const selectedGroup = retreatData.univGroupAndGrade.find(
          (group) => group.univGroupId.toString() === formData.univGroup
        );

        // 선택된 학년 정보 가져오기
        const selectedGrade = availableGrades.find(
          (grade) => grade.id.toString() === formData.grade
        );

        localStorage.setItem(
          "shuttleBusRegistrationData",
          JSON.stringify({
            name: formData.name,
            phoneNumber: formData.phoneNumber,
            gender: formData.gender,
            gradeId: Number(formData.grade),
            gradeNumber: selectedGrade?.number,
            retreatId: retreatData.retreat.id,
            shuttleBusIds: formData.shuttleBusIds,
            isAdminContact: formData.isAdminContact,
            totalPrice: totalPrice,
            univGroup: selectedGroup?.univGroupId,
          })
        );

        router.push(`/retreat/${retreatSlug}/shuttle-bus-registration-success`);
      } else {
        console.error("response message: " + response.data.message);

        // 실패 정보를 localStorage에 저장
        localStorage.setItem(
          "registrationFailureData",
          JSON.stringify({
            errorMessage: response.data.message,
            timestamp: new Date().toISOString(),
            retreatName: retreatData.retreat.name,
            registrationType: "bus-registration",
          })
        );

        router.push(`/retreat/${retreatSlug}/registration-failure`);
      }
    } catch (error: unknown) {
      logError(error, "bus-registration");

      // 에러 메시지 추출
      const errorMessage = getErrorMessage(error);

      // 실패 정보를 localStorage에 저장
      localStorage.setItem(
        "registrationFailureData",
        JSON.stringify({
          errorMessage: errorMessage,
          timestamp: new Date().toISOString(),
          retreatName: retreatData.retreat.name,
          registrationType: "bus-registration",
        })
      );

      router.push(`/retreat/${retreatSlug}/registration-failure`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 py-1">
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
            <div className="flex items-center space-x-2 py-1">
              <Checkbox
                id="agreeShuttleOnly"
                checked={formData.agreeShuttleOnly}
                onCheckedChange={handleAgreeShuttleOnlyChange}
              />
              <div className="flex gap-1.5 items-center">
                <CircleAlert className="text-red-500" size={20} />
                <label
                  htmlFor="agreeShuttleOnly"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  안전을 위해 셔틀 이외 이동은 금지되는 것을 확인하였습니다
                </label>
              </div>
            </div>
            {formErrors.agreeShuttleOnly && (
              <p className="text-red-500 text-sm mt-1">
                {formErrors.agreeShuttleOnly}
              </p>
            )}
          </CardContent>
        </Card>

        {/* 사용자 정보 입력 */}
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
                setFormErrors((prevErrors) => ({
                  ...prevErrors,
                  grade: "",
                }));
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
            <Label htmlFor="name" className="flex items-center">
              <User className="mr-2" />
              이름
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="홍길동"
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
            <Label htmlFor="phone" className="flex items-center gap-2">
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
            셔틀버스 선택
          </h2>
          <div className="my-2 text-sm text-bold text-muted-foreground">
            * 금요일 저녁 교회로 복귀하는 셔틀은 없습니다.
          </div>
          <Tabs
            value={selectedDate || availableDates[0]}
            onValueChange={(value) => setSelectedDate(value)}
          >
            <TabsList
              className="flex space-x-2 overflow-x-auto overflow-y-hidden hide-scrollbar"
              style={{
                msOverflowStyle: "none",
                scrollbarWidth: "none",
              }}
            >
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
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {busData.shuttleBuses
                  .filter((bus) => {
                    const busDate = getKSTDateString(bus.departureTime); // KST 기준 YYYY-MM-DD
                    return busDate === selectedDate;
                  })
                  .map((bus) => (
                    <Card
                      key={bus.id}
                      className={cn(
                        "cursor-pointer transition-all",
                        formData.shuttleBusIds.includes(bus.id)
                          ? "border-primary"
                          : "hover:border-primary"
                      )}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <Checkbox
                            id={`bus-${bus.id}`}
                            checked={formData.shuttleBusIds.includes(bus.id)}
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
                                      <span>{busData.retreat.location})</span>
                                    </div>
                                  ) : (
                                    <div className="space-x-1 sm:space-x-2 inline-flex items-center flex-wrap break-words text-xs sm:text-sm">
                                      <span>({busData.retreat.location}</span>
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
                                      })
                                    : "미정"}
                                  {/*{bus.departureTime?.slice(0, 5)}*/}
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
                                      hour12: true
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
          </div>
        )}

        {/* 선택한 버스 목록 */}
        {formData.shuttleBusIds.length > 0 && (
          <Card>
            <div className="flex items-center gap-2 p-4">
              <CheckCircle className="h-5 w-5" />
              <CardTitle className="text-lg">선택한 셔틀버스</CardTitle>
            </div>
            <CardContent>
              <div className="space-y-2">
                {formData.shuttleBusIds.map((busId) => {
                  const bus = busData.shuttleBuses.find((b) => b.id === busId);
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
        )}

        {/* 총 금액 표시 */}
        {formData.shuttleBusIds.length > 0 && (
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

        {/* 간사 소통 여부 체크
        <div className="pt-4 border-t">
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold whitespace-pre-wrap break-words">
                셔틀버스 이외 이동에 대해 간사님과 사전 조율하셨나요?
              </h3>
              <p className="text-sm text-muted-foreground">
                수양회 기간 중 자차 이동은{" "}
                <b>
                  <u>엄격하게 금지</u>
                </b>
                하고 있습니다.
              </p>
            </div>
            <RadioGroup
              value={formData.isAdminContact ? "true" : "false"} // boolean → string
              onValueChange={
                (val) =>
                  setFormData({
                    ...formData,
                    isAdminContact: val === "true",
                  }) // string → boolean
              }
              name="isAdminContact"
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id="yes" />
                <Label htmlFor="yes">예 (간사님과 사전 조율 완료)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id="no" />
                <Label htmlFor="no">아니요 (셔틀버스로만 이동)</Label>
              </div>
            </RadioGroup>
          </div>
        </div> */}
        <Button
          type="submit"
          className="w-full text-md flex items-center justify-center"
          disabled={
            (!formData.isAdminContact && formData.shuttleBusIds.length === 0) ||
            !selectedDate ||
            !formData.name.trim() ||
            !formData.phoneNumber.trim() ||
            !isValidPhoneNumber(formData.phoneNumber) ||
            isSubmitting
          }
        >
          <span>신청하기 ({totalPrice.toLocaleString()}원)</span>
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

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">신청 정보 확인</h3>
            <div className="space-y-2 mb-4">
              <p>
                <span className="font-medium">이름:</span> {formData.name}
              </p>
              <p>
                <span className="font-medium">전화번호:</span>{" "}
                {formData.phoneNumber}
              </p>
              <p>
                <span className="font-medium">총 금액:</span>{" "}
                {totalPrice.toLocaleString()}원
              </p>
              <div>
                <span className="font-medium">선택한 버스 및 출발 시간:</span>
                <div className="mt-1 space-y-1">
                  {formData.shuttleBusIds.map((busId) => {
                    const bus = busData.shuttleBuses.find(
                      (b) => b.id === busId
                    );
                    if (!bus) return null;

                    const departureTime = bus.departureTime
                      ? new Date(bus.departureTime).toLocaleTimeString(
                          "ko-KR",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true
                          }
                        )
                      : "미정";

                    return (
                      <p key={bus.id} className="text-sm text-gray-600">
                        {bus.name} ({departureTime})
                      </p>
                    );
                  })}
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-4 whitespace-normal break-keep wrap-break-word">
              위 정보가 정확한지 확인해주세요. 신청 후에는 수정이 어렵습니다.
            </p>
            <div className="space-y-4 mb-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="refundPolicyConsent"
                    checked={refundPolicyConsent}
                    onCheckedChange={(checked) =>
                      setRefundPolicyConsent(checked as boolean)
                    }
                  />
                  <label
                    htmlFor="refundPolicyConsent"
                    className="text-sm font-medium leading-none whitespace-normal break-keep wrap-break-word"
                  >
                    셔틀 버스 환불은 불가함에 동의합니다.
                  </label>
                </div>
                {modalError.refundPolicyConsent && (
                  <p className="text-red-500 text-sm ml-6">
                    {modalError.refundPolicyConsent}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
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
    </div>
  );
}
