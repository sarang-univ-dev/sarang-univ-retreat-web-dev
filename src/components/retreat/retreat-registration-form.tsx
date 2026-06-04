"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { RetreatInfo } from "@/types";
import {
  retreatRegistrationSchema,
  type RetreatFormValues,
} from "@/schemas/registration";
import { PrivacyConsentCard } from "@/components/retreat/privacy-consent-card";
import { BasicInfoFields } from "@/components/retreat/basic-info/basic-info-fields";
import { ScheduleSelectionTable } from "@/components/retreat/schedule/schedule-selection-table";
import { RetreatSubmitSection } from "@/components/retreat/submit/retreat-submit-section";
import { RetreatInfoProvider } from "@/components/retreat/retreat-info-context";

interface RetreatRegistrationFormProps {
  retreatData: RetreatInfo;
  retreatSlug: string;
}

export function RetreatRegistrationForm({
  retreatData,
  retreatSlug,
}: RetreatRegistrationFormProps) {
  const form = useForm<RetreatFormValues>({
    resolver: zodResolver(retreatRegistrationSchema),
    mode: "onChange",
    defaultValues: {
      univGroup: "",
      grade: "",
      currentLeaderName: "",
      name: "",
      phoneNumber: "",
      gender: "",
      scheduleSelection: [],
      privacyConsent: false,
      userType: null,
    },
  });

  return (
    <RetreatInfoProvider value={{ retreatData }}>
      <FormProvider {...form}>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          <PrivacyConsentCard />

          <BasicInfoFields />

          <ScheduleSelectionTable />

          <RetreatSubmitSection retreatSlug={retreatSlug} />
        </form>
      </FormProvider>
    </RetreatInfoProvider>
  );
}
