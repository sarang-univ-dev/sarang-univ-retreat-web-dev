import { UserCheck } from "lucide-react";
import { UnivGroupField } from "@/components/forms/retreat/fields/univ-group-field";
import { GradeField } from "@/components/forms/retreat/fields/grade-field";
import { NameField } from "@/components/forms/retreat/fields/name-field";
import { GenderField } from "@/components/forms/retreat/fields/gender-field";
import { PhoneField } from "@/components/forms/retreat/fields/phone-field";
import { LeaderNameField } from "@/components/forms/retreat/fields/leader-field";

export function BasicInfoFields() {
  return (
    <div className="grid grid-cols-1 gap-4 pt-4 border-t">
      <h2 className="text-2xl font-bold flex items-center">
        <UserCheck className="mr-2" size={24} />
        기본 정보 입력
      </h2>

      <UnivGroupField />
      <GradeField />
      <NameField />
      <GenderField />
      <PhoneField />
      <LeaderNameField />
    </div>
  );
}
