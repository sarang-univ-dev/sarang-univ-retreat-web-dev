"use client";

import { useMutation } from "@tanstack/react-query";
import {
  submitShuttleBusRegistration,
  type ShuttleBusRegistrationPayload,
} from "@/services/registration";

/** 셔틀버스 등록 mutation. */
export function useShuttleBusRegistration(slug: string) {
  return useMutation({
    mutationFn: (payload: ShuttleBusRegistrationPayload) =>
      submitShuttleBusRegistration(slug, payload),
  });
}
