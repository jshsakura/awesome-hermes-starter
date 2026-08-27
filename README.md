<img src="docs/hero.png" alt="awesome-hermes-starter" width="100%">

🇰🇷 한국어 · [🇺🇸 English](README.en.md)

**초보자를 위한 [Hermes Agent](https://github.com/NousResearch/Hermes-Agent) 설정 도우미.**

`docker compose up` 하나로 띄우고, **나머지는 브라우저에서** 끝낸다.
터미널로 키를 붙여넣을 일이 없다. 카드도 필요 없다. NAS·홈서버 기준이다.

```bash
git clone https://github.com/jshsakura/awesome-hermes-starter && cd awesome-hermes-starter
cp .env.example .env                                    # 로그인 계정만 정한다
HERMES_UID=$(id -u) HERMES_GID=$(id -g) docker compose up -d
# → http://<서버주소>:9120  ← 여기서 다섯 단계
```

**[▶ 사이트에서 보기](https://jshsakura.github.io/awesome-hermes-starter/)** — 복붙할 compose 와 고칠 세 곳, 그리고
설치 없이 눌러보는 [데모](https://jshsakura.github.io/awesome-hermes-starter/demo/). 데모는 같은 코드로 만든 화면이고 서버 대신 정해둔 답을 쓴다.

**나스에 올리는 사람은 [기종별 복붙 설치 문서](docs/deploy.md)를 보면 된다** —
일반 도커·포테이너와 Synology DSM 두 갈래로 적었다. 터미널이 필요 없다.

## 헤르메스 에이전트가 무엇을 할 수 있나요?

Nous Research 가 만든 **오픈소스 AI 비서**다. 대화만 하는 챗봇이 아니라, 시키면
실제로 파일을 열고 웹을 읽고 프로그램을 돌린다. 그걸 **내 서버 안에서** 한다 —
대화도 기억도 남의 서비스가 아니라 내 디스크에 쌓인다.

- **시켜서 쓴다.** "다운로드 폴더 정리해줘" 처럼 말로 시킨다. 어떤 도구를 쓸지는 에이전트가 고른다
- **기억한다.** 세션이 끝나도 기억과 스킬이 남는다. 쓸수록 내 방식에 맞춰진다
- **폰에서 시킨다.** 텔레그램에 붙이면 밖에서도 시킬 수 있다. 나스는 켜져 있으니 24시간 대기한다
- **내 것이다.** 모델만 밖에서 빌려 쓰고 나머지는 전부 내 서버 안이다

## 왜 이게 따로 필요한가요?

헤르메스는 **설치가 어려운 게 아니다.** `curl | bash` 한 줄이면 깔린다. 어려운 건 그 다음이다.

- **터미널을 계속 쓴다.** `source ~/.bashrc` → `hermes model` → `hermes setup`
- **호스트를 건드린다.** uv · Python 3.11 · Node.js · ripgrep · ffmpeg 가 깔린다.
  도커 경로가 있지만 업스트림 compose 는 `build: .` 라 SQLite 부터 소스 빌드한다
- **결국 유료 키가 필요하다.** 프로바이더 키를 구하거나 구독을 해야 첫 마디를 뗀다

이 배포판은 셋을 없앤다. 브라우저만 쓰고, 호스트엔 도커 말고 아무것도 안 깔고,
**OpenRouter 무료 모델**로 시작한다.

## 설정 화면이 도와드리는 것

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

## 설치하기

```bash
git clone https://github.com/jshsakura/awesome-hermes-starter && cd awesome-hermes-starter
cp .env.example .env    # 로그인 계정과 무작위 문자열 두 개만 정한다
HERMES_UID=$(id -u) HERMES_GID=$(id -g) docker compose up -d
```

그리고 **`http://<서버주소>:9120`** 을 연다. OpenRouter 키 발급도 텔레그램 봇 만들기도
화면이 안내한다. API 키와 봇 토큰은 `.env` 에 적지 않는다.

**나스에 올린다면 터미널이 아예 필요 없다.** 복붙할 compose 와 고칠 세 곳은
[사이트](https://jshsakura.github.io/awesome-hermes-starter/)에 있고, 기종별 안내는 [설치 문서](docs/deploy.md)에 있다
(일반 도커·포테이너 · Synology DSM).

## 설치한 다음에는

1. **말을 건다.** 대화 탭이나 텔레그램에서 평소 말투로 시킨다
2. **파일을 준다.** `./files` 에 넣은 것만 에이전트가 본다. 나스 공유 전체를 붙이지 마라
3. **한도를 안다.** 무료 모델은 하루 50번. 막히면 대체 모델로 넘어가고 한국시간 09:00 에 초기화된다
4. **백업한다.** `./data` 가 기억하는 전부다
5. **본판으로 넘어간다.** 익숙해지면 `:9119`. 스킬·예약·세션이 거기 있다

> **에이전트는 시키면 파일을 지운다.** 승인 프롬프트를 끄지 말고(`--yolo` 금지),
> `./files` 에는 없어지면 곤란한 원본을 두지 마라.

## 무료 모델에 대해 알아둘 점

**목록이 계속 바뀐다.** 2026-08-27 하루에만 `deepseek-chat-v3.1:free`,
`llama-3.3-70b:free`, `gemma-3-27b:free` 셋이 무료판을 잃었다 — **이름은 그대로인 채로.**
모델 id 를 박아두면 어느 날 조용히 안 된다. 그래서 설정 화면이 매번 목록을 다시 읽는다.

**하루 50번이다.** 실패한 429 도 카운트되고 UTC 자정(한국시간 **09:00**)에 리셋된다.
**$10 을 한 번 충전하면 1,000회/일로 영구히 올라간다** — 잔액 조건이 아니라 평생 해금이라
크레딧을 다 써도 등급은 유지된다. 더 넣어도 그 이상은 안 오른다.

**무료판은 같은 모델의 더 눌린 사본이다.** 무료 엔드포인트는 fp4·fp8·nvfp4 로 돌고
bf16 이 하나도 없다.

**프롬프트가 학습에 쓰일 수 있다.** 무료 엔드포인트 상당수가 OpenRouter 계정의 Privacy
토글을 켜야 열린다.

목록 자동 갱신을 원하면 [free-rotator](https://github.com/GoSlowPoke168/hermes-openrouter-free-rotator)를
붙일 수 있다. 컨테이너엔 cron 데몬이 없어서 `freemodels` 서비스가 대신 잠들었다 깨는
루프로 돌린다 — 내 config 를 고쳐 쓰므로 기본은 꺼져 있다.

```bash
docker compose exec gateway hermes plugins install GoSlowPoke168/hermes-openrouter-free-rotator
docker compose --profile freemodels up -d
```

---

# 큐레이션 목록

헤르메스 생태계는 이미 크고(본체 236,975★) 좋은 게 다 있는데, 한국어로 정리된 게 없다.

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
