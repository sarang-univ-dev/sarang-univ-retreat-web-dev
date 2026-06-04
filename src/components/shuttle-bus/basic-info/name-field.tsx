import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "lucide-react";
import { useShuttleBusForm } from "@/hooks/use-shuttle-bus-form";
import { SHUTTLE_BUS_FIELDS } from "@/schemas/registration";

export function NameField() {
  const {
    register,
    formState: { errors },
  } = useShuttleBusForm();

  return (
    <div className="space-y-2">
      <Label htmlFor={SHUTTLE_BUS_FIELDS.name} className="flex items-center">
        <User className="mr-2" />
        이름
      </Label>
      <Input id={SHUTTLE_BUS_FIELDS.name} placeholder="홍길동" {...register("name")} />
      {errors.name && (
        <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
      )}
    </div>
  );
}
