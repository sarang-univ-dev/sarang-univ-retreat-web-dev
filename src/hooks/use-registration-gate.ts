"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  isWithinRegistrationPeriod,
  type PaymentWindow,
} from "@/lib/registration-period";

/**
 * 신청 기간이 닫혀 있으면 실패 페이지로 리다이렉트한다.
 * retreat/shuttle-bus 페이지에 중복돼 있던 checkRegistrationPeriod 로직을 대체한다.
 */
export function useRegistrationGate(
  slug: string,
  payment: PaymentWindow[] | undefined,
  options: {
    allowEmpty?: boolean;
    failureForm?: "retreat" | "shuttle-bus";
  } = {}
) {
  const router = useRouter();
  const { allowEmpty = true, failureForm } = options;

  useEffect(() => {
    if (!payment) return;
    if (payment.length === 0 && allowEmpty) return;
    if (isWithinRegistrationPeriod(payment)) return;

    const params = new URLSearchParams({ reason: "period-closed" });
    if (failureForm) {
      params.set("form", failureForm);
    }

    router.push(`/retreat/${slug}/registration-failure?${params.toString()}`);
  }, [allowEmpty, failureForm, slug, payment, router]);
}
