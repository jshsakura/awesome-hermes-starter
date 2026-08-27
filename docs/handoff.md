# 핸드오프 — 2026-08-27

혼자 이어서 할 때 필요한 것만. 결정된 이유와 아직 안 한 것.

## ⚠ 이 서버(ubuntu-lab)에서 `docker compose up` 하지 마라

**텔레그램 봇 토큰이 겹친다.** 지금 `hermes-gateway.service`(systemd --user)가
`~/.hermes/.env` 의 `TELEGRAM_BOT_TOKEN` 을 롱폴하고 있다. 텔레그램은 같은 토큰의
업데이트를 **먼저 묻는 쪽에만 한 번** 준다 — compose 게이트웨이를 띄우면 두 프로세스가
서로의 메시지를 가져간다. 막히는 게 아니라 **간헐적으로, 조용히** 어긋난다(409 도 안 난다).
`oc-bridge` 를 만들게 된 원인과 같은 함정이다.

띄워서 검증하려면 셋 중 하나로 한다:

1. **다른 봇 토큰**을 @BotFather 에서 새로 파서 `.env` 에 쓴다 (제일 안전)
2. `.env` 의 `TELEGRAM_BOT_TOKEN` 을 비운 채 **대시보드만** 검증한다
   (`docker compose up -d dashboard`)
3. 다른 기계 / NAS 에서 돌린다

포트도 확인한다. `DASHBOARD_PORT` 기본값이 9119 인데, 겹치면 `.env` 에서 바꾼다.
`./data` 는 이 폴더 안에 새로 생기므로 `~/.hermes` 와는 섞이지 않는다.

## 지금 상태

| 파일 | 검증 |
|---|---|
| `docker-compose.yml` | `docker compose config` 통과. **기동은 안 해봄** |
| `scripts/telegram-chat-id.sh` | `bash -n` 통과. **실행은 안 해봄** |
| `.env.example` · `LICENSE` · `.gitignore` | — |
| `README.md` 큐레이션 목록 | 별 수·갱신일 전부 GitHub API 실측 (2026-08-27) |

로컬 커밋 1개(`092dec6`), **원격 없음.**

## 남은 일

### 1. 실제 기동 검증 (위 주의사항대로)

```bash
cp .env.example .env      # OpenRouter 키·대시보드 계정 채우기
#   DASHBOARD_SECRET=$(openssl rand -hex 32)
HERMES_UID=$(id -u) HERMES_GID=$(id -g) docker compose up -d dashboard
curl -I http://127.0.0.1:9119        # 로그인 화면(401/302)이 나오는지
```

볼 것: 이미지 pull(952MB) → 대시보드 기동 → **인증 없이 안 열리는지**.
비루프백 바인드는 인증 provider 가 없으면 기동을 거부하게 돼 있다
(`--insecure` 는 2026-06 하드닝 이후 무효). 거부당하면 `.env` 의
`DASHBOARD_USER/PASSWORD/SECRET` 중 하나가 안 들어간 것이다.

### 2. 플러그인 설치 명령 형태 확인 — **미검증**

README 와 compose 주석에 이렇게 적어뒀는데 직접 확인하지 않았다:

```bash
docker compose exec gateway hermes plugins install GoSlowPoke168/hermes-openrouter-free-rotator
```

free-rotator 의 `install.sh` 주석에서 `hermes plugins install <repo>` 를 언급하길래 가져온
형태다. 실제 CLI 서브커맨드 이름이 다를 수 있다. `hermes plugins --help` 로 확인하고
README 두 군데(무료 모델 절, compose `freemodels` 주석)를 같이 고친다.

### 3. `freemodels` 사이드카 실동작

`date -u -d "tomorrow 00:01"` 이 이미지의 `sh`/`date`(Debian coreutils)에서 먹는지 확인.
안 되면 `echo $((now + 86400))` 폴백으로 떨어지는데, 그러면 리셋 시각에 안 맞고
기동 시각 기준 24시간 주기가 된다. 확인:

```bash
docker compose run --rm --entrypoint sh freemodels -c 'date -u -d "tomorrow 00:01" +%s'
```

### 4. 공개

원격을 안 정했다. 정하면:

```bash
gh repo create awesome-hermes-starter --public --source=. --remote=origin --push
```

공개 전에 `README.md` 첫 코드블록의 `<you>` 를 실제 경로로 바꾼다.

공개 후 [`0xNyk/awesome-hermes-agent`](https://github.com/0xNyk/awesome-hermes-agent)(5,464★)에
PR 을 넣으면 유입이 생긴다 — 한국어 항목이 거기에 없다.

## 왜 이 모양인가 (되돌아가지 않기 위해)

조사하면서 만들 것이 계속 줄었다. 되짚지 않으려면:

- **프론트엔드를 만들지 마라.** hermes-webui 17,759★ · hermes-desktop 14,044★ ·
  hermes-workspace 6,516★ 가 전부 이번 주에도 커밋된다
- **무료 모델 라우팅을 만들지 마라.** `openrouter/free` 가 막힌 모델을 알아서 피하고
  (실측 5/5, 429 0건), 목록 갱신은 free-rotator 가 한다
- **인증을 만들지 마라.** 헤르메스 내장 `dashboard_auth/basic` 이 ID/PW 를 한다
- **헤르메스를 포크하지 마라.** 공개 이미지 `:latest` 를 그대로 태우므로 업스트림을
  따라갈 부담이 없다. 이 저장소에는 compose 와 문서만 있다

**남은 자리는 한국어 하나였다.** 한국어 자료는 최대 3★ 이고 전부 2026-04~06 이후 방치다.
그래서 큐레이션 목록에 별 수와 마지막 갱신일을 같이 적는다 — 죽은 링크로 보내지 않으려고.

## 확장 후보 (1차 범위 밖)

- **MCP 템플릿** — 초심자용 프리셋 원클릭. 헤르메스에 `/api/mcp/*` 가 이미 있다
- **BYOK 연료 확장** — Cerebras(~1M tok/일) · Google AI Studio(1,500 req/일) 무료 키를
  OpenRouter Integrations 에 꽂으면 공유 풀이 아니라 내 쿼터로 돈다. 무료 티어의
  하루 50회(충전 시 1,000회) 천장을 넘는 유일한 길
- **한국어 대시보드 로케일** — 중국어판(`fresh-claw/xiaoma-hermes-zh-cn`)이 UI 텍스트
  패치로 하는 방식. 헤르메스 `locales/` 가 있으니 업스트림 PR 이 더 나을 수도 있다
