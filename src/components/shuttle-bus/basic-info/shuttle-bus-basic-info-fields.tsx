import { UserCheck } from "lucide-react";
import { UnivGroupField } from "@/components/shuttle-bus/basic-info/univ-group-field";
import { GradeField } from "@/components/shuttle-bus/basic-info/grade-field";
import { NameField } from "@/components/shuttle-bus/basic-info/name-field";
import { GenderField } from "@/components/shuttle-bus/basic-info/gender-field";
import { PhoneField } from "@/components/shuttle-bus/basic-info/phone-field";

export function ShuttleBusBasicInfoFields() {
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
    </div>
  );
}
