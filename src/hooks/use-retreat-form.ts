import { useFormContext } from "react-hook-form";
import type { RetreatFormValues } from "@/schemas/registration";

/** 수양회 등록 폼의 타입이 박힌 useFormContext 래퍼. */
export const useRetreatForm = () => useFormContext<RetreatFormValues>();
