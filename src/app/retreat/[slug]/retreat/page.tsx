"use client";

import { useSlug } from "@/hooks/use-slug";
import RetreatCard from "@/components/retreat/retreat-card";
import { RetreatRegistrationForm } from "@/components/retreat/retreat-registration-form";
import { Skeleton } from "@/components/ui/skeleton";
import { getKSTFullYear, getRetreatSeason } from "@/lib/date-utils";
import { useRetreatInfo } from "@/hooks/use-retreat-queries";
import { useRetreatRegistrationGate } from "@/hooks/use-retreat-registration-gate";
import { getCurrentRegistrationPeriodName } from "@/lib/registration-period";
import { formatRetreatDates } from "@/lib/format-retreat-dates";

export default function RetreatPage() {
  const slug = useSlug();

  const { data: retreatData, isLoading, isError } = useRetreatInfo(slug);

  // 신청 기간이 지났으면 실패 페이지로 리다이렉트
  useRetreatRegistrationGate(slug, retreatData?.payment);

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="mb-8">
          <Skeleton className="h-64 w-full" />
        </div>
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (isError || !retreatData) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-lg text-red-500">
          데이터를 불러오는데 실패했습니다.
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
          retreat_registration_name={
            getCurrentRegistrationPeriodName(retreatData.payment) || ""
          }
        />
      </div>

      <RetreatRegistrationForm retreatData={retreatData} retreatSlug={slug} />
    </div>
  );
}
