"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  isWithinRegistrationPeriod,
  type PaymentWindow,
} from "@/lib/registration-period";

export function useRetreatRegistrationGate(
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
