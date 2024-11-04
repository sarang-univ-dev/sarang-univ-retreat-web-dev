// 헬퍼 함수: 날짜 문자열을 "M/D(요일)" 형식으로 변환 (로컬 시간 기준)
export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1; // 월은 0부터 시작하므로 +1
  const day = date.getDate();

  const weekdays = ["주일", "월", "화", "수", "목", "금", "토"];
  const dayOfWeek = weekdays[date.getDay()];

  return `${month}/${day}(${dayOfWeek})`;
};