import { useFormContext } from "react-hook-form";
import type { RetreatFormValues, BusFormValues } from "@/schemas/registration";

/**
 * 수양회/셔틀버스 등록 폼의 타입이 박힌 useFormContext 래퍼.
 * 각 필드/섹션 컴포넌트에서 제네릭 인자를 반복 지정하지 않도록 한 곳에 모은다.
 */
export const useRetreatForm = () => useFormContext<RetreatFormValues>();
export const useBusForm = () => useFormContext<BusFormValues>();
