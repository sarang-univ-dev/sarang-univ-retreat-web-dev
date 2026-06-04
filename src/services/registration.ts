import { api } from "@/lib/ky";

export interface RetreatRegistrationPayload {
  name: string;
  phoneNumber: string;
  gender: string;
  gradeId: number;
  retreatId: number;
  currentLeaderName: string;
  retreatRegistrationScheduleIds: number[];
  userType: string | null;
}

export interface ShuttleBusRegistrationPayload {
  name: string;
  phoneNumber: string;
  gender: string;
  gradeId: number;
  retreatId: number;
  shuttleBusIds: number[];
  isAdminContact: boolean;
}

/** POST /api/v1/retreat/:slug/registration — 비 2xx 응답은 HTTPError로 throw */
export async function submitRetreatRegistration(
  slug: string,
  payload: RetreatRegistrationPayload
): Promise<unknown> {
  return api.post(`api/v1/retreat/${slug}/registration`, { json: payload }).json();
}

/** POST /api/v1/retreat/:slug/shuttle-bus/register — 비 2xx 응답은 HTTPError로 throw */
export async function submitShuttleBusRegistration(
  slug: string,
  payload: ShuttleBusRegistrationPayload
): Promise<unknown> {
  return api
    .post(`api/v1/retreat/${slug}/shuttle-bus/register`, { json: payload })
    .json();
}
