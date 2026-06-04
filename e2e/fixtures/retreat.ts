// Deterministic fixtures for E2E. Offsets are relative to "now" so the
// registration period stays open/closed regardless of when tests run.
const TODAY = new Date();

const isoAt = (daysOffset: number, hour: number, minute = 0) => {
  const d = new Date(TODAY.getTime() + daysOffset * 24 * 60 * 60 * 1000);
  d.setUTCHours(hour, minute, 0, 0);
  return d.toISOString();
};

const inDays = (n: number) =>
  new Date(TODAY.getTime() + n * 24 * 60 * 60 * 1000).toISOString();

export const openPeriodRetreatInfo = {
  retreat: {
    id: 1,
    slug: "test-retreat",
    name: "UNASHAMED",
    location: "사랑의교회 안성수양관",
    mainVerse: "주의 말씀은 내 발에 등이요 내 길에 빛이니이다 (시 119:105)",
    mainSpeaker: "김길동 목사",
    memo: "테스트용 안내 메모",
    posterUrl: undefined as string | undefined,
    qrMetadata: undefined,
    createdAt: TODAY.toISOString(),
    updatedAt: TODAY.toISOString(),
  },
  univGroupAndGrade: [
    {
      univGroupId: 1,
      univGroupName: "사랑부",
      univGroupNumber: 1,
      grades: [
        { gradeId: 11, gradeName: "예수마을", gradeNumber: 1 },
        { gradeId: 12, gradeName: "사랑마을", gradeNumber: 2 },
      ],
    },
    {
      univGroupId: 2,
      univGroupName: "소망부",
      univGroupNumber: 2,
      grades: [{ gradeId: 21, gradeName: "소망마을", gradeNumber: 1 }],
    },
  ],
  schedule: [
    { id: 101, retreatId: 1, time: isoAt(30, 22), type: "SLEEP", createdAt: TODAY.toISOString() },
    { id: 102, retreatId: 1, time: isoAt(31, 22), type: "SLEEP", createdAt: TODAY.toISOString() },
    { id: 103, retreatId: 1, time: isoAt(31, 8), type: "BREAKFAST", createdAt: TODAY.toISOString() },
    { id: 104, retreatId: 1, time: isoAt(31, 12), type: "LUNCH", createdAt: TODAY.toISOString() },
    { id: 105, retreatId: 1, time: isoAt(31, 18), type: "DINNER", createdAt: TODAY.toISOString() },
  ],
  payment: [
    {
      id: 1,
      retreatId: 1,
      name: "얼리버드",
      totalPrice: 90000,
      partialPricePerSchedule: 20000,
      startAt: inDays(-5),
      endAt: inDays(5),
      createdAt: TODAY.toISOString(),
    },
    {
      id: 2,
      retreatId: 1,
      name: "정규신청",
      totalPrice: 110000,
      partialPricePerSchedule: 25000,
      startAt: inDays(5),
      endAt: inDays(20),
      createdAt: TODAY.toISOString(),
    },
  ],
};

export const closedPeriodRetreatInfo = {
  ...openPeriodRetreatInfo,
  payment: [
    {
      id: 1,
      retreatId: 1,
      name: "얼리버드",
      totalPrice: 90000,
      partialPricePerSchedule: 20000,
      startAt: inDays(-30),
      endAt: inDays(-10),
      createdAt: TODAY.toISOString(),
    },
  ],
};

export const shuttleBusInfo = {
  retreat: openPeriodRetreatInfo.retreat,
  univGroupAndGrade: openPeriodRetreatInfo.univGroupAndGrade,
  retreatRegisterSchedules: openPeriodRetreatInfo.schedule,
  shuttleBuses: [
    {
      id: 201,
      retreatId: 1,
      name: "1호차 (목요일 오전 출발)",
      direction: "FROM_CHURCH_TO_RETREAT",
      price: 15000,
      departureTime: isoAt(30, 1),
      arrivalTime: isoAt(30, 4),
      adminUserIds: [],
      createdAt: TODAY.toISOString(),
    },
    {
      id: 202,
      retreatId: 1,
      name: "2호차 (목요일 오후 출발)",
      direction: "FROM_CHURCH_TO_RETREAT",
      price: 15000,
      departureTime: isoAt(30, 9),
      arrivalTime: isoAt(30, 12),
      adminUserIds: [],
      createdAt: TODAY.toISOString(),
    },
    {
      id: 203,
      retreatId: 1,
      name: "3호차 (토요일 복귀)",
      direction: "FROM_RETREAT_TO_CHURCH",
      price: 15000,
      departureTime: isoAt(32, 5),
      arrivalTime: isoAt(32, 8),
      adminUserIds: [],
      createdAt: TODAY.toISOString(),
    },
  ],
};

export const univGroupInfoResponse = {
  retreatUnivGroup: [
    {
      retreatId: 1,
      univGroupId: 1,
      information: {
        deposit_account: "신한은행 123-456-789",
        deposit_account_holder: "사랑의교회",
        shuttle_bus_deposit_account: "신한은행 111-222-333",
        shuttle_bus_deposit_account_holder: "사랑의교회 셔틀",
      },
    },
  ],
};
