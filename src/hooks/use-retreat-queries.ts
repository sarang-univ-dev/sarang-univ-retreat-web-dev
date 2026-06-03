"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchRetreatInfo,
  fetchShuttleBusInfo,
  fetchUnivGroupInfo,
} from "@/services/retreat";

export function useRetreatInfo(slug: string) {
  return useQuery({
    queryKey: ["retreat-info", slug],
    queryFn: () => fetchRetreatInfo(slug),
    enabled: !!slug,
  });
}

export function useShuttleBusInfo(slug: string) {
  return useQuery({
    queryKey: ["shuttle-bus-info", slug],
    queryFn: () => fetchShuttleBusInfo(slug),
    enabled: !!slug,
  });
}

export function useUnivGroupInfo(slug: string) {
  return useQuery({
    queryKey: ["univ-group-info", slug],
    queryFn: () => fetchUnivGroupInfo(slug),
    enabled: !!slug,
  });
}
