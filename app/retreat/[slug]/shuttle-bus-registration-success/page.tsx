"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ShuttleBusRegistrationComplete } from "@/components/shuttle-bus-registration-complete";
import { server } from "@/utils/axios";

interface ShuttleBusRegistrationData {
  name: string;
  phoneNumber: string;
  gender: string;
  gradeNumber: number;
  retreatId: number;
  shuttleBusIds: number[];
  isAdminContact: boolean;
  totalPrice: number;
  univGroup: number;
}

export default function ShuttleBusRegistrationSuccessPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const [registrationData, setRegistrationData] =
    useState<ShuttleBusRegistrationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [depositAccount, setDepositAccount] = useState<string>("");
  const [depositAccountHolder, setDepositAccountHolder] = useState<string>("");

  useEffect(() => {
    // localStorage에서 셔틀버스 등록 데이터 가져오기
    const storedData = localStorage.getItem("shuttleBusRegistrationData");

    if (!storedData) {
      router.push(`/retreat/${params.slug}`);
      return;
    }

    try {
      const parsedData = JSON.parse(storedData);
      setRegistrationData(parsedData);
    } catch (error) {
      console.error("Failed to parse shuttle bus registration data:", error);
      router.push(`/retreat/${params.slug}`);
    } finally {
      setLoading(false);
    }
  }, [router, params.slug]);

  useEffect(() => {
    if (registrationData) {
      localStorage.removeItem("shuttleBusRegistrationData");
    }
  }, [registrationData]);

  useEffect(() => {
    if (!registrationData) return;
    const fetchBankAccount = async () => {
      try {
        const response = await server.get(
          `/api/v1/retreat/${params.slug}/univ-group-info`
        );
        const matchingGroup = response.data.retreatUnivGroup.find(
          (group: {
            univGroupId: number;
            information?: {
              shuttle_bus_deposit_account?: string;
              shuttle_bus_deposit_account_holder?: string;
            };
          }) => group.univGroupId === registrationData?.univGroup
        );
        const bankAccount =
          matchingGroup?.information.shuttle_bus_deposit_account;
        const accountHolder =
          matchingGroup?.information.shuttle_bus_deposit_account_holder;
        setDepositAccount(bankAccount || "");
        setDepositAccountHolder(accountHolder || "");
      } catch (error) {
        console.error("Failed to fetch univ group info", error);
      }
    };

    fetchBankAccount();
  }, [params.slug, registrationData]);

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
    <ShuttleBusRegistrationComplete
      name={registrationData.name}
      gender={registrationData.gender}
      phone={registrationData.phoneNumber}
      totalPrice={registrationData.totalPrice}
      univGroup={registrationData.univGroup}
      gradeNumber={registrationData.gradeNumber}
      depositAccount={depositAccount}
      depositAccountHolder={depositAccountHolder}
    />
  );
}
