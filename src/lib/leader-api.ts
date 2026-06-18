import ky from "ky";
import { SERVER_URL } from "@/config/env";
import { normalizeServerError } from "@/lib/ky";

/**
 * 리더 포털 전용 ky 인스턴스.
 *
 * 공용 `api` 와의 차이점:
 *  - `credentials: "include"` — 서버가 /login 에서 내려준 httpOnly 쿠키
 *    (`leaderAccessToken`) 를 모든 요청에 같이 보낸다. cross-origin 이라도
 *    same-site 쿠키가 전송되려면 포털이 API 와 같은 상위 도메인의
 *    서브도메인에서 열려야 한다. (로컬: local.retreat.sarang-univ.com)
 *  - 그 외 prefixUrl / retry / beforeError 정규화는 `api` 와 동일하게 공유한다.
 *
 * 기존 `api` 는 건드리지 않는다.
 */
export const leaderApi = ky.create({
  prefixUrl: SERVER_URL,
  credentials: "include",
  retry: 0,
  hooks: {
    beforeError: [normalizeServerError],
  },
});
