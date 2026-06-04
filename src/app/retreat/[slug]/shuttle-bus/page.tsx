"use client";

import { useSlug } from "@/hooks/use-slug";
import { ShuttleBusRegistrationForm } from "@/components/shuttle-bus/shuttle-bus-registration-form";
import { Skeleton } from "@/components/ui/skeleton";
import RetreatCard from "@/components/retreat/retreat-card";
import {
  useRetreatInfo,
  useShuttleBusInfo,
} from "@/hooks/use-retreat-queries";
import { useRegistrationGate } from "@/hooks/use-registration-gate";
import { formatRetreatDates } from "@/lib/format-retreat-dates";
import { getKSTFullYear, getRetreatSeason } from "@/lib/date-utils";

export default function ShuttleBusPage() {
  const slug = useSlug();

  const {
    data: retreatData,
    isLoading: retreatLoading,
    isError: retreatError,
  } = useRetreatInfo(slug);
  const { data: shuttleBusData, isLoading: busLoading } = useShuttleBusInfo(slug);

  // 신청 기간이 지났으면 실패 페이지로 리다이렉트
  useRegistrationGate(slug, retreatData?.payment);

  if (retreatLoading || busLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="mb-8">
          <Skeleton className="w-full h-64" />
        </div>
        <Skeleton className="w-full h-[600px]" />
      </div>
    );
  }

  if (retreatError || !retreatData) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-red-500 text-lg">수양회 정보를 찾을 수 없습니다.</p>
      </div>
    );
  }

  if (!shuttleBusData) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-red-500 text-lg">셔틀버스 정보를 찾을 수 없습니다.</p>
      </div>
    );
  }

  const year = retreatData.schedule[0]
    ? getKSTFullYear(retreatData.schedule[0].time)
    : new Date().getFullYear();
  const season = retreatData.schedule[0]
    ? getRetreatSeason(retreatData.schedule[0].time)
    : "여름";

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <RetreatCard
          name={retreatData.retreat.name}
          year={year}
          season={season}
          dates={formatRetreatDates(retreatData.schedule)}
          location={retreatData.retreat.location}
          main_verse={retreatData.retreat.mainVerse}
          main_speaker={retreatData.retreat.mainSpeaker}
          poster_url={retreatData.retreat.posterUrl}
          form_kind="셔틀버스"
        />
      </div>

      <ShuttleBusRegistrationForm
        retreatData={retreatData}
        shuttleBusData={shuttleBusData}
        retreatSlug={slug}
      />
    </div>
  );
}
