"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShuttleBusRegistrationComplete } from "@/components/shuttle/shuttle-bus-registration-complete";
import { useUnivGroupInfo } from "@/hooks/use-retreat-queries";
import { useSlug } from "@/hooks/use-slug";
import { useRegistrationResultStore } from "@/store/registration-result-store";

export default function ShuttleBusRegistrationSuccessPage() {
  const router = useRouter();
  const slug = useSlug();

  const [data] = useState(
    () => useRegistrationResultStore.getState().shuttleBusResult
  );

  useEffect(() => {
    if (data) {
      useRegistrationResultStore.getState().clearShuttleBusResult();
    } else {
      router.push(`/retreat/${slug}/shuttle-bus`);
    }
  }, [data, router, slug]);

  // 셔틀버스 입금 계좌는 부서 정보 쿼리에서 파생한다.
  const { data: retreatUnivGroup } = useUnivGroupInfo(slug);
  const depositGroup = retreatUnivGroup?.find(
    (group) => group.univGroupId === data?.univGroup
  );
  const depositAccount =
    depositGroup?.information?.shuttle_bus_deposit_account || "";
  const depositAccountHolder =
    depositGroup?.information?.shuttle_bus_deposit_account_holder || "";

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        등록 정보를 찾을 수 없습니다.
      </div>
    );
  }

  return (
    <ShuttleBusRegistrationComplete
      name={data.name}
      gender={data.gender}
      phone={data.phoneNumber}
      totalPrice={data.totalPrice}
      univGroup={data.univGroup ?? 0}
      gradeNumber={data.gradeNumber ?? 0}
      depositAccount={depositAccount}
      depositAccountHolder={depositAccountHolder}
    />
  );
}
