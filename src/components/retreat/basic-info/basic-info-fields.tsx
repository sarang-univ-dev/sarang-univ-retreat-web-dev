import { UserCheck } from "lucide-react";
import { UnivGroupField } from "@/components/retreat/basic-info/univ-group-field";
import { GradeField } from "@/components/retreat/basic-info/grade-field";
import { NameField } from "@/components/retreat/basic-info/name-field";
import { GenderField } from "@/components/retreat/basic-info/gender-field";
import { PhoneField } from "@/components/retreat/basic-info/phone-field";
import { LeaderNameField } from "@/components/retreat/basic-info/leader-field";

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
