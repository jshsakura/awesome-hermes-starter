# awesome-hermes-starter

한국어 · **[English](README.en.md)**

**초보자를 위한 [Hermes Agent](https://github.com/NousResearch/Hermes-Agent) 설정 도우미.**

`docker compose up` 하나로 띄우고, **나머지는 브라우저에서** 끝낸다.
터미널로 키를 붙여넣을 일이 없다. 카드도 필요 없다. NAS·홈서버 기준이다.

```bash
git clone https://github.com/jshsakura/awesome-hermes-starter && cd awesome-hermes-starter
cp .env.example .env                                    # 로그인 계정만 정한다
HERMES_UID=$(id -u) HERMES_GID=$(id -g) docker compose up -d
# → http://<서버주소>:9120  ← 여기서 다섯 단계
```

**나스에 올리는 사람은 [기종별 복붙 설치 문서](docs/deploy.md)를 보면 된다** —
일반 도커·포테이너와 Synology DSM 두 갈래로 적었다. 터미널이 필요 없다.

## 브라우저에서 끝나는 첫 설정

`docker compose up` 뒤에 **`http://<서버주소>:9120`** 을 열면 초심자용 설정 화면이 뜬다.
헤르메스 본판 대시보드(`:9119`)는 이미 다 아는 사람을 위한 것이라, 그 앞에 한 겹을 뒀다.

| 단계 | |
|---|---|
| **API 키** | OpenRouter 키 발급 절차를 화면에 적어두고, 붙여넣으면 즉시 검증한다 |
| **모델** | 지금 실제로 무료인 모델만 라이브로 불러온다. 도구 호출 가능 여부·컨텍스트 크기를 같이 보여주고 폴백도 같이 고른다 |
| **텔레그램** | @BotFather 절차부터 `/start` 까지 안내하고, **chat id 는 대신 찾아준다.** 마지막에 테스트 메시지를 실제로 쏜다 |
| **도구** | 가입도 키도 필요 없는 MCP 다섯 개. 권장 3종은 버튼 하나로 |
| **완료** | 적용·재시작하고 **에이전트에게 실제로 한 마디 물어본다** |

여기까지 끝나면 헤르메스 본판으로 넘어가는 링크가 나온다. **익숙해지면 그쪽을 쓰면 된다.**
설정 화면은 그 뒤로 안 열어도 된다.

한국어·영어를 화면에서 토글할 수 있다.

---

아래 절반은 **한국어 큐레이션 목록**이다. 헤르메스 생태계는 이미 크고
(본체 236,907★) 좋은 게 다 있는데, 한국어로 정리된 게 없다.

---

## 왜 이게 따로 필요한가

헤르메스는 **설치가 어려운 게 아니다.** `curl | bash` 한 줄이면 깔린다. 어려운 건 그 다음이다.

- **터미널을 계속 쓴다.** `source ~/.bashrc` → `hermes model` → `hermes setup`
- **호스트를 건드린다.** uv · Python 3.11 · Node.js · ripgrep · ffmpeg 가 깔린다.
  도커 경로가 있지만 업스트림 compose 는 `build: .` 라 SQLite 부터 소스 빌드한다
- **결국 유료 키가 필요하다.** 프로바이더 키를 구하거나 구독을 해야 첫 마디를 뗀다

이 배포판은 셋을 없앤다. 브라우저만 쓰고, 호스트엔 도커 말고 아무것도 안 깔고,
**OpenRouter 무료 모델**로 시작한다.

## 들어있는 것

| 서비스 | 하는 일 |
|---|---|
| `gateway` | 텔레그램으로 대화. 롱폴이라 **포트를 안 연다** |
| `dashboard` | 웹 UI. 열려 있으므로 **ID/PW 로그인 필수** |
| `freemodels` | 무료 모델 목록 자동 갱신 (선택) |

이미지는 공개 이미지 `nousresearch/hermes-agent:latest`. **빌드가 없고 버전을 고정하지
않는다** — 헤르메스는 항상 최신이 뜬다. 이 저장소는 compose 와 문서뿐이고, 헤르메스를
포크하지도 수정하지도 않는다.

## 처음 켤 때

`.env` 에 적을 것은 **로그인 정보 두 줄과 무작위 문자열 두 개**가 전부다.
API 키도 봇 토큰도 여기 안 적는다.

```bash
cp .env.example .env

# DASHBOARD_USER / DASHBOARD_PASSWORD  — 두 화면이 같이 쓰는 계정
# DASHBOARD_SECRET=$(openssl rand -hex 32)
# API_SERVER_KEY=$(openssl rand -hex 24)

HERMES_UID=$(id -u) HERMES_GID=$(id -g) docker compose up -d
```

그리고 **`http://<서버주소>:9120`** 을 열어 다섯 단계를 따라가면 된다.
OpenRouter 키 발급도, 텔레그램 봇 만들기도 화면이 안내한다.

> **`TELEGRAM_ALLOWED_USERS` 를 비워두지 마라.** 비어 있으면 봇을 찾은 아무나
> 내 에이전트와 대화한다 — 내 파일, 내 키, 내 쿼터로. 설정 화면이 대신 채워주고,
> 비어 있으면 저장 자체를 거부한다.

터미널에서 직접 하고 싶다면 `scripts/telegram-chat-id.sh` 가 chat id 를 찍어준다.
그때는 **먼저 `docker compose stop gateway`** 로 게이트웨이를 멈춰야 한다 —
텔레그램은 같은 토큰의 업데이트를 먼저 묻는 쪽에 한 번만 주기 때문이다.

## 무료 모델은 계속 바뀐다

2026-08-27 하루에만 `deepseek-chat-v3.1:free`, `llama-3.3-70b:free`,
`gemma-3-27b:free` 셋이 무료판을 잃었다 — **이름은 그대로인 채로.**
모델 id 를 박아두면 어느 날 조용히 안 된다.

[free-rotator](https://github.com/GoSlowPoke168/hermes-openrouter-free-rotator)가 매일
목록을 다시 읽어 `model.default` 와 폴백을 갈아준다. 다만 그건 **시스템 crontab** 을 쓰는데
컨테이너 안엔 cron 데몬이 없다. 그래서 `freemodels` 서비스가 crontab 대신 잠들었다 깨는
루프로 같은 명령을 돌린다 (**00:01 UTC** — 무료 쿼터가 UTC 자정에 리셋되기 때문).

내 config 를 고쳐 쓰는 서비스라 기본은 꺼져 있다:

```bash
docker compose exec gateway hermes plugins install GoSlowPoke168/hermes-openrouter-free-rotator
docker compose --profile freemodels up -d
```

## 알아둘 것

**무료 티어는 하루 50번.** 실패한 429 도 카운트되고 UTC 자정(한국시간 **09:00**)에 리셋된다.
**$10 을 한 번 충전하면 1,000회/일로 영구히 올라간다** — 잔액 조건이 아니라 평생 해금이라
크레딧을 다 써도 등급은 유지된다. 더 넣어도 그 이상은 안 오른다.

**무료판은 같은 모델의 더 눌린 사본이다.** 무료 엔드포인트는 fp4·fp8·nvfp4 로 돌고 bf16 이
하나도 없다. `nemotron-3.5-lightning` 은 유료가 bf16, 무료가 nvfp4다.

**프롬프트가 학습에 쓰일 수 있다.** 무료 엔드포인트 상당수가 OpenRouter 계정의 Privacy
토글(*Free endpoints that may train on request data* 등)을 켜야 열린다.

**`./files` 만 에이전트에게 보인다.** NAS 공유 전체를 마운트하지 마라.
`./data` 가 헤르메스가 기억하는 전부다 — 백업 대상은 여기다.

**대시보드는 인증 없이는 아예 안 뜬다.** 비루프백 바인드에 인증 provider 가 없으면 서버가
기동을 거부한다(`--insecure` 는 2026-06 하드닝 이후 무효).

---

# 큐레이션 목록

별 수는 2026-08-27 기준. **관리되지 않는 것도 솔직히 표시했다** — 링크만 모아두면
막다른 길로 보내게 된다.

## 프론트엔드

내장 대시보드가 이미 쓸 만하지만, 더 나은 게 여럿 있다. **새로 만들 생각은 접는 게 좋다.**

| | ★ | |
|---|---|---|
| [hermes-webui](https://github.com/nesquena/hermes-webui) | 17,759 | 웹·모바일에서 쓰는 가장 인기 있는 프론트 |
| [hermes-desktop](https://github.com/fathah/hermes-desktop) | 14,044 | 데스크톱 앱 |
| [hermes-workspace](https://github.com/outsourc-e/hermes-workspace) | 6,516 | 채팅·터미널·기억·스킬·인스펙터 통합 워크스페이스 |

## 배포 · 도커

| | ★ | |
|---|---|---|
| [evey-setup](https://github.com/42-evey/evey-setup) | 65 | 무료 모델 + 플러그인 29개를 한 번에. **이 저장소와 목적이 가장 가깝다** |
| [hermes-agent-docker](https://github.com/xmbshwll/hermes-agent-docker) | 48 | 최소 도커 샌드박스 이미지 |
| [Nora](https://github.com/solomon2773/Nora) | 47 | 도커·쿠버네티스용 셀프호스트 컨트롤 플레인 (RBAC) |
| [nix-hermes-agent](https://github.com/0xrsydn/nix-hermes-agent) | 42 | Nix / NixOS 모듈로 재현 가능한 배포 |
| [hermes-autonomous-server](https://github.com/JackTheGit/hermes-autonomous-server) | 15 | systemd·cron 무인 운영 · *2026-03 이후 정지* |
| [hermes-agent-template](https://github.com/Crustocean/hermes-agent-template) | 5 | 클라우드 배포용 템플릿 · *2026-03 이후 정지* |

## 무료 모델 · 라우팅

| | ★ | |
|---|---|---|
| [hermes-openrouter-free-rotator](https://github.com/GoSlowPoke168/hermes-openrouter-free-rotator) | 11 | 매일 무료 모델을 순위 매겨 config 를 갈아준다. **이 저장소가 도커에서 물리는 것** |
| [hermes-openrouter-catalog](https://github.com/HaTas2025/hermes-openrouter-catalog) | 1 | OpenRouter 카탈로그 |
| [hermes-model-catalog](https://github.com/JoseTabora93/hermes-model-catalog) | 0 | 큐레이션 모델 목록 (스페인어) |

## 더 넓은 목록

| | ★ | |
|---|---|---|
| [awesome-hermes-agent](https://github.com/0xNyk/awesome-hermes-agent) | 5,464 | 스킬·플러그인·도구 총목록. **여기부터 보면 된다** |
| [awesome-hermes-agent](https://github.com/Anil-matcha/awesome-hermes-agent) | 50 | 또 다른 큐레이션 |

## 한국어 자료

솔직히 말해 **전부 방치돼 있다.** 이 저장소를 만든 이유이기도 하다.

| | ★ | 마지막 갱신 |
|---|---|---|
| [hermes-ko](https://github.com/tmdgusya/hermes-ko) | 3 | 2026-05 · 한국어 문서·커뮤니티 |
| [hermes-agent_one-click_kit](https://github.com/Huntbae/hermes-agent_one-click_kit) | 1 | 2026-06 · **윈도우 .bat** 원클릭 키트 (도커가 아닌 쪽을 찾는다면) |
| [hermes-docs-ko](https://github.com/jaechulleehi/hermes-docs-ko) | 0 | 2026-04 · 한국어 문서 |
| [hermes-tutorial-22ki](https://github.com/daht-mad/hermes-tutorial-22ki) | 0 | 2026-05 · 설치 튜토리얼 |

---

## 기여

한국어로 쓰인 헤르메스 자료라면 무엇이든 환영한다. 목록에 넣을 때는
**별 수와 마지막 갱신일을 같이 적는다** — 죽은 링크로 보내지 않기 위해서다.

문서는 한국어가 원본이다. `README.md` 를 고치면 `README.en.md` 도 같이 고친다.

## 라이선스

MIT. [Hermes Agent](https://github.com/NousResearch/Hermes-Agent) 도 MIT 이다.
