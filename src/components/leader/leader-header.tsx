"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToastStore } from "@/store/toast-store";
import {
  leaderQueryKeys,
  useLeaderLogout,
  useLeaderMe,
  useLeaderToday,
} from "@/hooks/use-leader-queries";
import { useLeaderDraftStore } from "@/store/leader-draft-store";
import { getErrorMessage, logError } from "@/lib/error-handler";
import { formatDate } from "@/lib/format-date";

/**
 * 리더 포털 헤더: GBS 번호 + 리더 이름 + 오늘 날짜 + 로그아웃.
 * /me 가 401(로그인 안 됨)이면 아무것도 렌더하지 않는다(로그인 페이지에서 숨김).
 */
export function LeaderHeader({ slug }: { slug: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.add);

  const meQuery = useLeaderMe(slug);
  const leader = meQuery.data?.leader;
  const todayQuery = useLeaderToday(slug, !!leader);
  const logout = useLeaderLogout(slug);
  const clearDraft = useLeaderDraftStore((s) => s.clear);

  if (!leader) return null;

  const today = todayQuery.data?.today;

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        clearDraft();
        queryClient.removeQueries({ queryKey: leaderQueryKeys.me(slug) });
        router.replace(`/retreat/${slug}/leader/login`);
      },
      onError: (error) => {
        logError(error, "leader-logout");
        addToast({
          title: "로그아웃에 실패했습니다",
          description: getErrorMessage(error),
          variant: "destructive",
        });
      },
    });
  };

  return (
    <header className="sticky top-0 z-30 border-b bg-white">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="font-bold text-base truncate">
            {leader.gbsNumber}번 GBS · {leader.name} 리더
          </div>
          {today && (
            <div className="text-sm text-muted-foreground">
              {formatDate(today)}
            </div>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleLogout}
          disabled={logout.isPending}
        >
          <LogOut className="h-4 w-4" />
          로그아웃
        </Button>
      </div>
    </header>
  );
}
