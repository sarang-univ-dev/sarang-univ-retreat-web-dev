import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone } from "lucide-react";
import { useRetreatForm } from "@/hooks/use-registration-form";

export function PhoneField() {
  const {
    register,
    formState: { errors },
  } = useRetreatForm();

  return (
    <div className="space-y-2">
      <Label htmlFor="phoneNumber" className="flex items-center">
        <Phone className="mr-2" />
        전화번호
      </Label>
      <p className="text-sm text-muted-foreground mb-2 break-keep break-words">
        문자 수신이 가능한 번호로 입력해주시기 바랍니다. 수신 가능 번호가 없다면
        각 부서 행정간사님에게 문의해주시기 바랍니다.
      </p>
      <Input
        id="phoneNumber"
        placeholder="010-1234-5678"
        {...register("phoneNumber")}
      />
      {errors.phoneNumber && (
        <p className="text-red-500 text-sm mt-1">{errors.phoneNumber.message}</p>
      )}
    </div>
  );
}
