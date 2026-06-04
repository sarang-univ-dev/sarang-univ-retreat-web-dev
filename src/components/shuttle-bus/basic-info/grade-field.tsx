import { Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Hash } from "lucide-react";
import { useAvailableGrades } from "@/hooks/use-shuttle-bus-derived";
import { useShuttleBusForm } from "@/hooks/use-shuttle-bus-form";

export function GradeField() {
  const availableGrades = useAvailableGrades();
  const {
    control,
    watch,
    formState: { errors },
  } = useShuttleBusForm();
  const univGroup = watch("univGroup");

  return (
    <div className="space-y-2">
      <Label htmlFor="grade" className="flex items-center">
        <Hash className="mr-2" />
        학년
      </Label>
      <Controller
        control={control}
        name="grade"
        render={({ field }) => (
          <Select
            onValueChange={field.onChange}
            value={field.value}
            disabled={!univGroup}
          >
            <SelectTrigger id="grade">
              <SelectValue placeholder="학년을 선택해주세요" />
            </SelectTrigger>
            <SelectContent>
              {availableGrades.map((grade) => (
                <SelectItem key={grade.gradeId} value={grade.gradeId.toString()}>
                  {`${grade.gradeNumber}학년 ${grade.gradeName}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      {errors.grade && (
        <p className="text-red-500 text-sm mt-1">{errors.grade.message}</p>
      )}
    </div>
  );
}
