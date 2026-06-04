import { api } from "@/lib/ky";
import type { RetreatInfo, ShuttleBusInfo } from "@/types";

export interface RegistrationStatusResponse {
  retreat: { slug: string; name: string };
  univGroup: { number: number; name: string };
  count: number;
  updatedAt: string;
}

/** GET /api/v1/retreat/:slug/registration/public-status/departments/:univGroupNumber */
export async function fetchRegistrationStatus(
  slug: string,
  univGroupNumber: string,
  signal?: AbortSignal
): Promise<RegistrationStatusResponse> {
  return api
    .get(
      `api/v1/retreat/${slug}/registration/public-status/departments/${univGroupNumber}`,
      { signal }
    )
    .json<RegistrationStatusResponse>();
}

/** GET /api/v1/retreat/:slug/info -> { retreatInfo } */
export async function fetchRetreatInfo(slug: string): Promise<RetreatInfo> {
  const data = await api
    .get(`api/v1/retreat/${slug}/info`)
    .json<{ retreatInfo: RetreatInfo }>();
  return data.retreatInfo;
}

/** GET /api/v1/retreat/:slug/shuttle-bus/info -> { shuttleBusInfo } */
export async function fetchShuttleBusInfo(
  slug: string
): Promise<ShuttleBusInfo> {
  const data = await api
    .get(`api/v1/retreat/${slug}/shuttle-bus/info`)
    .json<{ shuttleBusInfo: ShuttleBusInfo }>();
  return data.shuttleBusInfo;
}

export interface RetreatUnivGroupInfo {
  retreatId: number;
  univGroupId: number;
  information: {
    deposit_account?: string;
    deposit_account_holder?: string;
    shuttle_bus_deposit_account?: string;
    shuttle_bus_deposit_account_holder?: string;
  } | null;
}

/** GET /api/v1/retreat/:slug/univ-group-info -> { retreatUnivGroup } */
export async function fetchUnivGroupInfo(
  slug: string
): Promise<RetreatUnivGroupInfo[]> {
  const data = await api
    .get(`api/v1/retreat/${slug}/univ-group-info`)
    .json<{ retreatUnivGroup: RetreatUnivGroupInfo[] }>();
  return data.retreatUnivGroup;
}
