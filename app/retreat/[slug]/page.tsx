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

    // eslint-disable-next-line no-console
    console.log("response.data.retreatInfo", response.data.retreatInfo);
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
          end: latestEnd.toISOString()
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
      )
    ].sort();

    // "M/D(요일)" 형식으로 날짜 포맷팅
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const weekdays = ["주일", "월", "화", "수", "목", "금", "토"];
      const dayOfWeek = weekdays[date.getDay()];
      return `${month}/${day}(${dayOfWeek})`;
    };

    // 연속된 날짜 그룹화
    const groupDates = (dates: string[]) => {
      if (dates.length <= 1) return dates.map(formatDate);

      const result = [];
      let start = dates[0];
      let end = start;

      for (let i = 1; i < dates.length; i++) {
        const curr = new Date(dates[i]);
        const prev = new Date(end);

        // 연속된 날짜인지 확인
        if (curr.getTime() - prev.getTime() === 24 * 60 * 60 * 1000) {
          end = dates[i];
        } else {
          if (start === end) {
            result.push(formatDate(start));
          } else {
            result.push(`${formatDate(start)} ~ ${formatDate(end)}`);
          }
          start = dates[i];
          end = start;
        }
      }

      // 마지막 그룹 추가
      if (start === end) {
        result.push(formatDate(start));
      } else {
        result.push(`${formatDate(start)} ~ ${formatDate(end)}`);
      }

      return result;
    };

    return groupDates(dates).join(", ");
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

  console.log("entered retreat page");

  console.log(JSON.stringify(retreatData, null, 2));

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
          poster_url={retreatData.retreat.poster_url}
        />
      </div>

      <RetreatRegistrationForm
        retreatData={retreatData}
        retreatSlug={slug as string}
      />
    </div>
  );
}
