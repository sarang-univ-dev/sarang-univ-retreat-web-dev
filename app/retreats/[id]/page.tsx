'use client';

import { useEffect, useState } from 'react';
import axios, { AxiosError } from 'axios';
import { useParams } from 'next/navigation';
import type { TRetreat } from '../../../types';

export default function RetreatPage() {
  const params = useParams<{ id: string }>();
  const { id } = params;

  const [retreat, setRetreat] = useState<TRetreat | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchRetreat = async () => {
      try {
        const response = await axios.get<TRetreat>(`/api/v1/retreats/${id}`);
        setRetreat(response.data);
      } catch (err) {
        if (err instanceof AxiosError) {
          setError(err.response?.data?.error || '데이터를 불러오는데 실패했습니다.');
        } else {
          setError('알 수 없는 에러가 발생했습니다.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRetreat();
  }, [id]);

  if (loading) return <p>로딩 중...</p>;
  if (error) return <p>에러: {error}</p>;
  if (!retreat) return <p>리트리트를 찾을 수 없습니다.</p>;

  return (
    <div>
      <h1>{retreat.name}</h1>
      <p><strong>위치:</strong> {retreat.location}</p>
      <p><strong>주요 구절:</strong> {retreat.main_verse}</p>
      <p><strong>주요 연사:</strong> {retreat.main_speaker}</p>
      {retreat.memo && <p><strong>메모:</strong> {retreat.memo}</p>}
    </div>
  );
}