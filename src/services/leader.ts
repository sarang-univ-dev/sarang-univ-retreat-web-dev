import { leaderApi } from "@/lib/leader-api";
import type { UserRetreatRegistrationPaymentStatus } from "@/types";

// #region Types

export type AttendanceStatus = "PRESENT" | "ABSENT";

export type ScheduleChangeRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface LeaderSummary {
  userId: number;
  name: string;
  gbsId: number;
  gbsNumber: number;
}

export interface LeaderMe extends LeaderSummary {
  retreatSlug: string;
  retreatName: string;
}

export interface LeaderTodayResponse {
  today: string | null;
  days: string[];
  lastDay: string | null;
  isLastDay: boolean;
}

export interface LeaderMemberScheduleChangeRequest {
  id: number;
  status: ScheduleChangeRequestStatus;
  afterScheduleIds: number[];
  reason: string;
}

export interface LeaderMember {
  userRetreatRegistrationId: number;
  userId: number;
  name: string;
  gender: string;
  gradeNumber: number;
  univGroupNumber: number;
  currentLeaderName: string;
  price: number;
  paymentStatus: UserRetreatRegistrationPaymentStatus;
  scheduleIds: number[];
  isLeader: boolean;
  todayAttendanceStatus: AttendanceStatus | null;
  todayMemo: string | null;
  latestScheduleChangeRequest: LeaderMemberScheduleChangeRequest | null;
}

export interface LeaderReport {
  graceSharing: string;
  prayerRequests: string;
  updatedAt: string;
}

export interface AttendanceEntry {
  userRetreatRegistrationId: number;
  status: AttendanceStatus;
  memo?: string | null;
}

export interface ScheduleChangeRequest {
  id: number;
  userRetreatRegistrationId: number;
  status: ScheduleChangeRequestStatus;
  afterScheduleIds: number[];
  reason: string;
  createdAt: string;
}

// #endregion

const base = (slug: string) => `api/v1/retreat/${slug}/leader`;

/** POST /login — body { phone } → 쿠키 설정 + { leader } */
export async function leaderLogin(
  slug: string,
  phone: string
): Promise<{ leader: LeaderSummary }> {
  return leaderApi
    .post(`${base(slug)}/login`, { json: { phone } })
    .json<{ leader: LeaderSummary }>();
}

/** POST /logout → { success } */
export async function leaderLogout(
  slug: string
): Promise<{ success: boolean }> {
  return leaderApi
    .post(`${base(slug)}/logout`)
    .json<{ success: boolean }>();
}

/** GET /me → { leader } (401 if not logged in) */
export async function fetchLeaderMe(
  slug: string
): Promise<{ leader: LeaderMe }> {
  return leaderApi.get(`${base(slug)}/me`).json<{ leader: LeaderMe }>();
}

/** GET /today → { today, days, lastDay, isLastDay } */
export async function fetchLeaderToday(
  slug: string
): Promise<LeaderTodayResponse> {
  return leaderApi.get(`${base(slug)}/today`).json<LeaderTodayResponse>();
}

/** GET /members → { members } */
export async function fetchLeaderMembers(
  slug: string
): Promise<{ members: LeaderMember[] }> {
  return leaderApi
    .get(`${base(slug)}/members`)
    .json<{ members: LeaderMember[] }>();
}

/** POST /attendance — body { date, entries } → { count, date } */
export async function submitLeaderAttendance(
  slug: string,
  payload: { date: string; entries: AttendanceEntry[] }
): Promise<{ count: number; date: string }> {
  return leaderApi
    .post(`${base(slug)}/attendance`, { json: payload })
    .json<{ count: number; date: string }>();
}

/** GET /reports?date=YYYY-MM-DD → { report | null } */
export async function fetchLeaderReport(
  slug: string,
  date: string
): Promise<{ report: LeaderReport | null }> {
  return leaderApi
    .get(`${base(slug)}/reports`, { searchParams: { date } })
    .json<{ report: LeaderReport | null }>();
}

/** POST /reports — body { date, graceSharing, prayerRequests } → { report } */
export async function submitLeaderReport(
  slug: string,
  payload: { date: string; graceSharing: string; prayerRequests: string }
): Promise<{ report: LeaderReport }> {
  return leaderApi
    .post(`${base(slug)}/reports`, { json: payload })
    .json<{ report: LeaderReport }>();
}

/** GET /schedule-change-requests → { requests } */
export async function fetchLeaderScheduleChangeRequests(
  slug: string
): Promise<{ requests: ScheduleChangeRequest[] }> {
  return leaderApi
    .get(`${base(slug)}/schedule-change-requests`)
    .json<{ requests: ScheduleChangeRequest[] }>();
}

/** POST /schedule-change-requests — body { userRetreatRegistrationId, afterScheduleIds, reason } → { request } (409 if PENDING exists) */
export async function submitLeaderScheduleChangeRequest(
  slug: string,
  payload: {
    userRetreatRegistrationId: number;
    afterScheduleIds: number[];
    reason: string;
  }
): Promise<{ request: ScheduleChangeRequest }> {
  return leaderApi
    .post(`${base(slug)}/schedule-change-requests`, { json: payload })
    .json<{ request: ScheduleChangeRequest }>();
}
