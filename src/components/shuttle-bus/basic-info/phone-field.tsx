import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone } from "lucide-react";
import { useShuttleBusForm } from "@/hooks/use-shuttle-bus-form";
import { SHUTTLE_BUS_FIELDS } from "@/schemas/registration";

export function PhoneField() {
  const {
    register,
    formState: { errors },
  } = useShuttleBusForm();

  return (
    <div className="space-y-2">
      <Label htmlFor={SHUTTLE_BUS_FIELDS.phoneNumber} className="flex items-center">
        <Phone className="mr-2" />
        전화번호
      </Label>
      <Input
        id={SHUTTLE_BUS_FIELDS.phoneNumber}
        placeholder="010-1234-5678"
        {...register("phoneNumber")}
      />
      {errors.phoneNumber && (
        <p className="text-red-500 text-sm mt-1">{errors.phoneNumber.message}</p>
      )}
    </div>
  );
}
