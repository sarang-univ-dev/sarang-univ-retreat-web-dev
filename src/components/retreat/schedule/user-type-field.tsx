import { Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UserCheck } from "lucide-react";
import { useRetreatForm } from "@/hooks/use-retreat-form";

/** 신청 유형(해당 없음 / 새가족 / 현역 군지체) 선택. */
export function UserTypeField() {
  const {
    control,
    formState: { errors },
  } = useRetreatForm();

  return (
    <div className="space-y-2 mt-4 mb-4 pt-4">
      <Label htmlFor="userType" className="flex items-center">
        <UserCheck className="mr-2" />
        신청 유형
      </Label>
      <Controller
        control={control}
        name="userType"
        render={({ field }) => (
          <RadioGroup
            value={field.value === null ? "NONE" : field.value}
            onValueChange={(value) =>
              field.onChange(value === "NONE" ? null : value)
            }
            className="flex flex-col space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="NONE" id="userType-none" />
              <Label htmlFor="userType-none">해당 없음</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="NEW_COMER" id="userType-newcomer" />
              <Label htmlFor="userType-newcomer">
                새가족 (부서에서 등반하지 않은 지체)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="SOLDIER" id="userType-soldier" />
              <Label htmlFor="userType-soldier">
                현역 군지체 (사회복무요원, 직업군인, 카투사 제외)
              </Label>
            </div>
          </RadioGroup>
        )}
      />
      {errors.userType && (
        <p className="text-red-500 text-sm mt-1">{errors.userType.message}</p>
      )}
    </div>
  );
}
