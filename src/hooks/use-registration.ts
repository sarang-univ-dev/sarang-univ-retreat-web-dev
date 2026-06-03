"use client";

import { useMutation } from "@tanstack/react-query";
import {
  submitRetreatRegistration,
  submitShuttleBusRegistration,
  type RetreatRegistrationPayload,
  type ShuttleBusRegistrationPayload,
} from "@/services/registration";

/** 수양회 등록 mutation. `mutation.isPending` 으로 제출 중 상태를 다룬다. */
export function useRetreatRegistration(slug: string) {
  return useMutation({
    mutationFn: (payload: RetreatRegistrationPayload) =>
      submitRetreatRegistration(slug, payload),
  });
}

/** 셔틀버스 등록 mutation. */
export function useShuttleBusRegistration(slug: string) {
  return useMutation({
    mutationFn: (payload: ShuttleBusRegistrationPayload) =>
      submitShuttleBusRegistration(slug, payload),
  });
}
