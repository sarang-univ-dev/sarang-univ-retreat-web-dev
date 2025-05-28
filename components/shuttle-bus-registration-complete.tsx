"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, CreditCard, Wallet, User, Copy } from "lucide-react";
import { useToastStore } from "@/store/toast-store";

interface ShuttleBusRegistrationCompleteProps {
  name: string;
  gender: string;
  phone: string;
  totalPrice: number;
  univGroup: number;
  gradeNumber: number;
  depositAccount: string;
  depositAccountHolder: string;
}

export function ShuttleBusRegistrationComplete({
  name,
  gender,
  phone,
  totalPrice,
  univGroup,
  gradeNumber,
  depositAccount,
  depositAccountHolder
}: ShuttleBusRegistrationCompleteProps) {
  const addToast = useToastStore((state) => state.add);

  // 성별을 한글로 변환하는 함수
  const getGenderText = (gender: string): string => {
    if (gender === "MALE") return "형제";
    if (gender === "FEMALE") return "자매";
    return "";
  };

  // 클립보드 복사 함수
  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        addToast({
          title: "클립보드로 복사되었습니다",
          variant: "success"
        });
      })
      .catch((err) => {
        addToast({
          title: "복사 실패했습니다",
          variant: "destructive"
        });
        console.error("클립보드 복사 실패:", err);
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="sm:w-full w-4/5 max-w-md mx-2 break-keep break-words">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-xl font-bold sm:text-2xl">
            셔틀버스 신청이 완료되었습니다
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 sm:text-base text-sm">
          <p className="mb-6">
            <span className="font-semibold">{name}</span>{" "}
            {getGenderText(gender)}님,{" "}
            <span className="font-semibold">{phone}</span>{" "}
            <span className="text-muted-foreground">
              으로 셔틀버스 신청 접수 문자가 발송되었습니다. 이후 입금 과정을
              진행해주세요.
            </span>
          </p>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold sm:text-lg text-base mb-2">
                  입금 안내
                </h3>
                <div className="space-y-2">
                  <p className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-2">
                    <span className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      <span className="font-medium">입금 계좌:</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <span>
                        {depositAccount} {depositAccountHolder}
                      </span>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            depositAccount + " " + depositAccountHolder || ""
                          )
                        }
                        className="p-1 hover:bg-gray-100 rounded-md"
                        type="button"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    <span className="font-medium">입금 금액:</span>{" "}
                    <span className="whitespace-nowrap">
                      {totalPrice.toLocaleString()}원
                    </span>
                  </p>
                  <p className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="font-medium">입금자명:</span>{" "}
                    <span className="whitespace-nowrap">
                      {univGroup + "부" + gradeNumber + name}
                    </span>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          univGroup + "부" + gradeNumber + name || ""
                        )
                      }
                      className="p-1 hover:bg-gray-100 rounded-md"
                      type="button"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    * 입금자명을 확인해주시기 바랍니다.
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
