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
 * 실패 페이지는 ?reason=period-closed 쿼리만으로 안내를 띄우므로 별도 상태 전달이 필요 없다.
 */
export function useRegistrationGate(
  slug: string,
  payment: PaymentWindow[] | undefined
) {
  const router = useRouter();

  useEffect(() => {
    if (!payment || payment.length === 0) return;
    if (isWithinRegistrationPeriod(payment)) return;

    router.push(`/retreat/${slug}/registration-failure?reason=period-closed`);
  }, [slug, payment, router]);
}
