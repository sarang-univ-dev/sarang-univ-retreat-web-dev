// /app/api/v1/retreats/[slug]/register/route.ts

import { NextResponse } from "next/server";
import axios from "axios";

// 요청 바디의 예상 구조를 정의
interface RegistrationData {
  gender: "male" | "female";
  grade_id: number;
  name: string;
  phone_number: string;
  schedule_selection: number[];
  // privacyConsent가 여전히 필요하다면 아래 줄의 주석을 해제하세요
  // privacyConsent?: boolean;
}

// 전화번호 유효성 검사 함수
const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^010-\d{4}-\d{4}$/;
  return phoneRegex.test(phone);
};

export async function POST(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const slug = await params.slug;
  try {

    // 요청 본문을 JSON으로 파싱
    const data: RegistrationData = await req.json();

    // 데이터 구조 분해 할당
    const {
      gender,
      grade_id,
      name,
      phone_number,
      schedule_selection /* privacyConsent */
    } = data;

    // 기본 유효성 검사
    if (
      !gender ||
      !["male", "female"].includes(gender) ||
      !grade_id ||
      !name ||
      !phone_number ||
      !Array.isArray(schedule_selection) ||
      schedule_selection.length === 0
      // privacyConsent가 필요하다면 아래 조건을 추가하세요
      // || typeof privacyConsent !== 'boolean'
    ) {
      return NextResponse.redirect(`/retreats/${slug}/registration-failure`, 303);
    }

    if (!isValidPhoneNumber(phone_number)) {
      return NextResponse.redirect(`/retreats/${slug}/registration-failure`, 303);
    }

    // privacyConsent가 필요하다면 아래 블록을 주석 해제하세요
    /*
    if (!privacyConsent) {
      return NextResponse.json(
        { error: '개인정보 수집 및 이용에 동의해야 합니다.' },
        { status: 400 }
      );
    }
    */

    // 제출할 데이터 구성
    const submissionData = {
      grade_id: Number(grade_id),
      schedule_selection: schedule_selection,
      phone_number: phone_number,
      name: name,
      gender: gender
    };

    // 외부 서버 URL 정의
    const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;

    if (!SERVER_URL) {
      throw { status: 500, message: "서버 구성 오류입니다." };
    }

    // 외부 서버로 POST 요청
    const response = await axios.post(
      `${SERVER_URL}/api/v1/retreats/${slug}/register`,
      submissionData,
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    if (response.status >= 200 && response.status < 300) {
      // Encode the user data to safely include them in the URL
      const queryParams = new URLSearchParams({
        name: name,
        gender: gender,
        phone: phone_number
      }).toString();

      return NextResponse.redirect(`/retreats/${slug}/registration-success?${queryParams}`, 303);
    } else {
      return NextResponse.redirect(`/retreats/${slug}/registration-failure`, 303);
    }
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.message);
      return NextResponse.redirect(`/retreats/${slug}/registration-failure`, 303);
    } else {
      console.error("Unexpected error:", (error as Error).message);
      return NextResponse.redirect(`/retreats/${slug}/registration-failure`, 303);
    }
  }
}
