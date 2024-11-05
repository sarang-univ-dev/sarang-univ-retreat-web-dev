// File: components/registration-complete.tsx

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, CreditCard, Wallet, User, Copy } from "lucide-react";

interface RegistrationCompleteProps {
  name: string | null;
  gender: string | null;
  phone: string | null;
  price: number | null;
}

export function RegistrationComplete({
  name,
  gender,
  phone,
  price
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
          <p className="mb-6">
            <span className="font-semibold">{name}</span>{" "}
            {getGenderText(gender)}님,{" "}
            <span className="font-semibold">{phone}</span>{" "}
            <span className="text-muted-foreground">
              으로 수양회 신청 접수 문자가 발송되었습니다. 이후 입금 과정을
              진행해주세요.
            </span>
          </p>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">입금 안내</h3>
                <div className="space-y-2">
                  <p className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    <span className="font-medium">입금 계좌:</span>{" "}
                    <span>신한은행 110-123-456789</span>
                    <button
                      onClick={() =>
                        navigator.clipboard.writeText("110-123-456789")
                      }
                      className="p-1 hover:bg-gray-100 rounded-md"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </p>
                  <p className="flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    <span className="font-medium">입금 금액:</span>{" "}
                    {price?.toLocaleString()}원
                  </p>
                  <p className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="font-medium">입금자명:</span>{" "}
                    <span>{name}</span>
                    <button
                      onClick={() => navigator.clipboard.writeText(name || "")}
                      className="p-1 hover:bg-gray-100 rounded-md"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    * 입금자명을 확인해주시기 바랍니다.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    * 입금 시각을 기준으로 수양회 참석 여부가 결정됩니다.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    * 문자 메세지에 있는 링크를 통해 버스 티켓 신청을 이어서 진행해주세요.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
