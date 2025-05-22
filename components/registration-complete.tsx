"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, CreditCard, Wallet, User, Copy } from "lucide-react";
//import { useToast } from "@/hooks/use-toast";
import { useToastStore } from "@/store/toast-store";

interface RegistrationCompleteProps {
  name: string | null;
  gender: string | null;
  phone: string | null;
  price: number | string | null;
  userType: string | null;
  depositAccount: string | null;
  registrationType: string | null;
}

export function RegistrationComplete({
  name,
  gender,
  phone,
  price,
  userType,
  depositAccount,
  registrationType
}: RegistrationCompleteProps) {
  //const { toast } = useToast();
  const addToast = useToastStore((state) => state.add);

  // 성별을 한글로 변환하는 함수
  const getGenderText = (gender: string | null): string => {
    if (gender === "MALE") return "형제";
    if (gender === "FEMALE") return "자매";
    return "";
  };

  // 사용자 유형 텍스트 가져오기
  const getUserTypeText = (userType: string | null): string => {
    if (userType === "NEW_COMER") return "새가족";
    if (userType === "SOLDIER") return "군지체";
    return "";
  };

  // 특별 신청 유형인지 확인
  const isSpecialType = userType === "NEW_COMER" || userType === "SOLDIER";

  // 클립보드 복사 함수
  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        addToast({
          title: "클립보드로 복사되었습니다",
          //description: "클립보드로 복사되었습니다",
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
      <Card className="w-full max-w-md mx-2 break-keep break-words">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {registrationType === "retreat-registration"
              ? "수양회 신청 완료"
              : registrationType === "bus-registration"
              ? "버스 신청 완료"
              : ""}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {isSpecialType ? (
            <p className="mb-6">
              <span className="font-semibold">{name}</span>{" "}
              {getGenderText(gender)}님,{" "}
              <span className="text-muted-foreground">
                {getUserTypeText(userType)}로 수양회 신청이 접수되었습니다.{" "}
                {getUserTypeText(userType)}가 확인이 된 이후 입금 절차가
                진행되기 때문에 잠시만 기다려주시면 감사하겠습니다.
              </span>
            </p>
          ) : (
            <p className="mb-6">
              <span className="font-semibold">{name}</span>{" "}
              {getGenderText(gender)}님,{" "}
              <span className="font-semibold">{phone}</span>{" "}
              <span className="text-muted-foreground">
                {registrationType === "retreat-registration"
                  ? "으로 수양회 신청 접수 문자가 발송되었습니다. 이후 입금 과정을 진행해주세요."
                  : registrationType === "bus-registration"
                  ? "으로 버스 신청 접수 문자가 발송되었습니다. 이후 입금 과정을 진행해주세요."
                  : ""}
              </span>
            </p>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="space-y-4">
              {getUserTypeText(userType) && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">신청 정보</h3>
                  <div className="space-y-2">
                    <p className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="font-medium">신청 유형:</span>{" "}
                      <span>{getUserTypeText(userType)}</span>
                    </p>
                  </div>
                </div>
              )}

              {!isSpecialType && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">입금 안내</h3>
                  <div className="space-y-2">
                    <p className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      <span className="font-medium">입금 계좌:</span>{" "}
                      <span>{depositAccount}</span>
                      <button
                        onClick={() =>
                          copyToClipboard(depositAccount ?? "null")
                        }
                        className="p-1 hover:bg-gray-100 rounded-md"
                        type="button"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </p>
                    <p className="flex items-center gap-2">
                      <Wallet className="h-4 w-4" />
                      <span className="font-medium">입금 금액:</span>{" "}
                      <span className="whitespace-nowrap">
                        {typeof price === "number"
                          ? price.toLocaleString() + "원"
                          : price}
                      </span>
                    </p>
                    <p className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="font-medium">입금자명:</span>{" "}
                      <span className="whitespace-nowrap">{name}</span>
                      <button
                        onClick={() => copyToClipboard(name || "")}
                        className="p-1 hover:bg-gray-100 rounded-md"
                        type="button"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      * 입금자명을 확인해주시기 바랍니다.
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {registrationType === "retreat-registration"
                        ? "* 입금 시각을 기준으로 수양회 참석 여부가 결정됩니다."
                        : ""}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
