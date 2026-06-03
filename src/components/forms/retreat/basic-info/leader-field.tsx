import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";
import { useRetreatForm } from "@/hooks/use-registration-form";

export function LeaderNameField() {
  const {
    register,
    formState: { errors },
  } = useRetreatForm();

  return (
    <div className="space-y-2">
      <Label htmlFor="currentLeaderName" className="flex items-center">
        <Star className="mr-2" /> 현재 GBS/EBS 리더
      </Label>
      <p className="text-sm text-muted-foreground mb-2">
        리더는 본인 이름을 적어주세요 (직책 제외, 이름만 입력)
      </p>
      <Input
        id="currentLeaderName"
        placeholder="김철수"
        {...register("currentLeaderName")}
      />
      {errors.currentLeaderName && (
        <p className="text-red-500 text-sm mt-1">
          {errors.currentLeaderName.message}
        </p>
      )}
    </div>
  );
}
