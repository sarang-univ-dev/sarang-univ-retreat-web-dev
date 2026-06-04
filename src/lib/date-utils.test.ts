import {
  getKSTDay,
  getKSTDate,
  getKSTMonth,
  getKSTFullYear,
  getKSTHours,
  getKSTMinutes,
  getKSTDateString,
  getKSTWeekday,
  getKSTWeekdayWithSunday,
} from "@/lib/date-utils";

/**
 * Characterization tests for KST date utilities.
 *
 * KST = UTC+9. Inputs below are fixed UTC ISO strings whose KST conversion
 * is computed by hand. We deliberately cover the UTC->KST day-rollover
 * boundary (e.g. a 20:00Z time that lands on the NEXT day in KST) and the
 * year/month rollover at New Year's Eve.
 *
 * Reference dates (Gregorian, verified by hand):
 *   - 2026-06-01 is a Monday => 2026-06-02 is Tuesday, 2026-06-03 is Wednesday.
 *   - 2026-12-31 is a Thursday => 2027-01-01 is Friday.
 */

// 2026-06-02T11:00:00Z  -> KST 2026-06-02 20:00 (same calendar day, Tuesday)
const SAME_DAY = "2026-06-02T11:00:00Z";

// 2026-06-02T20:00:00Z  -> KST 2026-06-03 05:00 (NEXT calendar day, Wednesday)
const ROLLOVER = "2026-06-02T20:00:00Z";

// 2026-06-02T15:00:00Z  -> KST 2026-06-03 00:00 (exact midnight boundary, Wednesday)
const MIDNIGHT = "2026-06-02T15:00:00Z";

// 2026-12-31T20:00:00Z  -> KST 2027-01-01 05:00 (year + month + day rollover, Friday)
const YEAR_ROLLOVER = "2026-12-31T20:00:00Z";

describe("getKSTDay", () => {
  it("returns the KST weekday index (0=Sun..6=Sat)", () => {
    // KST 2026-06-02 is a Tuesday => 2
    expect(getKSTDay(SAME_DAY)).toBe(2);
  });

  it("reflects the next day after UTC->KST rollover", () => {
    // KST 2026-06-03 is a Wednesday => 3
    expect(getKSTDay(ROLLOVER)).toBe(3);
    expect(getKSTDay(MIDNIGHT)).toBe(3);
  });

  it("handles the year-boundary rollover", () => {
    // KST 2027-01-01 is a Friday => 5
    expect(getKSTDay(YEAR_ROLLOVER)).toBe(5);
  });

  it("accepts a Date object as input", () => {
    expect(getKSTDay(new Date(SAME_DAY))).toBe(2);
  });
});

describe("getKSTDate", () => {
  it("returns the KST day-of-month", () => {
    expect(getKSTDate(SAME_DAY)).toBe(2);
  });

  it("returns the next day-of-month after rollover", () => {
    expect(getKSTDate(ROLLOVER)).toBe(3);
    expect(getKSTDate(MIDNIGHT)).toBe(3);
  });

  it("returns 1 across the year-boundary rollover", () => {
    expect(getKSTDate(YEAR_ROLLOVER)).toBe(1);
  });
});

describe("getKSTMonth", () => {
  it("returns the zero-based KST month (0=Jan..11=Dec)", () => {
    // June => 5
    expect(getKSTMonth(SAME_DAY)).toBe(5);
    expect(getKSTMonth(ROLLOVER)).toBe(5);
  });

  it("returns 0 (January) across the year-boundary rollover", () => {
    expect(getKSTMonth(YEAR_ROLLOVER)).toBe(0);
  });
});

describe("getKSTFullYear", () => {
  it("returns the KST year", () => {
    expect(getKSTFullYear(SAME_DAY)).toBe(2026);
  });

  it("returns the incremented year across the New Year rollover", () => {
    expect(getKSTFullYear(YEAR_ROLLOVER)).toBe(2027);
  });
});

describe("getKSTHours", () => {
  it("returns the KST hour in 24-hour form", () => {
    // 11:00Z + 9h = 20:00 KST
    expect(getKSTHours(SAME_DAY)).toBe(20);
  });

  it("returns the early-morning hour after rollover", () => {
    // 20:00Z + 9h = 05:00 KST (next day)
    expect(getKSTHours(ROLLOVER)).toBe(5);
  });

  it("returns 0 at the KST midnight boundary", () => {
    // 15:00Z + 9h = 00:00 KST (next day)
    expect(getKSTHours(MIDNIGHT)).toBe(0);
  });

  it("returns the hour across the year rollover", () => {
    // 20:00Z + 9h = 05:00 KST
    expect(getKSTHours(YEAR_ROLLOVER)).toBe(5);
  });
});

describe("getKSTMinutes", () => {
  it("returns the KST minutes", () => {
    expect(getKSTMinutes(SAME_DAY)).toBe(0);
  });

  it("returns non-zero minutes correctly", () => {
    // 2026-06-02T11:37:00Z -> KST 20:37
    expect(getKSTMinutes("2026-06-02T11:37:00Z")).toBe(37);
  });
});

describe("getKSTDateString", () => {
  it("formats KST date as YYYY-MM-DD with zero padding", () => {
    expect(getKSTDateString(SAME_DAY)).toBe("2026-06-02");
  });

  it("reflects the next day after UTC->KST rollover", () => {
    expect(getKSTDateString(ROLLOVER)).toBe("2026-06-03");
    expect(getKSTDateString(MIDNIGHT)).toBe("2026-06-03");
  });

  it("formats the year-boundary rollover correctly", () => {
    expect(getKSTDateString(YEAR_ROLLOVER)).toBe("2027-01-01");
  });
});

describe("getKSTWeekday", () => {
  it("returns the short Korean weekday string", () => {
    // KST 2026-06-02 is Tuesday => "화"
    expect(getKSTWeekday(SAME_DAY)).toBe("화");
  });

  it("returns the next-day weekday after rollover", () => {
    // KST 2026-06-03 is Wednesday => "수"
    expect(getKSTWeekday(ROLLOVER)).toBe("수");
  });

  it("returns Friday across the year rollover", () => {
    // KST 2027-01-01 is Friday => "금"
    expect(getKSTWeekday(YEAR_ROLLOVER)).toBe("금");
  });

  it("returns Sunday as '일' (not the special-cased form)", () => {
    // 2026-06-06 is Saturday; 2026-06-07 is Sunday.
    // 2026-06-06T15:00:00Z -> KST 2026-06-07 00:00 (Sunday) => "일"
    expect(getKSTWeekday("2026-06-06T15:00:00Z")).toBe("일");
  });
});

describe("getKSTWeekdayWithSunday", () => {
  it("maps Sunday to '주일'", () => {
    // 2026-06-06T15:00:00Z -> KST 2026-06-07 (Sunday) => "주일"
    expect(getKSTWeekdayWithSunday("2026-06-06T15:00:00Z")).toBe("주일");
  });

  it("returns the plain weekday for non-Sunday days", () => {
    expect(getKSTWeekdayWithSunday(SAME_DAY)).toBe("화");
    expect(getKSTWeekdayWithSunday(ROLLOVER)).toBe("수");
  });
});
