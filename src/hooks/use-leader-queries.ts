"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
  fetchLeaderMe,
  fetchLeaderMembers,
  fetchLeaderOpen,
  fetchLeaderReport,
  fetchLeaderToday,
  leaderLogin,
  leaderLogout,
} from "@/services/leader";

export const leaderQueryKeys = {
  me: (slug: string) => ["leader-me", slug] as const,
  today: (slug: string) => ["leader-today", slug] as const,
  members: (slug: string) => ["leader-members", slug] as const,
  report: (slug: string, date: string | null) =>
    ["leader-report", slug, date] as const,
  open: (slug: string) => ["leader-open", slug] as const,
};

/**
 * 대시보드 클라이언트 가드용 /me 쿼리.
 * 미들웨어가 cross-domain httpOnly 쿠키를 읽을 수 없으므로 401 이면
 * 호출 측에서 로그인 라우트로 router.replace 한다. (retry:false 로 401 즉시 전파)
 */
export function useLeaderMe(slug: string) {
  return useQuery({
    queryKey: leaderQueryKeys.me(slug),
    queryFn: () => fetchLeaderMe(slug),
    retry: false,
  });
}

export function useLeaderToday(slug: string, enabled = true) {
  return useQuery({
    queryKey: leaderQueryKeys.today(slug),
    queryFn: () => fetchLeaderToday(slug),
    enabled,
  });
}

export function useLeaderOpen(slug: string) {
  return useQuery({
    queryKey: leaderQueryKeys.open(slug),
    queryFn: () => fetchLeaderOpen(slug),
  });
}

export function useLeaderMembers(slug: string, enabled = true) {
  return useQuery({
    queryKey: leaderQueryKeys.members(slug),
    queryFn: () => fetchLeaderMembers(slug),
    enabled,
  });
}

export function useLeaderReport(
  slug: string,
  date: string | null,
  enabled = true
) {
  return useQuery({
    queryKey: leaderQueryKeys.report(slug, date),
    queryFn: () => fetchLeaderReport(slug, date as string),
    enabled: enabled && !!date,
  });
}

export function useLeaderLogin(slug: string) {
  return useMutation({
    mutationFn: (phone: string) => leaderLogin(slug, phone),
  });
}

export function useLeaderLogout(slug: string) {
  return useMutation({
    mutationFn: () => leaderLogout(slug),
  });
}
