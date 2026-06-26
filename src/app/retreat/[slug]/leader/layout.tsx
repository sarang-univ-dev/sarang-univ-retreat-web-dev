"use client";

import { AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSlug } from "@/hooks/use-slug";
import { useLeaderOpen } from "@/hooks/use-leader-queries";
import { LeaderHeader } from "@/components/leader/leader-header";

export default function LeaderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const slug = useSlug();
  const openQuery = useLeaderOpen(slug);

  // 공개 체크: 로그인 여부와 무관하게, 닫혀 있으면 마감 화면만 보여준다.
  // (UI 는 registration-failure 의 기간 마감 카드와 동일 패턴을 인라인으로 둔다.)
  if (openQuery.isLoading) {
    return null;
  }

  if (openQuery.data && !openQuery.data.leaderReportOpen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-2">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold">
              리더보고서 작성 기간이 아닙니다
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">
              현재는 리더보고서 작성 기간이 아닙니다.
              <br />
              작성 기간에 다시 확인해주세요.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <LeaderHeader slug={slug} />
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-4 flex flex-col">
        {children}
      </main>
    </div>
  );
}
