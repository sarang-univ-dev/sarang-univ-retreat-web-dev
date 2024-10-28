// File: app/retreats/[slug]/registration-success/page.tsx

"use client";

import { RegistrationComplete } from "@/components/registration-complete";
import { useSearchParams } from "next/navigation";

export default function RegistrationSuccessPage() {
  const searchParams = useSearchParams();

  const name = searchParams.get("name");
  const gender = searchParams.get("gender");
  const phone = searchParams.get("phone");

  return <RegistrationComplete name={name} gender={gender} phone={phone} />;
}
