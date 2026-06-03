import { describe, it, expect } from "vitest";
import { formatRetreatDates } from "@/utils/format-retreat-dates";

// KST 기준 날짜. 2026-01-01=목, 07=수, 08=목, 09=금.
const at = (isoDay: string) => ({ time: `${isoDay}T03:00:00.000Z` });

describe("formatRetreatDates", () => {
  it("빈 일정이면 빈 문자열", () => {
    expect(formatRetreatDates([])).toBe("");
    expect(formatRetreatDates(undefined)).toBe("");
  });

  it("단일 날짜는 '주후' 접두사 없이 연도를 표시한다 (기존 동작 보존)", () => {
    expect(formatRetreatDates([at("2026-01-07")])).toBe("2026년 1월 7일(수)");
  });

  it("연속된 날짜는 '주후 시작 ~ 종료' 로 묶는다", () => {
    expect(formatRetreatDates([at("2026-01-07"), at("2026-01-08")])).toBe(
      "주후 2026년 1월 7일(수) ~ 1월 8일(목)"
    );
  });

  it("떨어진 날짜는 콤마로 나열한다", () => {
    expect(formatRetreatDates([at("2026-01-07"), at("2026-01-09")])).toBe(
      "주후 2026년 1월 7일(수), 주후 1월 9일(금)"
    );
  });

  it("중복 시각은 같은 날짜로 합쳐 한 번만 표시한다", () => {
    expect(
      formatRetreatDates([
        { time: "2026-01-07T01:00:00.000Z" },
        { time: "2026-01-07T09:00:00.000Z" },
      ])
    ).toBe("2026년 1월 7일(수)");
  });
});
