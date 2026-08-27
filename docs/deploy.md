# 나스별 설치 — 복사해서 붙여넣기

[← README](../README.md) · [English](deploy.en.md)

터미널 없이, **compose 를 붙여넣는 것만으로** 끝내는 방법이다.
일반 도커(포테이너 포함)와 Synology DSM 두 갈래로 적었다.

여기 있는 compose 는 전부 **빌드가 없다.** 이미지 두 개를 받아서 띄우기만 한다.

```
nousresearch/hermes-agent:latest          헤르메스 본체
ghcr.io/jshsakura/hermes-starter-setup    초심자용 설정 화면
tecnativa/docker-socket-proxy:0.3.0       설정 화면이 게이트웨이를 재시작할 때만 쓴다
```

---

## 붙여넣기 전에 정할 것 세 가지

**1. 저장 경로.** 기종마다 다르다. 아래 표에서 자기 것을 골라 compose 안의
`/CHANGE/ME` 를 전부 바꾼다.

| 기종 | 경로 예시 |
|---|---|
| 일반 리눅스 · 포테이너 | `/opt/hermes` |
| Synology DSM | `/volume1/docker/hermes` |

그 아래에 폴더 두 개를 **미리 만들어 둔다.** 없으면 도커가 root 소유로 만들어버려서
나중에 파일 관리자로 못 연다.

```
<경로>/data      헤르메스가 기억하는 전부 — 백업 대상은 여기다
<경로>/files     에이전트에게 보여줄 폴더. 나스 공유 전체를 붙이지 말 것
```

**2. UID / GID.** 컨테이너가 만든 파일의 주인이 된다. 틀리면 파일 관리자에서
"권한 없음" 이 뜬다.

| 기종 | 값 |
|---|---|
| 일반 리눅스 | `id -u` / `id -g` — 대개 `1000` / `1000` |
| Synology DSM | 사용자마다 다르다. SSH 로 `id <계정>` 확인. 보통 `1026` / 그룹 `100` |

**3. 비밀번호.** `CHANGE_ME_PASSWORD` 와 `CHANGE_ME_SECRET` 을 바꾼다.
시크릿은 아무 긴 문자열이면 된다 — 세션 쿠키에 서명하는 값이라, 안 넣으면
재시작할 때마다 로그아웃된다.

> **OpenRouter 키와 텔레그램 토큰은 여기 안 적는다.** 띄운 뒤 설정 화면에서 넣는다.
> 그게 이 배포판의 요점이다.

---

## 공통 compose

아래를 통째로 복사해서 쓴다. 두 방식 모두 이 파일을 그대로 쓴다.

```yaml
services:
  gateway:
    image: nousresearch/hermes-agent:latest
    container_name: hermes-gateway
    restart: unless-stopped
    command: ["gateway", "run"]
    volumes:
      - /CHANGE/ME/data:/opt/data
      - /CHANGE/ME/files:/files
    environment:
      - HERMES_UID=1000
      - HERMES_GID=1000
      # 이게 없으면 에이전트가 /files 를 읽기만 하고 쓰지는 못한다.
      - HERMES_WRITE_SAFE_ROOT=/opt/data:/files
      # 설정 화면이 이 API 로 대화한다. 포트는 밖으로 안 나간다.
      - API_SERVER_KEY=CHANGE_ME_SECRET
      - API_SERVER_HOST=0.0.0.0
      - API_SERVER_PORT=8642
      - TZ=Asia/Seoul

  dashboard:
    image: nousresearch/hermes-agent:latest
    container_name: hermes-dashboard
    restart: unless-stopped
    depends_on: [gateway]
    command: ["dashboard", "--host", "0.0.0.0", "--no-open"]
    ports:
      - "9119:9119"
    volumes:
      - /CHANGE/ME/data:/opt/data
      - /CHANGE/ME/files:/files
    environment:
      - HERMES_UID=1000
      - HERMES_GID=1000
      - HERMES_DASHBOARD_BASIC_AUTH_USERNAME=admin
      - HERMES_DASHBOARD_BASIC_AUTH_PASSWORD=CHANGE_ME_PASSWORD
      - HERMES_DASHBOARD_BASIC_AUTH_SECRET=CHANGE_ME_SECRET
      - TZ=Asia/Seoul

  setup:
    image: ghcr.io/jshsakura/hermes-starter-setup:latest
    container_name: hermes-setup
    restart: unless-stopped
    depends_on: [socket-proxy]
    ports:
      - "9120:9120"
    volumes:
      - /CHANGE/ME/data:/opt/data
    environment:
      # 헤르메스 대시보드와 같은 계정을 쓴다.
      - SETUP_USER=admin
      - SETUP_PASSWORD=CHANGE_ME_PASSWORD
      - SETUP_SECRET=CHANGE_ME_SECRET
      - GATEWAY_CONTAINER=hermes-gateway
      - DOCKER_PROXY_URL=http://socket-proxy:2375
      - HERMES_API_URL=http://gateway:8642
      - API_SERVER_KEY=CHANGE_ME_SECRET
      # 설정이 끝나면 이 주소로 넘어간다. 나스 실제 주소로 바꾼다.
      - DASHBOARD_URL=http://192.168.0.10:9119
      - TZ=Asia/Seoul

  # 설정 화면이 게이트웨이를 재시작할 수 있어야 하는데, 도커 소켓을 통째로 주면
  # 그 컨테이너가 뚫렸을 때 호스트 전체를 내주는 셈이 된다. 이 프록시는 컨테이너
  # 조작만 열고 이미지·exec·볼륨은 전부 막는다. 포트도 밖으로 안 낸다.
  socket-proxy:
    image: tecnativa/docker-socket-proxy:0.3.0
    container_name: hermes-socket-proxy
    restart: unless-stopped
    environment:
      - CONTAINERS=1
      - POST=1
      - IMAGES=0
      - EXEC=0
      - VOLUMES=0
      - NETWORKS=0
      - INFO=0
      - AUTH=0
      - SECRETS=0
      - SERVICES=0
      - SWARM=0
      - SYSTEM=0
      - TASKS=0
      - NODES=0
      - PLUGINS=0
      - BUILD=0
      - COMMIT=0
      - CONFIGS=0
      - DISTRIBUTION=0
      - SESSION=0
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
```

