"use client";

// import axios, { AxiosError } from "axios";
// import { useParams } from "next/navigation";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { server } from "@/utils/axios";
import axios from "axios";
import type { RetreatInfo } from "@/types";
import { BusRegistrationFormComponent } from "@/components/bus-registration-form";

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

export default function BusRegisterPage() {
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

  // const params = useParams<{ slug: string }>();
  // const { slug } = params;

  // const [retreat, setRetreat] = useState<TRetreatInfo | null>(null);
  // const [loading, setLoading] = useState<boolean>(true);
  // const [error, setError] = useState<string | null>(null);

  // useEffect(() => {
  //   if (!slug) return;

  //   const fetchRetreat = async () => {
  //     try {
  //       const response = await axios.get(`/api/v1/retreats/${slug}`);

  //       console.log(response.data);

  //       setRetreat(response.data);
  //     } catch (err) {
  //       if (err instanceof AxiosError) {
  //         setError(
  //           err.response?.data?.error || "데이터를 불러오는데 실패했습니다."
  //         );
  //       } else {
  //         setError("알 수 없는 에러가 발생했습니다.");
  //       }
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchRetreat();
  // }, [slug]);

  // if (loading) return <p>로딩 중...</p>;
  // if (error) return <p>에러: {error}</p>;
  // if (!retreat) return <p>리트리트를 찾을 수 없습니다.</p>;

  return retreatData ? (
    <BusRegistrationFormComponent retreatData={retreatData} />
  ) : null;
}
