// app/api/v1/retreats/[id]/route.ts

import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
) {
  const slug = req.nextUrl.pathname.split('/').pop();
  const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;

  if (!SERVER_URL) {
    return NextResponse.json(
      { error: "서버 URL이 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  try {
    const response = await axios.get(`${SERVER_URL}/api/v1/retreat/${slug}/info`);

    if (response.status !== 200) {
      console.error("서버 오류:", response.data);
      return NextResponse.json(
        { error: response.data.error || "서버에서 데이터를 불러오지 못했습니다." },
        { status: response.status }
      );
    }

    const retreatData = response.data.retreatInfo;

    return NextResponse.json(retreatData);
  } catch (error) {
    // axios 에러 처리
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.message);
      return NextResponse.json(
        { error: error.response?.data?.error || "Retreat data could not be fetched." },
        { status: error.response?.status || 500 }
      );
    } else {
      console.error("Unexpected error:", (error as Error).message);
      return NextResponse.json(
        { error: "An unexpected error occurred." },
        { status: 500 }
      );
    }
  }
}
