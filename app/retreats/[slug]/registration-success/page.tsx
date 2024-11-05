// File: app/retreats/[slug]/registration-success/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TRetreatInfo } from "@/types";
import { useRegistration } from "@/context/retreatContext";

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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">수련회 등록이 완료되었습니다!</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="mb-4">
          {registrationData.name}님, 등록해 주셔서 감사합니다!
        </p>
        <div className="border-t pt-4">
          <h2 className="font-semibold mb-2">수련회 정보</h2>
          <p>수련회명: {retreatData.retreat.name}</p>
          <p>장소: {retreatData.retreat.location}</p>
          <p>
            기간: {new Date(retreatData.retreat.dates[0]).toLocaleDateString()}{" "}
            -{" "}
            {new Date(
              retreatData.retreat.dates[retreatData.retreat.dates.length - 1]
            ).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
