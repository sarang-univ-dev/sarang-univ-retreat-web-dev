"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  isWithinRegistrationPeriod,
  type PaymentWindow,
} from "@/lib/registration-period";

export function useShuttleBusRegistrationGate(
  slug: string,
  payment: PaymentWindow[] | undefined
) {
  const router = useRouter();

  useEffect(() => {
    if (!payment) return;
    if (isWithinRegistrationPeriod(payment)) return;

    router.push(
      `/retreat/${slug}/registration-failure?reason=period-closed&form=shuttle-bus`
    );
  }, [slug, payment, router]);
}
