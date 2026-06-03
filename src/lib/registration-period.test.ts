import { describe, it, expect } from "vitest";
import {
  isWithinRegistrationPeriod,
  getCurrentRegistrationPeriodName,
} from "@/lib/registration-period";

const payment = [
  { name: "얼리버드", startAt: "2026-01-01T00:00:00Z", endAt: "2026-01-10T00:00:00Z" },
  { name: "정규신청", startAt: "2026-01-10T00:00:00Z", endAt: "2026-01-20T00:00:00Z" },
];

describe("registration-period", () => {
  describe("isWithinRegistrationPeriod", () => {
    it("기간 내면 true", () => {
      expect(
        isWithinRegistrationPeriod(payment, new Date("2026-01-05T00:00:00Z"))
      ).toBe(true);
    });
    it("모든 기간 밖이면 false", () => {
      expect(
        isWithinRegistrationPeriod(payment, new Date("2026-02-01T00:00:00Z"))
      ).toBe(false);
    });
    it("기간 시작 이전이면 false", () => {
      expect(
        isWithinRegistrationPeriod(payment, new Date("2025-12-31T00:00:00Z"))
      ).toBe(false);
    });
  });

  describe("getCurrentRegistrationPeriodName", () => {
    it("현재 진행 중인 기간 이름을 반환한다", () => {
      expect(
        getCurrentRegistrationPeriodName(payment, new Date("2026-01-05T00:00:00Z"))
      ).toBe("얼리버드");
      expect(
        getCurrentRegistrationPeriodName(payment, new Date("2026-01-15T00:00:00Z"))
      ).toBe("정규신청");
    });
    it("진행 중인 기간이 없으면 undefined", () => {
      expect(
        getCurrentRegistrationPeriodName(payment, new Date("2026-03-01T00:00:00Z"))
      ).toBeUndefined();
    });
  });
});
