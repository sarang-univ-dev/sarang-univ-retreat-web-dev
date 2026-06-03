"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { RetreatInfo } from "@/types";
import {
  retreatRegistrationSchema,
  type RetreatFormValues,
} from "@/schemas/registration";
import { PrivacyConsentCard } from "@/components/forms/privacy-consent-card";
import { BasicInfoFields } from "@/components/forms/basic-info-fields";
import { ScheduleSelectionTable } from "@/components/forms/schedule-selection-table";
import { RetreatSubmitSection } from "@/components/forms/retreat-submit-section";
import { RetreatDataProvider } from "@/components/forms/retreat-derived-context";

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
    <RetreatDataProvider value={{ retreatData }}>
      <FormProvider {...form}>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          <PrivacyConsentCard />

          <BasicInfoFields />

          <ScheduleSelectionTable />

          <RetreatSubmitSection retreatSlug={retreatSlug} />
        </form>
      </FormProvider>
    </RetreatDataProvider>
  );
}