띄운 뒤 브라우저로 **`http://<나스주소>:9120`** 에 들어가면 설정 화면이 나온다.
아이디는 `admin`, 비밀번호는 위에서 정한 값이다.

---

## 일반 도커 · 포테이너

터미널이 있으면 파일로 저장하고 `docker compose up -d` 하면 끝이다.

포테이너를 쓴다면:

1. 왼쪽 메뉴 **Stacks** → **Add stack**
2. 이름을 적는다 (예: `hermes`)
3. **Web editor** 에 위 compose 를 붙여넣는다
4. `/CHANGE/ME` 와 비밀번호를 바꾼다
5. **Deploy the stack**

> **`build:` 가 들어간 compose 는 웹 에디터에서 안 된다.** 이 문서의 compose 에
> 빌드가 없는 이유다. 다른 곳에서 가져온 예제가 실패한다면 그것부터 확인한다.

경로는 **호스트 기준 절대경로**여야 한다. 포테이너가 컨테이너 안에서 돌기 때문에
상대경로 `./data` 는 엉뚱한 곳을 가리킨다.

---

## Synology DSM — Container Manager

DSM 7.2 이상 기준이다. (구버전은 Docker 패키지이고 compose 지원이 다르다.)

1. **File Station** 에서 `docker` 공유폴더 아래에 `hermes/data`, `hermes/files` 를 만든다
2. **Container Manager** → **프로젝트** → **생성**
3. 프로젝트 이름 `hermes`, 경로는 방금 만든 `docker/hermes` 를 고른다
4. 소스는 **"docker-compose.yml 만들기"** 를 고르고 위 compose 를 붙여넣는다
5. `/CHANGE/ME` 를 `/volume1/docker/hermes` 로 바꾼다

**UID 를 반드시 확인한다.** DSM 은 사용자마다 값이 다르다. 제어판에서 SSH 를 켜고
한 번만 확인하면 된다.

```bash
id 내계정
# uid=1026(내계정) gid=100(users) ...
```

나온 값을 `HERMES_UID` / `HERMES_GID` 에 넣는다. 이걸 틀리면 컨테이너는 뜨지만
File Station 에서 `data` 폴더를 열 수 없다.

**포트가 겹칠 수 있다.** DSM 은 5000·5001 을 쓰고 다른 패키지가 9119 를 잡는 경우가
있다. 겹치면 `"9119:9119"` 의 **앞 숫자만** 바꾼다 (예: `"19119:9119"`).

---

## 띄운 다음

1. **`http://<나스주소>:9120`** — 설정 화면. `admin` / 위에서 정한 비밀번호
2. 다섯 단계를 따라간다: API 키 → 모델 → 텔레그램 → 도구 → 완료
3. 완료 단계에서 **적용하고 재시작** → **테스트 해보기**
4. 답이 오면 끝이다. 익숙해지면 **`http://<나스주소>:9119`** 의 헤르메스 본판으로 넘어간다

---

## 잘 안 될 때

**설정 화면이 안 뜬다.** 포트가 겹쳤을 가능성이 크다. compose 의 `"9120:9120"` 에서
앞 숫자를 바꿔 본다.

**"권한 없음" 이 뜬다.** `HERMES_UID` / `HERMES_GID` 가 틀렸다. 위 표를 다시 확인하고,
이미 만들어진 `data` 폴더의 소유자를 고친 뒤 컨테이너를 다시 만든다.

**설정을 저장했는데 반영이 안 된다.** 완료 단계에서 **적용하고 재시작** 을 눌러야
한다. 설정은 파일에 저장되지만 이미 돌고 있는 에이전트는 예전 값을 들고 있다.

**재시작 버튼이 실패한다.** `socket-proxy` 가 떠 있는지, `/var/run/docker.sock` 경로가
그 기종에서 맞는지 확인한다. 그게 안 되면 나스 UI 에서 `hermes-gateway` 컨테이너를
직접 재시작해도 결과는 같다.

**대화 탭이 "설정 먼저" 만 보여준다.** API 키와 모델이 아직 안 잡힌 것이다.
설정 탭 1·2 단계를 끝낸다.
