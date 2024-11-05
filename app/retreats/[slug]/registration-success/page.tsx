// File: app/retreats/[slug]/registration-success/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TRetreatInfo } from "@/types";
import { useRegistration } from "@/context/retreatRegistrationContext";
import { RegistrationComplete } from "@/components/registration-complete";
export default function RegistrationSuccessPage() {
  const router = useRouter();
  const { registrationData } = useRegistration();
  const [retreatData, setRetreatData] = useState<TRetreatInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!registrationData) {
      router.push("/");
      return;
    }

    // Get retreat data from URL params
    const slug = window.location.pathname.split("/")[2];
    const fetchRetreatData = async () => {
      try {
        const response = await fetch(`/api/v1/retreats/${slug}`);
        if (!response.ok) {
          throw new Error("Failed to fetch retreat data");
        }
        const data = await response.json();
        setRetreatData(data);
      } catch (error) {
        console.error("Failed to fetch retreat data:", error);
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    fetchRetreatData();
  }, [router, registrationData]);

  if (loading || !retreatData || !registrationData) {
    return <div>Loading...</div>;
  }

  return <RegistrationComplete 
    name={registrationData.name}
    gender={registrationData.gender} 
    phone={registrationData.phoneNumber}
  />;
}
