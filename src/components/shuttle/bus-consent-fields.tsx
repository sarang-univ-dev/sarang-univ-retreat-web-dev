import { Controller } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { TriangleAlert, CircleAlert } from "lucide-react";
import { useBusForm } from "@/hooks/use-registration-form";

export function BusConsentFields() {
  const {
    control,
    formState: { errors },
  } = useBusForm();

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex items-center space-x-2 py-1">
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
        <div className="flex items-center space-x-2 py-1">
          <Controller
            control={control}
            name="agreeShuttleOnly"
            render={({ field }) => (
              <Checkbox
                id="agreeShuttleOnly"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <div className="flex gap-1.5 items-center">
            <CircleAlert className="text-red-500" size={20} />
            <label
              htmlFor="agreeShuttleOnly"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              안전을 위해 셔틀 이외 이동은 금지되는 것을 확인하였습니다
            </label>
          </div>
        </div>
        {errors.agreeShuttleOnly && (
          <p className="text-red-500 text-sm mt-1">
            {errors.agreeShuttleOnly.message}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
