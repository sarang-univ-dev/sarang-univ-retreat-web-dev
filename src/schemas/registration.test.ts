import { describe, it, expect } from "vitest";
import {
  validateLeaderName,
  leaderNameSchema,
  PHONE_REGEX,
  phoneSchema,
  retreatRegistrationSchema,
} from "@/schemas/registration";

describe("validateLeaderName", () => {
  it("정상 이름은 통과", () => {
    expect(validateLeaderName("홍길동")).toEqual({
      isValid: true,
      errorMessage: "",
    });
  });
  it("공백은 required 메시지", () => {
    expect(validateLeaderName("   ").errorMessage).toBe(
      "현재 GBS/EBS 리더를 입력해주세요"
    );
  });
  it.each(["모름", "없음", "??", "...", "x", "X", "-"])(
    "필러 값 '%s' 은 invalid 메시지",
    (v) => {
      expect(validateLeaderName(v).errorMessage).toBe(
        "리더 이름을 정확히 입력해주세요"
      );
    }
  );
  it.each(["홍길동 리더", "김간사", "이순장", "박GBS", "최EBS", "정새가족"])(
    "직책 접미사 '%s' 은 '이름만 적어주세요'",
    (v) => {
      expect(validateLeaderName(v).errorMessage).toBe("이름만 적어주세요");
    }
  );
});

describe("PHONE_REGEX / phoneSchema", () => {
  it("올바른 형식 통과", () => {
    expect(PHONE_REGEX.test("010-1234-5678")).toBe(true);
    expect(phoneSchema.safeParse("010-1234-5678").success).toBe(true);
  });
  it.each(["0101234", "010-123-5678", "011-1234-5678", "010-12345-678"])(
    "잘못된 형식 '%s' 실패",
    (v) => {
      expect(PHONE_REGEX.test(v)).toBe(false);
      expect(phoneSchema.safeParse(v).success).toBe(false);
    }
  );
});

describe("leaderNameSchema (zod)", () => {
  it("imperative 검증과 동일하게 거부", () => {
    expect(leaderNameSchema.safeParse("홍길동").success).toBe(true);
    expect(leaderNameSchema.safeParse("모름").success).toBe(false);
    expect(leaderNameSchema.safeParse("홍길동 리더").success).toBe(false);
  });
});

describe("retreatRegistrationSchema", () => {
  const valid = {
    univGroup: "1",
    grade: "11",
    name: "이조원",
    gender: "MALE" as const,
    phoneNumber: "010-1234-5678",
    currentLeaderName: "홍길동",
    scheduleSelection: [101],
    privacyConsent: true,
    userType: null,
  };
  it("정상 입력 통과", () => {
    expect(retreatRegistrationSchema.safeParse(valid).success).toBe(true);
  });
  it("일정 미선택 실패", () => {
    expect(
      retreatRegistrationSchema.safeParse({ ...valid, scheduleSelection: [] })
        .success
    ).toBe(false);
  });
  it("개인정보 미동의 실패", () => {
    expect(
      retreatRegistrationSchema.safeParse({ ...valid, privacyConsent: false })
        .success
    ).toBe(false);
  });
});
