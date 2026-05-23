"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import { server } from "@/utils/axios";

type RegistrationStatusResponse = {
  retreat: {
    slug: string;
    name: string;
  };
  univGroup: {
    number: number;
    name: string;
  };
  count: number;
  updatedAt: string;
};

const numberFormatter = new Intl.NumberFormat("ko-KR");

const fetchRegistrationStatus = async ({
  retreatSlug,
  univGroupNumber,
  signal,
}: {
  retreatSlug: string;
  univGroupNumber: string;
  signal: AbortSignal;
}) => {
  const response = await server.get<RegistrationStatusResponse>(
    `/api/v1/retreat/${retreatSlug}/registration/public-status/departments/${univGroupNumber}`,
    { signal }
  );

  return response.data;
};

export default function DepartmentRegistrationStatusPage() {
  const params = useParams<{ slug: string; univGroupNumber: string }>();
  const { slug, univGroupNumber } = params;
  const [status, setStatus] = useState<RegistrationStatusResponse | null>(null);
  const [initialCount, setInitialCount] = useState<number | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let isMounted = true;
    const controller = new AbortController();

    const poll = async () => {
      try {
        const nextStatus = await fetchRegistrationStatus({
          retreatSlug: slug,
          univGroupNumber,
          signal: controller.signal,
        });

        if (!isMounted) {
          return;
        }

        setStatus(nextStatus);
        setInitialCount((currentInitialCount) =>
          currentInitialCount === null ? nextStatus.count : currentInitialCount
        );
        setIsRetrying(false);
      } catch {
        if (!isMounted || controller.signal.aborted) {
          return;
        }

        setIsRetrying(true);
      } finally {
        if (isMounted) {
          timeoutId = setTimeout(poll, 1000);
        }
      }
    };

    poll();

    return () => {
      isMounted = false;
      controller.abort();

      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [slug, univGroupNumber]);

  const additionalCount = useMemo(() => {
    if (!status || initialCount === null) {
      return 0;
    }

    return Math.max(status.count - initialCount, 0);
  }, [initialCount, status]);

  return (
    <main className="flex min-h-screen bg-[#111111] text-white">
      <div className="flex w-full flex-col items-center justify-between px-6 py-8 text-center sm:px-10 sm:py-10">
        <header className="flex w-full max-w-5xl items-start justify-between gap-4 text-left">
          <div className="min-w-0">
            <p className="truncate text-xl font-semibold text-[#f4d35e] sm:text-3xl">
              {status?.retreat.name ?? "수양회 신청 현황"}
            </p>
            <p className="mt-2 text-base font-medium text-white/70 sm:text-xl">
              {status ? status.univGroup.name : `${univGroupNumber}부`}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2 pt-1">
            <span
              className={`h-3 w-3 rounded-full ${
                isRetrying ? "bg-[#ef476f]" : "bg-[#4ade80]"
              }`}
            />
            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70 sm:text-base">
              Live
            </span>
          </div>
        </header>

        <section className="flex w-full flex-1 flex-col items-center justify-center gap-8">
          <p className="min-h-[12rem] text-8xl font-black leading-none tracking-normal tabular-nums sm:min-h-[16rem] sm:text-[9rem] md:min-h-[20rem] md:text-[12rem] lg:text-[14rem]">
            {status ? `${numberFormatter.format(status.count)}명` : "--명"}
          </p>

          <div className="rounded-md border-2 border-[#f4d35e] px-6 py-4 tabular-nums sm:px-10 sm:py-5">
            <p className="text-3xl font-extrabold text-[#f4d35e] sm:text-5xl md:text-6xl">
              추가 신청 +{numberFormatter.format(additionalCount)}
            </p>
          </div>
        </section>

        <footer className="min-h-6 text-sm font-medium text-white/55 sm:text-base">
          {isRetrying ? "연결 재시도 중" : ""}
        </footer>
      </div>
    </main>
  );
}
