# 사랑의교회 대학부 Retreat Web 에이전트 지침

## 브랜치와 PR 규칙

- 항상 최신 `origin/dev`에서 브랜치를 만든다. `master`에서 분기하지 않는다.
- 여러 repo를 함께 수정하는 작업은 각 repo마다 최신 `origin/dev`에서 별도 브랜치를 만들고 PR도 따로 연다.
- 여러 repo가 엮인 작업은 각 PR 본문에 병합 순서나 의존 PR을 적는다.
- 브랜치를 만들기 전 실행한다:
  - `git fetch origin dev`
  - `git switch -c <branch-name> origin/dev`
- 병합 전이나 ready 상태로 바꾸기 전, 브랜치 분기 이후 `dev`가 앞서가지 않았는지 확인한다:
  - `git fetch origin dev`
  - `git rev-list --count HEAD..origin/dev`
  - 결과는 반드시 `0`이어야 한다. `0`이 아니면 병합 전에 최신 `origin/dev`를 rebase하거나 merge한다.
- 필요한 경우 PR 본문이나 코멘트에 브랜치 최신성 확인 결과를 남긴다.

## 커밋 메시지 규칙

- 형식은 `<type>: <content>`를 사용한다.
- 허용되는 type은 `chore`, `docs`, `feat`, `fix`, `refactor`만이다.
- 콜론 뒤 content는 반드시 영어로 작성한다.
- 커밋 메시지는 짧고 구체적으로 쓴다.

## 엔지니어링 규칙

- 코드를 구현하거나 구현 방향을 논의할 때는 현재 best practice를 공식 문서나 신뢰 가능한 웹 자료로 크로스 체크한다.
- 일회성 코드, 이름만 바뀌는 얇은 wrapper, 사람이 로직을 읽는 흐름을 끊는 추상화는 피한다.
- 재사용 경계가 분명하지 않은 helper, mapper, predicate, local type alias, local interface는 추가하지 않는다.
- 라이브러리 계약이 이미 보장하는 내용을 중복 검증하지 않는다.
- route 문자열, env var 이름, status enum 값, API path, public URL path는 정확히 보존한다.
- 사용자의 변경을 덮어쓰거나 되돌리지 않는다. 수정 전과 staging 전에 `git status --short --branch`를 확인한다.
- secret은 출력하지 않는다. secret 값은 노출하지 않고 비교하거나 복사한다.

## Retreat Web 규칙

- 이 repo는 공개 수양회 신청 화면이다. copy, form 동작, validation, error state를 사용자에게 직접 보이는 product behavior로 다룬다.
- 기존 Next.js App Router, ky, React Query, Zod, React Hook Form, Radix, shared UI 패턴을 우선 사용한다.
- 서버 검증을 최종 기준으로 둔다. client validation은 UX를 개선하는 용도이며 API check를 대체하지 않는다.
- public UI flow에 admin-only endpoint, internal role data, operational detail을 노출하지 않는다.
- 신청과 셔틀버스 flow는 UI state와 API response shape을 함께 확인한다.
- 한국어 사용자 문구는 기존 용어와 일관되게 정확히 작성한다.
- 신청 flow를 바꿀 때 public URL path와 success/failure page 동작을 보존한다.
- copy를 바꿀 때는 repo 전체에서 기존 표현을 검색해 다른 page나 component에 오래된 한국어 문구가 남지 않게 한다.
- 군인/공익 관련 문구는 live codebase의 현재 승인된 용어를 따르고, 보이는 모든 위치를 일관되게 수정한다.
- 신청 및 셔틀버스 form의 schedule 선택은 client가 추론한 값이 아니라 server-owned ID에 계속 매핑되어야 한다.

## QA 규칙

- production-facing 변경은 `npm run typecheck`와 `npm run build`를 실행한다.
- validation이나 form logic을 건드렸고 관련 test가 있으면 `npm run test`를 실행한다.
- form flow, responsive layout, completion/error page는 사용 가능한 브라우저 검증 도구로 실제 화면에서 확인한다.
- 신청, 셔틀버스 신청, payment status 의존 동작 같은 side effect는 action 이후 database state나 API response를 확인한다.
- 작업이 명시적으로 요구하지 않는 한 실제 external-provider effect를 발생시키지 않는다.
- responsive UI 변경은 mobile과 desktop viewport를 모두 확인하고, 긴 한국어 문구가 button, card, form control 안에서 넘치지 않게 한다.
