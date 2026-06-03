import { describe, it, expect } from "vitest";
import { formatDate } from "@/utils/formatDate";

// 현재 동작 특성화: KST 기준 "M/D(요일)" 포맷.
describe("formatDate", () => {
  it("KST 기준 월/일(요일) 형식으로 변환한다", () => {
    // 2026-01-07T03:00:00Z == 2026-01-07 12:00 KST (수요일)
    expect(formatDate("2026-01-07T03:00:00.000Z")).toBe("1/7(수)");
  });

  it("일요일은 '주일'로 표기한다", () => {
    // 2026-01-11 은 일요일
    expect(formatDate("2026-01-11T03:00:00.000Z")).toBe("1/11(주일)");
  });

  it("UTC 자정 직전 시각도 KST 날짜로 보정한다", () => {
    // 2026-01-07T20:00:00Z == 2026-01-08 05:00 KST (목요일)
    expect(formatDate("2026-01-07T20:00:00.000Z")).toBe("1/8(목)");
  });
});
