// File: app/retreats/[slug]/registration-success/page.tsx

"use client";

import { RegistrationFailed } from "@/components/registration-failed";
import { useSearchParams } from "next/navigation";

export default function RegistrationSuccessPage() {
  const searchParams = useSearchParams();
  const statusMessage =
    searchParams.get("message") || "알 수 없는 오류가 발생했습니다.";
  return <RegistrationFailed failMessage={statusMessage} />;
}
