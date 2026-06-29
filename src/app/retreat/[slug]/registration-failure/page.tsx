"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSlug } from "@/hooks/use-slug";
import {
  useRegistrationResultStore,
  type RegistrationFailureResult,
} from "@/store/registration-result-store";

export default function RegistrationFailurePage() {
  const slug = useSlug();
  const searchParams = useSearchParams();
  const isPeriodClosed = searchParams.get("reason") === "period-closed";
  const isShuttleBusPeriodClosed =
    isPeriodClosed && searchParams.get("form") === "shuttle-bus";

  // 기간 마감이 아니면 store 의 실패 데이터를 1회 스냅샷한다.
  const [failureData] = useState<RegistrationFailureResult | null>(() =>
    isPeriodClosed ? null : useRegistrationResultStore.getState().failure
  );

  // 스냅샷 이후 store 를 비운다.
  useEffect(() => {
    if (failureData) {
      useRegistrationResultStore.getState().clearFailure();
    }
  }, [failureData]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="mx-2 w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {isPeriodClosed
              ? isShuttleBusPeriodClosed
                ? "셔틀버스 신청 기간이 아닙니다"
                : "수양회 신청 기간이 아닙니다"
              : "신청 오류"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          {isPeriodClosed ? (
            <p className="mb-6 text-muted-foreground">
              현재는 {isShuttleBusPeriodClosed ? "셔틀버스" : "수양회"} 신청
              기간이 아닙니다. 신청 기간을 확인하시고 다시 방문해주세요.
            </p>
          ) : (
            <>
              <div className="mb-6 rounded-md bg-red-50 p-4 text-left">
                <p className="text-red-700">
                  {failureData?.errorMessage ||
                    "죄송합니다. 현재 등록을 완료할 수 없습니다. 다시 시도해주시기 바랍니다."}
                </p>
              </div>

              <div>
                {failureData?.registrationType === "retreat-registration" ? (
                  <Link href={`/retreat/${slug}/retreat`}>
                    <Button className="w-full">다시 시도하기</Button>
                  </Link>
                ) : failureData?.registrationType === "bus-registration" ? (
                  <Link href={`/retreat/${slug}/shuttle-bus`}>
                    <Button className="w-full">다시 시도하기</Button>
                  </Link>
                ) : (
                  ""
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
