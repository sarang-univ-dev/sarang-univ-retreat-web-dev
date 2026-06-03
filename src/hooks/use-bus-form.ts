import { useFormContext } from "react-hook-form";
import type { BusFormValues } from "@/schemas/registration";

/** 셔틀버스 등록 폼의 타입이 박힌 useFormContext 래퍼. */
export const useBusForm = () => useFormContext<BusFormValues>();
