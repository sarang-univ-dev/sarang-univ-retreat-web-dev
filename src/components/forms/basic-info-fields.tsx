import { Controller, useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Hash,
  User,
  UserRoundCheck,
  Phone,
  UserCheck,
  Star,
} from "lucide-react";
import { useRetreatData } from "@/components/forms/retreat-derived-context";
import { useAvailableGrades } from "@/components/forms/use-retreat-derived";
import { retreatRegistrationSchema } from "@/schemas/registration";
import type { z } from "zod";

type RetreatFormValues = z.input<typeof retreatRegistrationSchema>;

export function BasicInfoFields() {
  const { retreatData } = useRetreatData();
  const availableGrades = useAvailableGrades();
  const {
    control,
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<RetreatFormValues>();

  const univGroupAndGrade = retreatData.univGroupAndGrade;
  const univGroup = watch("univGroup");

  return (
    <div className="grid grid-cols-1 gap-4 pt-4 border-t">
      <h2 className="text-2xl font-bold flex items-center">
        <UserCheck className="mr-2" size={24} />
        기본 정보 입력
      </h2>

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
              <SelectTrigger>
                <SelectValue placeholder="부서를 선택해주세요" />
              </SelectTrigger>
              <SelectContent>
                {univGroupAndGrade.map((group) => (
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
          <p className="text-red-500 text-sm mt-1">
            {errors.univGroup.message}
          </p>
        )}
      </div>

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
              <SelectTrigger>
                <SelectValue placeholder="학년을 선택해주세요" />
              </SelectTrigger>
              <SelectContent>
                {availableGrades.map((grade) => (
                  <SelectItem
                    key={grade.gradeId}
                    value={grade.gradeId.toString()}
                  >
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
              <SelectTrigger>
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

      <div className="space-y-2">
        <Label htmlFor="phoneNumber" className="flex items-center">
          <Phone className="mr-2" />
          전화번호
        </Label>
        <p className="text-sm text-muted-foreground mb-2 break-keep break-words">
          문자 수신이 가능한 번호로 입력해주시기 바랍니다. 수신 가능 번호가
          없다면 각 부서 행정간사님에게 문의해주시기 바랍니다.
        </p>
        <Input
          id="phoneNumber"
          placeholder="010-1234-5678"
          {...register("phoneNumber")}
        />
        {errors.phoneNumber && (
          <p className="text-red-500 text-sm mt-1">
            {errors.phoneNumber.message}
          </p>
        )}
      </div>

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
    </div>
  );
}
