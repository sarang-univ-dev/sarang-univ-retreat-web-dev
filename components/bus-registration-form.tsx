"use client";

import React, {useEffect} from "react";

import {useState, useMemo} from "react";
import {Button} from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Checkbox} from "@/components/ui/checkbox";
import {cn} from "@/lib/utils";
import type {RetreatInfo, ShuttleBusInfo, TRetreatRegistrationSchedule} from "@/types";
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
    Bus,
} from "lucide-react";
import {formatDate} from "@/utils/formatDate";
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
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {server} from "@/utils/axios";
import {useRouter} from "next/navigation";


interface BusRegistrationFormProps {
    retreatData: RetreatInfo;
    busData: ShuttleBusInfo;
    retreatSlug: string;
}


export function BusRegistrationFormComponent({
retreatData,
busData,
retreatSlug
}: BusRegistrationFormProps) {
    const router = useRouter();
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [availableGrades, setAvailableGrades] = useState<RetreatInfo["univGroupAndGrade"][number]["grades"]>([]);

    const [formData, setFormData] = useState<{
        name: string;
        phoneNumber: string;
        gender: string;
        univGroup: string;
        grade: string;
        retreatId: number;
        shuttleBusIds: number[];
        isAdminContact: boolean
    }>({
        name: "",
        phoneNumber: "",
        gender: "",
        univGroup: "",
        grade: "",
        retreatId: -1,
        shuttleBusIds: [],
        isAdminContact: false
    });

    const [formErrors, setFormErrors] = useState<{
        name: string;
        phoneNumber: string;
        gender: string;
        univGroup: string;
        grade: string;
    }>({
        name: "",
        phoneNumber: "",
        gender: "",
        univGroup: "",
        grade: "",
    });

    // 전화번호 유효성 체크
    const isValidPhoneNumber = (phone: string) => {
        const phoneRegex = /^\d{3}-\d{4}-\d{4}$/;
        return phoneRegex.test(phone);
    };

    // 부분참여 여부
    const isPartialParticipation = useMemo(() => {
        const buses = busData.shuttleBuses
        if (buses.length < 2) return false; // 데이터가 없거나 1개면 부분참여 판단 불가

        const firstBusId = buses[0].id;
        const lastBusId = buses[buses.length - 1].id;

        return formData.shuttleBusIds.some((id) => id !== firstBusId && id !== lastBusId);
    }, [formData.shuttleBusIds, busData]);


    // 날짜별 스케줄을 정리
    const schedulesByDate = useMemo(() => {
        return busData.retreatRegisterSchedules.reduce((acc, schedule) => {
            const dateStr = new Date(schedule.time).toLocaleDateString("sv-SE", {
                timeZone: "Asia/Seoul",
            }); // "YYYY-MM-DD" 형식, 한국 기준

            if (!acc[dateStr]) {
                acc[dateStr] = [];
            }
            acc[dateStr].push(schedule);

            return acc;
        }, {} as Record<string, TRetreatRegistrationSchedule[]>);
    }, []);


    // 사용 가능한 날짜 목록
    const availableDates = useMemo(() => {
        return Object.keys(schedulesByDate).sort();
    }, [schedulesByDate]);

    const validateForm = (): boolean => {
        const errors = {
            univGroup: "",
            grade: "",
            name: "",
            phoneNumber: "",
            gender: ""
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

    // 선택한 날짜의 스케줄을 정렬
    const sortedSchedules = useMemo(() => {
        if (!selectedDate) {
            setSelectedDate(availableDates[0]) // 페이지 들어왔을 때 첫번째 가능한 날짜 default 선택
            return [];
        }
        return schedulesByDate[selectedDate].sort((a, b) => a.id - b.id);
    }, [selectedDate, schedulesByDate]);


    const totalPrice = useMemo(() => {
        const buses = busData.shuttleBuses;

        return formData.shuttleBusIds.reduce((total, busId) => {
            const bus = buses.find((b) => b.id === busId);
            return total + (bus?.price || 0);
        }, 0);
    }, [formData.shuttleBusIds, busData]);

    // 이벤트 타입에 따른 아이콘 매핑
    const eventIcons = {
        BREAKFAST: <Coffee className="w-5 h-5"/>,
        LUNCH: <Utensils className="w-5 h-5"/>,
        DINNER: <Utensils className="w-5 h-5"/>,
        SLEEP: <Moon className="w-5 h-5"/>,
    };

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

    const handleGenderChange = (value: string) => {
        setFormData({...formData, gender: value});
        setFormErrors({ ...formErrors, gender: "" });
    };

    const handleUnivGroupChange = (value: string) => {
        const selectedGroup = retreatData.univGroupAndGrade.find(
            (group) => group.univGroupId.toString() === value
        );
        setAvailableGrades(selectedGroup ? selectedGroup.grades : []);
        setFormData({...formData, univGroup: value, grade: ""});
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
            await confirmSubmission();
        }
    };

    const confirmSubmission = async () => {

        const submissionData = {
            name: formData.name,
            phoneNumber: formData.phoneNumber,
            gender: formData.gender,
            gradeId: Number(formData.grade),
            retreatId: retreatData.retreat.id,
            shuttleBusIds: formData.shuttleBusIds,
            isAdminContact: formData.isAdminContact
        };

        const response = await server.post(
            `/api/v1/retreat/${retreatSlug}/shuttle-bus/register`,
            submissionData
        );

        if (response.status >= 200 && response.status <= 399) {
            localStorage.setItem(
                "registrationData",
                JSON.stringify({
                    name: formData.name,
                    phoneNumber: formData.phoneNumber,
                    gender: formData.gender,
                    gradeId: Number(formData.grade),
                    retreatId: retreatData.retreat.id,
                    shuttleBusIds: formData.shuttleBusIds,
                    isAdminContact: formData.isAdminContact
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
                })
            );

            router.push(`/retreat/${retreatSlug}/registration-failure`);
        }

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
                        <div className="space-y-2 min-h-[88px]">
                            <Label htmlFor="name" className="flex items-center gap-2">
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

                        <div className="space-y-2 min-h-[88px]">
                            <Label htmlFor="phone" className="flex items-center gap-2">
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2 min-h-[88px]">
                            <Label htmlFor="univGroup" className="flex items-center">
                                부서
                            </Label>
                            <Select
                                onValueChange={handleUnivGroupChange}
                                value={formData.univGroup}
                            >
                                <SelectTrigger className="h-10">
                                    <SelectValue placeholder="부서를 선택해주세요"/>
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

                        <div className="space-y-2 min-h-[88px]">
                            <Label htmlFor="grade" className="flex items-center">
                                학년
                            </Label>
                            <Select
                                onValueChange={(value: string) => {
                                    setFormData({...formData, grade: value});
                                    setFormErrors((prevErrors) => ({ ...prevErrors, grade: "" }));
                                }}
                                value={formData.grade}
                                disabled={!formData.univGroup}
                            >
                                <SelectTrigger className="h-10">
                                    <SelectValue placeholder="학년을 선택해주세요"/>
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

                        <div className="space-y-2 min-h-[88px]">
                            <Label htmlFor="gender" className="flex items-center">
                                성별
                            </Label>
                            <Select
                                onValueChange={handleGenderChange}
                                value={formData.gender}
                            >
                                <SelectTrigger className="h-10">
                                    <SelectValue placeholder="성별을 선택해주세요"/>
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
                    </div>


                    {/* 날짜 선택 - Tabs 컴포넌트 사용 */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <CalendarDays className="h-5 w-5"/>
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
                                        {
                                            <div>
                                                {/* Separator line */}
                                                <hr className="my-4 border-t border-gray-300"/>

                                                {/* 다음 스케줄로의 전환에 해당하는 버스 선택 카드 */}
                                                <div className="mt-2">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Bus className="h-5 w-5"/>
                                                        <span className="font-medium">
                                                          이동을 위한 버스 선택
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {busData.shuttleBuses
                                                            .filter((bus) => {
                                                                const busDate = new Date(bus.departureTime).toLocaleDateString("sv-SE", {
                                                                    timeZone: "Asia/Seoul",
                                                                }); // ex: "2024-07-02"
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
                                                                        <div
                                                                            className="flex items-center gap-4">
                                                                            <Checkbox
                                                                                id={`bus-${bus.id}`}
                                                                                checked={formData.shuttleBusIds.includes(bus.id)}
                                                                                onCheckedChange={() =>
                                                                                    handleBusSelection(bus.id)
                                                                                }
                                                                            />
                                                                            <Label
                                                                                htmlFor={`bus-${bus.id}`}
                                                                                className="flex flex-col cursor-pointer flex-grow"
                                                                            >
                                                                                <div
                                                                                    className="flex items-center justify-between mb-2">
                                                                                    <div
                                                                                        className="flex items-center gap-2">
                                                                                        {bus.direction ===
                                                                                        "FROM_CHURCH_TO_RETREAT" ? (
                                                                                            <ArrowRight
                                                                                                className="h-4 w-4"/>
                                                                                        ) : (
                                                                                            <ArrowLeft
                                                                                                className="h-4 w-4"/>
                                                                                        )}
                                                                                        <span className="font-medium">
                                                                                            {bus.name}
                                                                                        </span>
                                                                                    </div>
                                                                                    <div
                                                                                        className="flex items-center gap-1">
                                                                                        <DollarSign
                                                                                            className="h-4 w-4"/>
                                                                                        <span>
                                                                                          {bus.price.toLocaleString()}원
                                                                                        </span>
                                                                                    </div>
                                                                                </div>
                                                                                <div
                                                                                    className="flex items-center gap-4 text-sm text-gray-600">
                                                                                    <div
                                                                                        className="flex items-center gap-1">
                                                                                        <Clock
                                                                                            className="h-4 w-4"/>
                                                                                        출발:{" "}
                                                                                        {bus.departureTime
                                                                                            ? new Date(bus.departureTime).toLocaleTimeString("ko-KR", {
                                                                                                hour: "2-digit",
                                                                                                minute: "2-digit",
                                                                                                hour12: false,
                                                                                            })
                                                                                            : "미정"}
                                                                                        {/*{bus.departureTime?.slice(0, 5)}*/}
                                                                                    </div>
                                                                                    <div
                                                                                        className="flex items-center gap-1">
                                                                                        <Clock
                                                                                            className="h-4 w-4"/>
                                                                                        도착:
                                                                                        {bus.arrivalTime
                                                                                            ? new Date(bus.arrivalTime).toLocaleTimeString("ko-KR", {
                                                                                                hour: "2-digit",
                                                                                                minute: "2-digit",
                                                                                                hour12: false,
                                                                                            })
                                                                                            : "미정"}
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
                                        }
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* 선택한 버스 목록 */}
                    {formData.shuttleBusIds.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">선택한 버스</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {formData.shuttleBusIds.map((busId) => {
                                        const bus = busData.shuttleBuses.find((b) => b.id === busId);
                                        if (!bus) return null;
                                        return (
                                            <div
                                                key={bus.id}
                                                className="flex justify-between items-center p-2 bg-muted rounded-md"
                                            >
                                                <div>
                                                    <p className="font-semibold">
                                                        {bus.name}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        출발:
                                                        {bus.departureTime
                                                            ? new Date(bus.departureTime).toLocaleTimeString("ko-KR", {
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                                hour12: false,
                                                            })
                                                            : "미정"}
                                                        - 도착:{" "}
                                                        {bus.arrivalTime
                                                            ? new Date(bus.arrivalTime).toLocaleTimeString("ko-KR", {
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                                hour12: false,
                                                            })
                                                            : "미정"}
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
                                                        onClick={() => handleBusSelection(bus.id)}
                                                    >
                                                        <X className="h-4 w-4"/>
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {isPartialParticipation && (
                                        <div className="mt-4 text-sm text-red-500">
                                            부분참 셔틀버스는 저녁 시간 이후에 운행되기 때문에, 저녁 식사를 신청한 경우 일정 변동 처리를 위해 각 부서 행정간사님에게 문의해주세요.
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

                    {/* 간사 소통 여부 체크 */}
                    {
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">셔틀버스 이외 이동에 대해 간사님과 사전 조율하셨나요?</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-4">
                                <RadioGroup
                                    value={formData.isAdminContact ? "true" : "false"} // boolean → string
                                    onValueChange={(val) =>
                                        setFormData({ ...formData, isAdminContact: val === "true" }) // string → boolean
                                    }
                                    name="isAdminContact"
                                    className="space-y-2"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="true" id="yes"/>
                                        <Label htmlFor="yes">예</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="false" id="no"/>
                                        <Label htmlFor="no">아니요</Label>
                                    </div>
                                </RadioGroup>
                            </CardContent>
                        </Card>
                    }
                    <CardFooter>
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={
                                (!formData.isAdminContact && formData.shuttleBusIds.length === 0) ||
                                !selectedDate ||
                                !formData.name.trim() ||
                                !formData.phoneNumber.trim() ||
                                !isValidPhoneNumber(formData.phoneNumber)
                            }
                        >
                            신청하기 ({totalPrice.toLocaleString()}원)
                        </Button>
                    </CardFooter>
                </form>
            </CardContent>
        </Card>
    );
}
