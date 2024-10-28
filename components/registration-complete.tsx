// File: components/registration-complete.tsx

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

interface RegistrationCompleteProps {
  name: string | null;
  gender: string | null;
  phone: string | null;
}

export function RegistrationComplete({
  name,
  gender,
  phone
}: RegistrationCompleteProps) {
  // Function to convert gender to Korean
  const getGenderText = (gender: string | null): string => {
    if (gender === "male") return "형제";
    if (gender === "female") return "자매";
    return "";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-2">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold">수양회 신청 완료</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-muted-foreground">
            <span className="font-semibold">{name}</span>{" "}
            {getGenderText(gender)}님,{" "}
            <span className="font-semibold">{phone}</span> 으로 수양회 신청 완료
            문자가 발송되었습니다. 이후 입금 과정을 진행해주세요.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
