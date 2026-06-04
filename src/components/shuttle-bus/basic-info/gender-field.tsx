import { Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserRoundCheck } from "lucide-react";
import { useShuttleBusForm } from "@/hooks/use-shuttle-bus-form";

export function GenderField() {
  const {
    control,
    formState: { errors },
  } = useShuttleBusForm();

  return (
    <div className="space-y-2">
      <Label htmlFor="gender" className="flex items-center">
        <UserRoundCheck className="mr-2" />
        성별
      </Label>
      <Controller
        control={control}
        name="gender"
        render={({ field }) => (
          <Select onValueChange={field.onChange} value={field.value}>
            <SelectTrigger id="gender">
              <SelectValue placeholder="성별을 선택해주세요" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MALE">
                <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  남
                </span>
              </SelectItem>
              <SelectItem value="FEMALE">
                <span className="text-pink-700 bg-pink-50 px-2 py-0.5 rounded">
                  여
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        )}
      />
      {errors.gender && (
        <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>
      )}
    </div>
  );
}
