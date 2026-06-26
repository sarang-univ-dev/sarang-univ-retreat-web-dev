"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { HTTPError } from "ky";
import { Skeleton } from "@/components/ui/skeleton";
import { useSlug } from "@/hooks/use-slug";
import { useLeaderMe } from "@/hooks/use-leader-queries";
import { DashboardContent } from "@/components/leader/dashboard-content";

export default function LeaderDashboardPage() {
  const slug = useSlug();
  const router = useRouter();

  // 클라이언트 가드: 미들웨어가 cross-domain httpOnly 쿠키를 못 읽으므로
  // 마운트 시 /me 로 인증 확인. 401 이면 로그인으로 replace. (retry:false)
  const meQuery = useLeaderMe(slug);

  useEffect(() => {
    if (
      meQuery.isError &&
      meQuery.error instanceof HTTPError &&
      meQuery.error.response?.status === 401
    ) {
      router.replace(`/retreat/${slug}/leader/login`);
    }
  }, [meQuery.isError, meQuery.error, router, slug]);

  if (meQuery.isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  // 401 등 인증 실패 → 위 effect 가 리다이렉트하는 동안 빈 화면
  if (meQuery.isError || !meQuery.data?.leader) {
    return null;
  }

  return <DashboardContent slug={slug} leader={meQuery.data.leader} />;
}
