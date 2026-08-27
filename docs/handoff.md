# 핸드오프 — 2026-08-27

혼자 이어서 할 때 필요한 것만. 결정된 이유와 아직 안 한 것.

## 이 저장소가 하는 일

나스에 **헤르메스를 도커로 올리고, 브라우저에서 첫 설정을 끝내게** 한다.
업스트림 헤르메스 대시보드(`:9119`)는 이미 다 아는 사람 것이라, 그 앞에
초심자용 화면(`:9120`)을 한 겹 뒀다. 익숙해지면 본판으로 넘어가고 이 화면은
다시 안 열어도 된다.

```
gateway        헤르메스 본체. 텔레그램 롱폴 + OpenAI 호환 API(:8642, 내부 전용)
dashboard      헤르메스 본판 UI  :9119
setup          초심자 포탈       :9120   ← 이 저장소가 만든 것
socket-proxy   게이트웨이 재시작만 허용. 포트 없음
```

## 오늘 만든 것

**`setup/` — 초심자 포탈.** FastAPI + React(Vite). 다섯 단계(API 키 · 모델 ·
텔레그램 · 도구 · 완료)와 대화 탭.

- `/opt/data/.env` 와 `/opt/data/config.yaml` 만 쓴다. 헤르메스가 실제로 읽는
  경로라(`hermes config path` / `env-path` 로 확인) **컨테이너 재시작만으로 반영**된다.
  compose 의 `.env` 에 쓰면 recreate 가 필요하고, recreate 는 훨씬 큰 도커 권한을 요구한다
- config 는 ruamel round-trip 으로 쓴다. 헤르메스가 넣어둔 **주석 1,705줄이 보존**된다
- 로그인은 폼 + 서명 세션 쿠키(12h). `DASHBOARD_*` 를 대시보드와 공유한다
- 대화는 게이트웨이의 `/v1/chat/completions` 를 탄다. `X-Hermes-Session-Id` 로
  맥락을 잇고, "새 대화" 는 그 id 를 버리는 것

**`docs/deploy.md` / `deploy.en.md`** — 복붙 설치. 일반 도커·포테이너 + DSM.
문서 안 compose 는 `docker compose config` 로 검증했다.

**`.github/workflows/publish-setup.yml`** — ghcr 발행(amd64 + arm64).

**브랜드 자산** — `docs/og-image.png` · `hero.png` · `favicon.svg`.

## 검증한 것 / 안 한 것

| | |
|---|---|
| 설정 화면 전 구간 | 로컬에서 실동작 확인 (로그인·모델 목록·MCP 설치·재시작) |
| 무료 모델 목록 | OpenRouter 라이브 조회 17개 확인 |
| 대화 | `/health` ready:true 까지. **키를 안 넣어서 실제 응답은 미확인** |
| 텔레그램 | **미검증.** 토큰을 안 넣었다 |
| 복붙 compose | `config` 통과. **다른 나스에서 실제 기동은 안 해봄** |
| ghcr 이미지 | **아직 없다.** push 해서 워크플로가 돌아야 생긴다 |

## 되돌아가지 않기 위해 — 왜 이 모양인가

**프론트엔드를 만들지 마라.** hermes-webui 17,766★ · hermes-desktop 14,044★ 가
이번 주에도 커밋된다. 우리가 만든 건 채팅 프론트가 아니라 **설정 마법사**다.
대화 탭은 텔레그램 붙이기 전 임시 확인용이고, 그래서 "보내기 / 새 대화" 둘뿐이다.

**초심자 포탈이 기준이다.** 이 선으로 잘랐다.

| 넣는다 | 안 넣는다 |
|---|---|
| 클릭·붙여넣기로 끝나는 것 | 남의 사이트에서 개발자 설정을 켜야 하는 것 |
| 우리가 대신 알아내 주는 값 | 사용자가 어딘가에서 복사해 와야 하는 값 |

- **디스코드를 뺐다** — 개발자 포털 · Message Content Intent · 서버 초대 ·
  개발자 모드 켜서 ID 복사. 관문이 넷이다. 텔레그램은 봇파더 → 토큰이 전부고
  chat id 는 우리가 찾아준다
- **2단계 인증을 뺐다** — 인증 앱 설치부터 시작하면 관문이 하나 더 는다.
  구현은 됐었고 커밋 전에 걷어냈다
