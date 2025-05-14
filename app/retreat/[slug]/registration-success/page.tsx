"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { RegistrationComplete } from "@/components/registration-complete";

interface RegistrationData {
  name: string;
  gender: string;
  phoneNumber: string;
  price: number | string;
  userType: string | null;
}

export default function RegistrationSuccessPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const [registrationData, setRegistrationData] =
    useState<RegistrationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // localStorage에서 등록 데이터 가져오기
    const storedData = localStorage.getItem("registrationData");

    if (!storedData) {
      router.push(`/retreat/${params.slug}`);
      return;
    }

    try {
      const parsedData = JSON.parse(storedData);
      setRegistrationData(parsedData);
    } catch (error) {
      console.error("Failed to parse registration data:", error);
      router.push(`/retreat/${params.slug}`);
    } finally {
      setLoading(false);
    }

    // 데이터 검색 후 localStorage 정리
    return () => {
      localStorage.removeItem("registrationData");
    };
  }, [router, params.slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        로딩 중...
      </div>
    );
  }

  if (!registrationData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        등록 정보를 찾을 수 없습니다.
      </div>
    );
  }

  return (
    <RegistrationComplete
      name={registrationData.name}
      gender={registrationData.gender}
      phone={registrationData.phoneNumber}
      price={registrationData.price}
      userType={registrationData.userType}
    />
  );
}
