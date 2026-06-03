"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar } from "lucide-react";
import type { RetreatInfo, ShuttleBusInfo } from "@/types";

import {
  busRegistrationSchema,
  type BusFormValues,
} from "@/schemas/registration";
import { useBusForm } from "@/hooks/use-registration-form";
import { BusConsentFields } from "@/components/forms/bus-consent-fields";
import { BusBasicInfoFields } from "@/components/forms/bus-basic-info-fields";
import { BusSelectionList } from "@/components/forms/bus-selection-list";
import { SelectedBusesCard } from "@/components/forms/selected-buses-card";
import { BusTotalCard } from "@/components/forms/bus-total-card";
import { BusSubmitSection } from "@/components/forms/bus-submit-section";
import { ShuttleInfoProvider } from "@/components/forms/shuttle-info-context";

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
  const form = useForm<BusFormValues>({
    resolver: zodResolver(busRegistrationSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      phoneNumber: "",
      gender: "",
      univGroup: "",
      grade: "",
      shuttleBusIds: [],
      isAdminContact: false,
      privacyConsent: false,
      agreeShuttleOnly: false,
    },
  });

  return (
    <ShuttleInfoProvider value={{ retreatData, busData }}>
      <FormProvider {...form}>
        <BusRegistrationFormBody retreatSlug={retreatSlug} />
      </FormProvider>
    </ShuttleInfoProvider>
  );
}

function BusRegistrationFormBody({ retreatSlug }: { retreatSlug: string }) {
  const { watch } = useBusForm();
  const hasSelectedBuses = watch("shuttleBusIds").length > 0;

  return (
    <div className="w-full">
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        <BusConsentFields />

        {/* 사용자 정보 입력 */}
        <BusBasicInfoFields />

        <div className="pt-4 border-t">
          <h2 className="text-2xl font-bold flex items-center mb-4">
            <Calendar className="mr-2" size={24} />
            셔틀버스 선택
          </h2>
          <div className="my-2 text-sm text-bold text-muted-foreground">
            * 금요일 저녁 교회로 복귀하는 셔틀은 없습니다.
          </div>
        </div>

        {/* 날짜별 버스 목록 */}
        <BusSelectionList />

        {/* 선택한 버스 목록 */}
        {hasSelectedBuses && <SelectedBusesCard />}

        {/* 총 금액 표시 */}
        {hasSelectedBuses && <BusTotalCard />}

        <BusSubmitSection retreatSlug={retreatSlug} />
      </form>
    </div>
  );
}
