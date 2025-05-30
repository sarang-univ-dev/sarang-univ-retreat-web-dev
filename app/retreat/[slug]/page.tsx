"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import RetreatCard from "@/components/retreat-card";
import { RetreatRegistrationForm } from "@/components/retreat-registration-form";
import { Skeleton } from "@/components/ui/skeleton";
import type { RetreatInfo } from "@/types";
import { TRetreatRegistrationSchedule } from "@/types";
import { server } from "@/utils/axios";
import axios from "axios";

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

export default function RetreatPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const { slug } = params;

  const [retreatData, setRetreatData] = useState<RetreatInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getData = async () => {
      try {
        const data = await fetchRetreatData(slug as string);
        setRetreatData(data);
        setLoading(false);

        // 현재 시각이 payment 기간 안에 있는지 확인
        checkRegistrationPeriod(data);
      } catch (error) {
        console.error("Failed to fetch retreat data:", error);
        setError("데이터를 불러오는데 실패했습니다.");
        setLoading(false);
      }
    };

    getData();
    // TODO: 이 ESLint 주석 제거하고 의존성 배열 문제 해결하기 (useCallback으로 checkRegistrationPeriod 감싸기)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, router]);

  // 현재 시각이 payment 기간 안에 있는지 확인하는 함수
  const checkRegistrationPeriod = (data: RetreatInfo) => {
    const now = new Date();

    // 현재 시각이 어떤 payment 기간 안에 있는지 확인
    const isWithinPeriod = data.payment.some((payment) => {
      const startAt = new Date(payment.startAt);
      const endAt = new Date(payment.endAt);
      return now >= startAt && now <= endAt;
    });

    // 기간 안에 없으면 오류 페이지로 리다이렉트
    if (!isWithinPeriod) {
      // 가장 빠른 시작 날짜와 가장 늦은 종료 날짜 찾기
      const earliestStart = new Date(
        Math.min(...data.payment.map((p) => new Date(p.startAt).getTime()))
      );
      const latestEnd = new Date(
        Math.max(...data.payment.map((p) => new Date(p.endAt).getTime()))
      );

      // 날짜 정보를 localStorage에 저장
      localStorage.setItem(
        "registrationPeriod",
        JSON.stringify({
          start: earliestStart.toISOString(),
          end: latestEnd.toISOString(),
        })
      );

      router.push(`/retreat/${slug}/registration-failure?reason=period-closed`);
    }
  };

  // 날짜 포맷팅
  const formatDates = (schedules: TRetreatRegistrationSchedule[]) => {
    if (!schedules || schedules.length === 0) return "";

    const dates = [
      ...new Set(
        schedules.map((s) => new Date(s.time).toISOString().split("T")[0])
      ),
    ].sort();

    // "M/D(요일)" 형식으로 날짜 포맷팅
    const formatDate = (dateStr: string, showYear: boolean = true) => {
      const date = new Date(dateStr);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const weekdays = ["주일", "월", "화", "수", "목", "금", "토"];
      const dayOfWeek = weekdays[date.getDay()];
      return showYear
        ? `${year}년 ${month}월 ${day}일(${dayOfWeek})`
        : `${month}월 ${day}일(${dayOfWeek})`;
    };

    // 연속된 날짜 그룹화
    const groupDates = (dates: string[]) => {
      if (dates.length <= 1) return dates.map((date) => formatDate(date, true));

      const result = [];
      let start = dates[0];
      let end = start;
      let previousYear = new Date(start).getFullYear();

      for (let i = 1; i < dates.length; i++) {
        const curr = new Date(dates[i]);
        const prev = new Date(end);

        // 연속된 날짜인지 확인
        if (curr.getTime() - prev.getTime() === 24 * 60 * 60 * 1000) {
          end = dates[i];
        } else {
          if (start === end) {
            // 결과 배열이 비어있으면 첫 번째 그룹이므로 항상 연도 표시
            result.push(
              formatDate(
                start,
                result.length === 0 ||
                  new Date(start).getFullYear() !== previousYear
              )
            );
          } else {
            const startYear = new Date(start).getFullYear();
            const endYear = new Date(end).getFullYear();

            // 결과 배열이 비어있으면 첫 번째 그룹이므로 항상 연도 표시
            const showStartYear: boolean =
              result.length === 0 || startYear !== previousYear;
            // 시작일과 종료일의 연도가 다른 경우 종료일에도 연도 표시
            const showEndYear = startYear !== endYear;

            result.push(
              `${formatDate(start, showStartYear)} ~ ${formatDate(
                end,
                showEndYear
              )}`
            );
          }
          start = dates[i];
          end = start;
          previousYear = new Date(start).getFullYear();
        }
      }

      // 마지막 그룹 추가
      if (start === end) {
        const currentYear = new Date(start).getFullYear();
        result.push(
          formatDate(start, result.length === 0 || currentYear !== previousYear)
        );
      } else {
        const startYear = new Date(start).getFullYear();
        const endYear = new Date(end).getFullYear();

        // 결과 배열이 비어있으면 첫 번째 그룹이므로 항상 연도 표시
        const showStartYear: boolean =
          result.length === 0 || startYear !== previousYear;
        // 시작일과 종료일의 연도가 다른 경우 종료일에도 연도 표시
        const showEndYear = startYear !== endYear;

        result.push(
          `${formatDate(start, showStartYear)} ~ ${formatDate(
            end,
            showEndYear
          )}`
        );
      }

      return result.map((date) => `주후 ${date}`);
    };

    return groupDates(dates).join(", ");
  };

  // 현재 신청 기간 이름 조회
  const getCurrentRegistrationPeriodName = (data: RetreatInfo) => {
    const now = new Date();
    const currentPeriod = data.payment.find((payment) => {
      const startAt = new Date(payment.startAt);
      const endAt = new Date(payment.endAt);

      // payment 기간에 있는 name 반환
      return now >= startAt && now <= endAt;
    });

    return currentPeriod?.name;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="mb-8">
          <Skeleton className="w-full h-64" />
        </div>
        <Skeleton className="w-full h-[600px]" />
      </div>
    );
  }

  if (error || !retreatData) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-red-500 text-lg">
          {error || "수양회 정보를 찾을 수 없습니다."}
        </p>
      </div>
    );
  }

  console.log(
    "Made By 사랑의교회 대학부 여름연합수양회 전산팀\ncredits to 희서, 주호, 성욱, 상묵, 혜성, 진영, 예빈"
  );

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <RetreatCard
          name={retreatData.retreat.name}
          dates={formatDates(retreatData.schedule)}
          location={retreatData.retreat.location}
          main_verse={retreatData.retreat.mainVerse}
          main_speaker={retreatData.retreat.mainSpeaker}
          memo={retreatData.retreat.memo}
          poster_url={retreatData.retreat.posterUrl}
          retreat_registration_name={
            getCurrentRegistrationPeriodName(retreatData) || ""
          }
        />
      </div>

      <RetreatRegistrationForm
        retreatData={retreatData}
        retreatSlug={slug as string}
      />
    </div>
  );
}
