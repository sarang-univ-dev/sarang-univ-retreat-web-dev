"use client";

import { useSlug } from "@/hooks/use-slug";
import { ShuttleBusRegistrationForm } from "@/components/shuttle-bus/shuttle-bus-registration-form";
import { Skeleton } from "@/components/ui/skeleton";
import RetreatCard from "@/components/retreat/retreat-card";
import { useRetreatInfo, useShuttleBusInfo } from "@/hooks/use-retreat-queries";
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
  const { data: shuttleBusData, isLoading: busLoading } =
    useShuttleBusInfo(slug);

  // 셔틀버스 등록 폼은 수양회 결제 기간과 독립된 셔틀버스 결제 일정을 사용한다.
  useRegistrationGate(slug, shuttleBusData?.shuttleBusPaymentSchedules, {
    allowEmpty: false,
  });

  if (retreatLoading || busLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="mb-8">
          <Skeleton className="h-64 w-full" />
        </div>
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (retreatError || !retreatData) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-lg text-red-500">수양회 정보를 찾을 수 없습니다.</p>
      </div>
    );
  }

  if (!shuttleBusData) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-lg text-red-500">
          셔틀버스 정보를 찾을 수 없습니다.
        </p>
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
