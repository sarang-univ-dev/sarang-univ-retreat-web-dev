import {
  getKSTDateString,
  getKSTFullYear,
  getKSTMonth,
  getKSTDate,
  getKSTDay,
} from "@/lib/date-utils";

/**
 * 수양회 일정(schedule)에서 고유 날짜를 뽑아 "주후 YYYY년 M월 D일(요일)" 형태로
 * 포맷팅한다. 연속된 날짜는 "시작 ~ 종료" 로 묶고, 연도는 필요한 경우에만 표시한다.
 *
 * retreat/page.tsx 와 shuttle-bus/page.tsx 에 1:1로 중복돼 있던 로직을 한곳으로 모은 것.
 * (동작은 기존과 동일하게 유지)
 */
export function formatRetreatDates(
  schedules: { time: string | Date }[] | undefined | null
): string {
  if (!schedules || schedules.length === 0) return "";

  const dates = [
    ...new Set(schedules.map((s) => getKSTDateString(s.time))),
  ].sort();

  const formatDate = (dateStr: string, showYear: boolean = true) => {
    const year = getKSTFullYear(dateStr);
    const month = getKSTMonth(dateStr) + 1;
    const day = getKSTDate(dateStr);
    const weekdays = ["주일", "월", "화", "수", "목", "금", "토"];
    const dayOfWeek = weekdays[getKSTDay(dateStr)];
    return showYear
      ? `${year}년 ${month}월 ${day}일(${dayOfWeek})`
      : `${month}월 ${day}일(${dayOfWeek})`;
  };

  const groupDates = (dates: string[]) => {
    if (dates.length <= 1) return dates.map((date) => formatDate(date, true));

    const result: string[] = [];
    let start = dates[0];
    let end = start;
    let previousYear = getKSTFullYear(start);

    for (let i = 1; i < dates.length; i++) {
      const curr = new Date(dates[i]);
      const prev = new Date(end);

      if (curr.getTime() - prev.getTime() === 24 * 60 * 60 * 1000) {
        end = dates[i];
      } else {
        if (start === end) {
          result.push(
            formatDate(
              start,
              result.length === 0 || getKSTFullYear(start) !== previousYear
            )
          );
        } else {
          const startYear = getKSTFullYear(start);
          const endYear = getKSTFullYear(end);
          const showStartYear =
            result.length === 0 || startYear !== previousYear;
          const showEndYear = startYear !== endYear;
          result.push(
            `${formatDate(start, showStartYear)} ~ ${formatDate(end, showEndYear)}`
          );
        }
        start = dates[i];
        end = start;
        previousYear = getKSTFullYear(start);
      }
    }

    if (start === end) {
      const currentYear = getKSTFullYear(start);
      result.push(
        formatDate(start, result.length === 0 || currentYear !== previousYear)
      );
    } else {
      const startYear = getKSTFullYear(start);
      const endYear = getKSTFullYear(end);
      const showStartYear = result.length === 0 || startYear !== previousYear;
      const showEndYear = startYear !== endYear;
      result.push(
        `${formatDate(start, showStartYear)} ~ ${formatDate(end, showEndYear)}`
      );
    }

    return result.map((date) => `주후 ${date}`);
  };

  return groupDates(dates).join(", ");
}
