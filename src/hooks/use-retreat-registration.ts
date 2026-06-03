"use client";

import { useMutation } from "@tanstack/react-query";
import {
  submitRetreatRegistration,
  type RetreatRegistrationPayload,
} from "@/services/registration";

/** 수양회 등록 mutation. `mutation.isPending` 으로 제출 중 상태를 다룬다. */
export function useRetreatRegistration(slug: string) {
  return useMutation({
    mutationFn: (payload: RetreatRegistrationPayload) =>
      submitRetreatRegistration(slug, payload),
  });
}
