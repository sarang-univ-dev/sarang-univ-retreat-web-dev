"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  isWithinRegistrationPeriod,
  getRegistrationPeriodBounds,
  type PaymentWindow,
} from "@/utils/registration-period";

/**
 * 신청 기간이 닫혀 있으면 실패 페이지로 리다이렉트한다.
 * retreat/shuttle-bus 페이지에 중복돼 있던 checkRegistrationPeriod 로직을 대체한다.
 * (기존 동작 보존: localStorage "registrationPeriod" 저장 후 ?reason=period-closed 로 이동)
 */
export function useRegistrationGate(
  slug: string,
  payment: PaymentWindow[] | undefined
) {
  const router = useRouter();

  useEffect(() => {
    if (!payment || payment.length === 0) return;
    if (isWithinRegistrationPeriod(payment)) return;

    const { start, end } = getRegistrationPeriodBounds(payment);
    localStorage.setItem(
      "registrationPeriod",
      JSON.stringify({ start: start.toISOString(), end: end.toISOString() })
    );
    router.push(`/retreat/${slug}/registration-failure?reason=period-closed`);
  }, [slug, payment, router]);
}
