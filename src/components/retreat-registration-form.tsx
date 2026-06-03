"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { RetreatInfo } from "@/types";
import {
  retreatRegistrationSchema,
  type RetreatFormValues,
} from "@/schemas/registration";
import { PrivacyConsentCard } from "@/components/forms/retreat/privacy-consent-card";
import { BasicInfoFields } from "@/components/forms/retreat/basic-info-fields";
import { ScheduleSelectionTable } from "@/components/forms/retreat/schedule-selection-table";
import { RetreatSubmitSection } from "@/components/forms/retreat/retreat-submit-section";
import { RetreatInfoProvider } from "@/components/forms/retreat/retreat-info-context";

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
