/**
 * 수양회 신청 기간(payment) 관련 순수 함수.
 * retreat/page.tsx 와 shuttle-bus/page.tsx 에 중복돼 있던 로직을 한곳으로 모은다.
 */
export interface PaymentWindow {
  name: string;
  startAt: string | Date;
  endAt: string | Date;
}

/** 현재 시각이 어떤 payment 기간 안에 있는지 */
export function isWithinRegistrationPeriod(
  payment: PaymentWindow[],
  now: Date = new Date()
): boolean {
  return payment.some((p) => {
    const start = new Date(p.startAt);
    const end = new Date(p.endAt);
    return now >= start && now <= end;
  });
}

/** 현재 진행 중인 신청 기간 이름 (없으면 undefined) */
export function getCurrentRegistrationPeriodName(
  payment: PaymentWindow[],
  now: Date = new Date()
): string | undefined {
  return payment.find((p) => {
    const start = new Date(p.startAt);
    const end = new Date(p.endAt);
    return now >= start && now <= end;
  })?.name;
}
