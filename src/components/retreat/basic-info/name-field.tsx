import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "lucide-react";
import { useRetreatForm } from "@/hooks/use-retreat-form";
import { RETREAT_FIELDS } from "@/schemas/registration";

export function NameField() {
  const {
    register,
    formState: { errors },
  } = useRetreatForm();

  return (
    <div className="space-y-2">
      <Label htmlFor={RETREAT_FIELDS.name} className="flex items-center">
        <User className="mr-2" />
        이름
      </Label>
      <Input id={RETREAT_FIELDS.name} placeholder="이조원" {...register("name")} />
      {errors.name && (
        <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
      )}
    </div>
  );
}
