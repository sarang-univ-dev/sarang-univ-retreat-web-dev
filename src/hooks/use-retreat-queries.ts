"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchRetreatInfo,
  fetchShuttleBusInfo,
  fetchUnivGroupInfo,
} from "@/services/retreat";

// slug 는 useSlug() 가 항상 비어있지 않은 string 으로 보장하므로(아니면 throw)
// enabled 가드는 불필요하다.
export function useRetreatInfo(slug: string) {
  return useQuery({
    queryKey: ["retreat-info", slug],
    queryFn: () => fetchRetreatInfo(slug),
  });
}

export function useShuttleBusInfo(slug: string) {
  return useQuery({
    queryKey: ["shuttle-bus-info", slug],
    queryFn: () => fetchShuttleBusInfo(slug),
  });
}

export function useUnivGroupInfo(slug: string) {
  return useQuery({
    queryKey: ["univ-group-info", slug],
    queryFn: () => fetchUnivGroupInfo(slug),
  });
}
