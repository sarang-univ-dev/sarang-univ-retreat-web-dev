import { Controller, useFormContext } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { TriangleAlert } from "lucide-react";
import { retreatRegistrationSchema } from "@/schemas/registration";
import type { z } from "zod";

type RetreatFormValues = z.input<typeof retreatRegistrationSchema>;

export function PrivacyConsentCard() {
  const {
    control,
    formState: { errors },
  } = useFormContext<RetreatFormValues>();

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex items-center space-x-2">
          <Controller
            control={control}
            name="privacyConsent"
            render={({ field }) => (
              <Checkbox
                id="privacyConsent"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <div className="flex gap-1.5 items-center">
            <TriangleAlert className="text-red-500" size={20} />
            <label
              htmlFor="privacyConsent"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              개인정보 수집 및 이용에 동의합니다
            </label>
          </div>
        </div>
        {errors.privacyConsent && (
          <p className="text-red-500 text-sm mt-1">
            {errors.privacyConsent.message}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
