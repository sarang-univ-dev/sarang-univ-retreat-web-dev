import { Controller } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { TriangleAlert } from "lucide-react";
import { useRetreatForm } from "@/hooks/use-retreat-form";
import { RETREAT_FIELDS } from "@/schemas/registration";

export function PrivacyConsentCard() {
  const {
    control,
    formState: { errors },
  } = useRetreatForm();

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex items-center space-x-2">
          <Controller
            control={control}
            name="privacyConsent"
            render={({ field }) => (
              <Checkbox
                id={RETREAT_FIELDS.privacyConsent}
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <div className="flex gap-1.5 items-center">
            <TriangleAlert className="text-red-500" size={20} />
            <label
              htmlFor={RETREAT_FIELDS.privacyConsent}
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
