"use client";

import { useParams } from "next/navigation";

/**
 * 동적 라우트의 `[slug]` 세그먼트를 `string` 으로 좁혀 반환한다.
 *
 * `useParams()` 의 값은 런타임상 `string | string[] | undefined` 일 수 있어,
 * `useParams<{ slug: string }>()` 의 제네릭은 보장 없는 "거짓 타입"이다.
 * 그래서 경계에서 한 번만 파싱(parse, don't validate)해 이후 코드에서는
 * `slug as string` 같은 캐스팅 없이 안전하게 `string` 으로 다룬다.
 * 값이 없거나 string 이 아니면(예: catch-all 라우트) throw 하여 잘못된
 * 상태가 표현 불가능하도록 만든다.
 */
export function useSlug(): string {
  const params = useParams<{ slug: string | string[] }>();
  const slug = params?.slug;

  if (typeof slug !== "string") {
    throw new Error(
      `라우트 파라미터 'slug' 가 string 이 아닙니다: ${JSON.stringify(slug)}`
    );
  }

  return slug;
}
