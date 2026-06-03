"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";

import {
  fetchRegistrationStatus as fetchStatusService,
  type RegistrationStatusResponse,
} from "@/services/retreat";

const numberFormatter = new Intl.NumberFormat("ko-KR");
const digitAnimationDurationMs = 420;

const fetchRegistrationStatus = ({
  retreatSlug,
  univGroupNumber,
  signal,
}: {
  retreatSlug: string;
  univGroupNumber: string;
  signal: AbortSignal;
}): Promise<RegistrationStatusResponse> =>
  fetchStatusService(retreatSlug, univGroupNumber, signal);

function RollingDigit({
  digit,
  animate,
}: {
  digit: string;
  animate: boolean;
}) {
  const currentDigitRef = useRef(digit);
  const [displayDigit, setDisplayDigit] = useState(digit);
  const [previousDigit, setPreviousDigit] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const currentDigit = currentDigitRef.current;

    if (digit === currentDigit) {
      return;
    }

    currentDigitRef.current = digit;

    if (!animate) {
      setDisplayDigit(digit);
      setPreviousDigit(null);
      setIsAnimating(false);
      return;
    }

    setPreviousDigit(currentDigit);
    setDisplayDigit(digit);
    setIsAnimating(true);

    const timeoutId = setTimeout(() => {
      setPreviousDigit(null);
      setIsAnimating(false);
    }, digitAnimationDurationMs);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [animate, digit]);

  return (
    <span className="relative inline-flex h-[1em] w-[1ch] shrink-0 justify-center overflow-hidden align-baseline tabular-nums">
      {previousDigit !== null && (
        <span className="digit-roll-out absolute inset-0 flex items-center justify-center">
          {previousDigit}
        </span>
      )}
      <span
        className={`absolute inset-0 flex items-center justify-center ${
          isAnimating ? "digit-roll-in" : ""
        }`}
      >
        {displayDigit}
      </span>
    </span>
  );
}

function RollingNumber({
  value,
  suffix = "",
  fallback,
  className,
}: {
  value: number | null;
  suffix?: string;
  fallback: string;
  className: string;
}) {
  const previousValueRef = useRef<number | null>(null);
  const shouldAnimate =
    previousValueRef.current !== null &&
    value !== null &&
    value > previousValueRef.current;

  useEffect(() => {
    previousValueRef.current = value;
  }, [value]);

  const wrapperClassName = `${className} inline-flex items-center justify-center tabular-nums`;

  if (value === null) {
    return <span className={wrapperClassName}>{fallback}</span>;
  }

  const formattedValue = numberFormatter.format(value);
  const characters = formattedValue.split("");
  const digitCount = characters.filter((character) =>
    /\d/.test(character)
  ).length;
  let seenDigitCount = 0;

  return (
    <span
      aria-label={`${formattedValue}${suffix}`}
      className={wrapperClassName}
    >
      <span aria-hidden="true">
        {characters.map((character, index) => {
          if (!/\d/.test(character)) {
            return (
              <span className="inline-block w-[0.34em]" key={`static-${index}`}>
                {character}
              </span>
            );
          }

          const digitPositionFromRight = digitCount - seenDigitCount - 1;
          seenDigitCount += 1;

          return (
            <RollingDigit
              animate={shouldAnimate}
              digit={character}
              key={`digit-${digitPositionFromRight}`}
            />
          );
        })}
        {suffix}
      </span>
    </span>
  );
}

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
          <RollingNumber
            className="min-h-[12rem] text-8xl font-black leading-none tracking-normal sm:min-h-[16rem] sm:text-[9rem] md:min-h-[20rem] md:text-[12rem] lg:text-[14rem]"
            fallback="--명"
            suffix="명"
            value={status?.count ?? null}
          />

          <div className="rounded-md border-2 border-[#f4d35e] px-6 py-4 tabular-nums sm:px-10 sm:py-5">
            <p className="text-3xl font-extrabold text-[#f4d35e] sm:text-5xl md:text-6xl">
              추가 신청 +
              <RollingNumber
                className="inline-flex"
                fallback="0"
                value={additionalCount}
              />
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
