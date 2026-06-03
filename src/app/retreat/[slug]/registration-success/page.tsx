"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RegistrationComplete } from "@/components/registration-complete";
import { useUnivGroupInfo } from "@/hooks/use-retreat-queries";
import { useSlug } from "@/hooks/use-slug";
import { useRegistrationResultStore } from "@/store/registration-result-store";

export default function RegistrationSuccessPage() {
  const router = useRouter();
  const slug = useSlug();

  // 렌더 시점에 staging 데이터를 1회 스냅샷한다 (StrictMode 이중 호출에도 안정적).
  const [data] = useState(
    () => useRegistrationResultStore.getState().retreatResult
  );

  // 스냅샷 이후 store 를 비우고, 데이터가 없으면 신청 페이지로 돌려보낸다.
  useEffect(() => {
    if (data) {
      useRegistrationResultStore.getState().clearRetreatResult();
    } else {
      router.push(`/retreat/${slug}/retreat`);
    }
  }, [data, router, slug]);

  // 입금 계좌는 부서 정보 쿼리에서 파생한다.
  const { data: retreatUnivGroup } = useUnivGroupInfo(slug);
  const depositGroup = retreatUnivGroup?.find(
    (group) => group.univGroupId === Number(data?.univGroup)
  );
  const bankAccount = depositGroup?.information?.deposit_account;
  const accountHolder = depositGroup?.information?.deposit_account_holder;
  const depositAccount =
    bankAccount && accountHolder ? `${bankAccount} ${accountHolder}` : null;

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        등록 정보를 찾을 수 없습니다.
      </div>
    );
  }

  return (
    <RegistrationComplete
      name={data.name}
      gender={data.gender}
      phone={data.phoneNumber}
      price={data.price}
      userType={data.userType}
      univGroup={Number(data.univGroup)}
      gradeId={data.gradeId}
      depositAccount={depositAccount}
      registrationType={data.registrationType}
    />
  );
}
