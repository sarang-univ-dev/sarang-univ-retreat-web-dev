"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";

interface FailureData {
  errorMessage: string;
  timestamp: string;
  retreatName: string;
  registrationType: string;
}

export default function RegistrationFailurePage() {
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const [failureData, setFailureData] = useState<FailureData | null>(null);
  const [isPeriodClosed, setIsPeriodClosed] = useState(false);

  useEffect(() => {
    // URL 파라미터에서 실패 유형 확인
    const reason = searchParams.get("reason");
    if (reason === "period-closed") {
      setIsPeriodClosed(true);
      return;
    }

    // localStorage에서 실패 데이터 가져오기
    const storedData = localStorage.getItem("registrationFailureData");

    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setFailureData(parsedData);
      } catch (error) {
        console.error("Failed to parse failure data:", error);
      }

      // 데이터 검색 후 localStorage 정리
      localStorage.removeItem("registrationFailureData");
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-2">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {isPeriodClosed ? "수양회 신청 기간이 아닙니다" : "신청 오류"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          {isPeriodClosed ? (
            <p className="text-muted-foreground mb-6">
              현재는 수양회 신청 기간이 아닙니다. 신청 기간을 확인하시고 다시
              방문해주세요.
            </p>
          ) : (
            <>
              <div className="bg-red-50 p-4 rounded-md mb-6 text-left">
                <p className="text-red-700">
                  {failureData?.errorMessage ||
                    "죄송합니다. 현재 등록을 완료할 수 없습니다. 다시 시도해주시기 바랍니다."}
                </p>
              </div>

              <div>
                {failureData?.registrationType === "retreat-registration" ? (
                  <Link href={`/retreat/${params.slug}`}>
                    <Button className="w-full">다시 시도하기</Button>
                  </Link>
                ) : failureData?.registrationType === "bus-registration" ? (
                  <Link href={`/retreat/${params.slug}/shuttle-bus`}>
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
