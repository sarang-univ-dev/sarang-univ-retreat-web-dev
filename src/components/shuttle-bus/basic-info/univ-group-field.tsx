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
import { useShuttleBusInfoContext } from "@/components/shuttle-bus/shuttle-bus-info-context";
import { useShuttleBusForm } from "@/hooks/use-shuttle-bus-form";

export function UnivGroupField() {
  const { retreatData } = useShuttleBusInfoContext();
  const {
    control,
    setValue,
    formState: { errors },
  } = useShuttleBusForm();

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
            <SelectTrigger id="univGroup">
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
