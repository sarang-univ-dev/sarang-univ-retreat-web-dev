import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "lucide-react";
import { retreatRegistrationSchema } from "@/schemas/registration";
import type { z } from "zod";

type RetreatFormValues = z.input<typeof retreatRegistrationSchema>;

export function NameField() {
  const {
    register,
    formState: { errors },
  } = useFormContext<RetreatFormValues>();

  return (
    <div className="space-y-2">
      <Label htmlFor="name" className="flex items-center">
        <User className="mr-2" />
        이름
      </Label>
      <Input id="name" placeholder="이조원" {...register("name")} />
      {errors.name && (
        <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
      )}
    </div>
  );
}
