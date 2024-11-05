"use client";

import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { useParams } from "next/navigation";
import { TRetreatInfo } from "@/types";
import { RetreatRegistrationComponent } from "@/components/retreat-registration";
import RetreatRegistrationFormSkeleton from "@/components/retreat-regitration-skeleton";

export default function RetreatPage() {
  const params = useParams<{ slug: string; }>();
  const { slug } = params;

  const [retreat, setRetreat] = useState<TRetreatInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchRetreat = async () => {
      try {
        const response = await axios.get(`/api/v1/retreats/${slug}`);

        console.log(response.data);

        setRetreat(response.data);
      } catch (err) {
        if (err instanceof AxiosError) {
          setError(
            err.response?.data?.error || "데이터를 불러오는데 실패했습니다."
          );
        } else {
          setError("알 수 없는 에러가 발생했습니다.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRetreat();
  }, [slug]);

  if (loading) return <RetreatRegistrationFormSkeleton />;
  if (error) return <p>에러: {error}</p>;
  if (!retreat) return <p>수양회를 찾을 수 없습니다.</p>;

  return <RetreatRegistrationComponent retreatSlug={slug} />;
}
