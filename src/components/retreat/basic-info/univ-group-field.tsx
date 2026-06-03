import { Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users } from "lucide-react";
import { useRetreatInfoContext } from "@/components/retreat/retreat-info-context";
import { useRetreatForm } from "@/hooks/use-retreat-form";

export function UnivGroupField() {
  const { retreatData } = useRetreatInfoContext();
  const {
    control,
    setValue,
    formState: { errors },
  } = useRetreatForm();

  return (
    <div className="space-y-2">
      <Label htmlFor="univGroup" className="flex items-center">
        <Users className="mr-2" />
        부서
      </Label>
      <Controller
        control={control}
        name="univGroup"
        render={({ field }) => (
          <Select
            onValueChange={(value) => {
              field.onChange(value);
              // 부서 변경 시 학년 초기화
              setValue("grade", "", { shouldValidate: true });
            }}
            value={field.value}
          >
            <SelectTrigger>
              <SelectValue placeholder="부서를 선택해주세요" />
            </SelectTrigger>
            <SelectContent>
              {retreatData.univGroupAndGrade.map((group) => (
                <SelectItem
                  key={group.univGroupId}
                  value={group.univGroupId.toString()}
                >
                  {group.univGroupNumber}부 {group.univGroupName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      {errors.univGroup && (
        <p className="text-red-500 text-sm mt-1">{errors.univGroup.message}</p>
      )}
    </div>
  );
}
