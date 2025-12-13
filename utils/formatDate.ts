import { getKSTMonth, getKSTDate, getKSTDay } from "@/lib/date-utils"

// 헬퍼 함수: 날짜 문자열을 "M/D(요일)" 형식으로 변환 (KST 기준)
export const formatDate = (dateStr: string): string => {
  const month = getKSTMonth(dateStr) + 1 // 월은 0부터 시작하므로 +1
  const day = getKSTDate(dateStr)

  const weekdays = ["주일", "월", "화", "수", "목", "금", "토"]
  const dayOfWeek = weekdays[getKSTDay(dateStr)]

  return `${month}/${day}(${dayOfWeek})`
}
