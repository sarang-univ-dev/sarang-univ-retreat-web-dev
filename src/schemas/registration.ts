import { z } from "zod";

/**
 * 등록 폼 유효성 검사 규칙의 단일 출처(single source of truth).
 * 기존 retreat / bus 폼에 흩어져 중복돼 있던 정규식과 리더명 검증 로직을 모았다.
 * (규칙·메시지는 기존 동작과 1:1로 동일하게 유지)
 */

export const PHONE_REGEX = /^010-\d{4}-\d{4}$/;
export const PHONE_FORMAT_MESSAGE = "010-1234-5678 형식으로 적어주세요";

// 직책 접미사 패턴 (리더명 유효성 검사용)
export const TITLE_SUFFIX_PATTERN =
  /((리더|간사|고을지기|마을장|순장)(님)?|GBS|EBS|새가족)$/;

// 유효하지 않은 이름 패턴 (모름, ?, - 등)
export const INVALID_NAME_PATTERN =
  /^(모름|모르겠음|없음|없어요|몰라요|모름요|\?+|-+|x|X|\.+)$/;

export const LEADER_NAME_MESSAGES = {
  required: "현재 GBS/EBS 리더를 입력해주세요",
  invalid: "리더 이름을 정확히 입력해주세요",
  titleSuffix: "이름만 적어주세요",
} as const;

/** 리더명 유효성 검사 (기존 폼 로직 그대로). */
export function validateLeaderName(name: string): {
  isValid: boolean;
  errorMessage: string;
} {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return { isValid: false, errorMessage: LEADER_NAME_MESSAGES.required };
  }
  if (INVALID_NAME_PATTERN.test(trimmedName)) {
    return { isValid: false, errorMessage: LEADER_NAME_MESSAGES.invalid };
  }
  if (TITLE_SUFFIX_PATTERN.test(trimmedName)) {
    return { isValid: false, errorMessage: LEADER_NAME_MESSAGES.titleSuffix };
  }
  return { isValid: true, errorMessage: "" };
}

/** 위 imperative 규칙과 동일한 zod 스키마 (react-hook-form 등에서 재사용 가능). */
export const leaderNameSchema = z
  .string()
  .trim()
  .min(1, LEADER_NAME_MESSAGES.required)
  .refine((v) => !INVALID_NAME_PATTERN.test(v), LEADER_NAME_MESSAGES.invalid)
  .refine((v) => !TITLE_SUFFIX_PATTERN.test(v), LEADER_NAME_MESSAGES.titleSuffix);

export const PHONE_REQUIRED_MESSAGE = "전화번호를 입력해주세요";

/** 형식만 검사 (값 존재가 보장된 곳에서 사용). */
export const phoneSchema = z.string().regex(PHONE_REGEX, PHONE_FORMAT_MESSAGE);

/** 빈 값 → required, 비어있지 않으면 형식 검사 (폼 필드용). */
export const requiredPhoneSchema = z
  .string()
  .min(1, PHONE_REQUIRED_MESSAGE)
  .regex(PHONE_REGEX, PHONE_FORMAT_MESSAGE);

export const retreatRegistrationSchema = z.object({
  univGroup: z.string().min(1, "부서를 선택해주세요"),
  grade: z.string().min(1, "학년을 선택해주세요"),
  name: z.string().trim().min(1, "이름을 입력해주세요"),
  gender: z
    .string()
    .min(1, "성별을 선택해주세요")
    .refine((v) => v === "MALE" || v === "FEMALE", "성별을 선택해주세요"),
  phoneNumber: requiredPhoneSchema,
  currentLeaderName: leaderNameSchema,
  scheduleSelection: z.array(z.number()).min(1, "수양회 일정을 선택해주세요"),
  privacyConsent: z
    .boolean()
    .refine((v) => v === true, "개인정보 수집 및 이용에 동의해주세요"),
  userType: z.union([z.enum(["NEW_COMER", "SOLDIER"]), z.null()]),
});

export const busRegistrationSchema = z.object({
  univGroup: z.string().min(1, "부서를 선택해주세요"),
  grade: z.string().min(1, "학년을 선택해주세요"),
  name: z.string().trim().min(1, "이름을 입력해주세요"),
  gender: z
    .string()
    .min(1, "성별을 선택해주세요")
    .refine((v) => v === "MALE" || v === "FEMALE", "성별을 선택해주세요"),
  phoneNumber: requiredPhoneSchema,
  shuttleBusIds: z.array(z.number()),
  isAdminContact: z.boolean(),
  privacyConsent: z
    .boolean()
    .refine((v) => v === true, "개인정보 수집 및 이용에 동의해주세요"),
  agreeShuttleOnly: z
    .boolean()
    .refine((v) => v === true, "셔틀 이외의 이동 금지 사항에 동의해주세요"),
});
