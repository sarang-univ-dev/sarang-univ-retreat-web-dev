"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar } from "lucide-react";
import type { RetreatInfo, ShuttleBusInfo } from "@/types";

import {
  shuttleBusRegistrationSchema,
  type ShuttleBusFormValues,
} from "@/schemas/registration";
import { useShuttleBusForm } from "@/hooks/use-shuttle-bus-form";
import { ShuttleBusConsentFields } from "@/components/shuttle-bus/shuttle-bus-consent-fields";
import { ShuttleBusBasicInfoFields } from "@/components/shuttle-bus/shuttle-bus-basic-info-fields";
import { ShuttleBusSelectionList } from "@/components/shuttle-bus/shuttle-bus-selection-list";
import { SelectedShuttleBusesCard } from "@/components/shuttle-bus/selected-shuttle-buses-card";
import { ShuttleBusTotalCard } from "@/components/shuttle-bus/shuttle-bus-total-card";
import { ShuttleBusSubmitSection } from "@/components/shuttle-bus/shuttle-bus-submit-section";
import { ShuttleBusInfoProvider } from "@/components/shuttle-bus/shuttle-bus-info-context";

interface ShuttleBusRegistrationFormProps {
  retreatData: RetreatInfo;
  shuttleBusData: ShuttleBusInfo;
  retreatSlug: string;
}

export function ShuttleBusRegistrationForm({
  retreatData,
  shuttleBusData,
  retreatSlug,
}: ShuttleBusRegistrationFormProps) {
  const form = useForm<ShuttleBusFormValues>({
    resolver: zodResolver(shuttleBusRegistrationSchema),
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
    <ShuttleBusInfoProvider value={{ retreatData, shuttleBusData }}>
      <FormProvider {...form}>
        <ShuttleBusRegistrationFormBody retreatSlug={retreatSlug} />
      </FormProvider>
    </ShuttleBusInfoProvider>
  );
}

function ShuttleBusRegistrationFormBody({ retreatSlug }: { retreatSlug: string }) {
  const { watch } = useShuttleBusForm();
  const hasSelectedBuses = watch("shuttleBusIds").length > 0;

  return (
    <div className="w-full">
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        <ShuttleBusConsentFields />

        {/* 사용자 정보 입력 */}
        <ShuttleBusBasicInfoFields />

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
        <ShuttleBusSelectionList />

        {/* 선택한 버스 목록 */}
        {hasSelectedBuses && <SelectedShuttleBusesCard />}

        {/* 총 금액 표시 */}
        {hasSelectedBuses && <ShuttleBusTotalCard />}

        <ShuttleBusSubmitSection retreatSlug={retreatSlug} />
      </form>
    </div>
  );
}