- **MCP 는 5개만** — 카탈로그 65개는 대부분 OAuth 라 컨테이너에서 인증을 못 끝낸다
  (실제로 `OAuthNonInteractiveError ... parked` 를 봤다). 그리고 **카탈로그에
  filesystem 이 아예 없다** — 나스에 두는 가장 큰 이유인데
- **compose 생성 기능을 안 만든다** — 그걸 만들려면 이 화면이 떠 있어야 하고,
  그러려면 compose 가 이미 돌고 있어야 한다

## 알아낸 함정

**`HERMES_WRITE_SAFE_ROOT` 기본값이 `/opt/data` 다.** 그대로 두면 에이전트가
`/files` 를 읽기만 하고 못 쓴다. 나스 공유를 붙였는데 "저장이 안 된다" 의 정체다.
여러 경로를 받으므로 `/opt/data:/files` 로 넘긴다.

**`/opt/data/.env` 가 컨테이너 env 를 이긴다** (override=True). 같은 키를 양쪽에
두면 파일 쪽이 먹는다. 기동 로그에 경고가 뜬다.

**`index.html` 에 캐시 헤더가 없으면 옛 번들이 물린다.** 자산은 해시가 붙어
바뀌는데 그걸 가리키는 index 가 캐시되면 화면이 그대로다. `no-store` 를 준다.

**텔레그램 `getUpdates` 는 먼저 묻는 쪽에 한 번만 준다.** 게이트웨이가 같은
토큰을 롱폴 중이면 목록이 빈다. 서버가 조회 동안 게이트웨이를 멈췄다가
`finally` 로 **반드시 되살린다** — 내려간 채 남는 게 빈 목록보다 나쁜 고장이다.

**대시보드 인증은 HTTP Basic 이 아니다.** 환경변수 이름만 `..._BASIC_AUTH_...`
이고 실제로는 `/auth/password-login` 에 POST 하는 폼 로그인이다. `provider: "basic"`
필드가 필요하다. `curl -u` 로 테스트하면 302 만 나온다.

**config.yaml 이 env 를 이긴다.** `dashboard_auth.basic.username/password` 를
config 에 쓰면 그쪽이 우선이다. 지금은 그 항목이 없어서 env 가 먹는다.

## 남은 일

### 1. 실제 값으로 끝까지 검증

OpenRouter 키를 넣고 모델을 골라 **대화가 실제로 오가는지**, 텔레그램 토큰으로
**테스트 메시지가 폰에 도착하는지** 확인한다. 둘 다 아직 안 해봤다.

### 2. 공개

```bash
gh repo create awesome-hermes-starter --public --source=. --remote=origin --push
```

push 하면 워크플로가 돌아 `ghcr.io/jshsakura/hermes-starter-setup:latest` 가 생긴다.
**그 전에는 `docs/deploy.md` 대로 복붙해도 pull 이 실패한다.**

패키지가 private 으로 생기면 ghcr 패키지 설정에서 public 으로 바꿔야 한다.

### 3. 공개 후

[`0xNyk/awesome-hermes-agent`](https://github.com/0xNyk/awesome-hermes-agent)(5,464★)에
PR 을 넣으면 유입이 생긴다 — 한국어 항목이 거기에 없다.

## 정하지 않은 것

**브랜드 이미지와 앱 팔레트가 다르다.** og-image·파비콘은 앰버/브라운
(`#170d02` + `#ffac02`), 앱 화면은 헤르메스 실제 테마인 딥틸/크림
(`#041c1c` + `#ffe6cb`). 깃허브에서 보는 색과 열었을 때 색이 어긋난다.
어느 쪽으로 통일할지 미정.

## 확장 후보 (범위 밖)

- **점검표** — 완료 단계의 "테스트 해보기" 를 키·모델·게이트웨이·도구·응답
  각각의 PASS/FAIL 로. evey-setup 의 `verify.sh` 발상. 실패해도 혼자 풀 수 있게 된다
- **`--yolo` 경고** — 승인 프롬프트를 끄면 에이전트가 확인 없이 파일을 지운다.
  지금 아예 안 다루고 있다
- **BYOK 연료 확장** — Cerebras · Google AI Studio 무료 키를 OpenRouter
  Integrations 에 꽂으면 공유 풀이 아니라 내 쿼터로 돈다. 하루 50회 천장을 넘는 유일한 길
