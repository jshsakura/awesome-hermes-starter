"""hermes-starter setup — the screen you get before Hermes has anything to say.

Stock Hermes assumes you already have a provider key and a model id. On a NAS
that is exactly the wall people hit: the dashboard is there, but nothing works
until you have edited files over SSH. This service fills that gap and nothing
else. Once your agent talks, you never need it again.

It writes two files and restarts one container:

    /opt/data/.env         OPENROUTER_API_KEY, TELEGRAM_BOT_TOKEN, allow-list
    /opt/data/config.yaml  model.default and the fallback chain

Those are the paths Hermes itself reads (`hermes config path` / `env-path`),
which is why a plain container *restart* is enough. Writing to the compose
.env instead would need a recreate, and a recreate needs far more Docker
privilege than restarting one container does.
"""

from __future__ import annotations

import base64
import hashlib
import hmac
import io
import json
import os
import re
import secrets
import time
from pathlib import Path
from typing import Any

import httpx
from fastapi import Depends, FastAPI, HTTPException, Request, Response
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from ruamel.yaml import YAML

# --- where things live -------------------------------------------------------

DATA = Path(os.getenv("HERMES_DATA", "/opt/data"))
ENV_FILE = DATA / ".env"
CONFIG_FILE = DATA / "config.yaml"
WEB = Path(os.getenv("WEB_DIST", Path(__file__).parent / "web"))

GATEWAY_CONTAINER = os.getenv("GATEWAY_CONTAINER", "hermes-gateway")
DOCKER_HOST_URL = os.getenv("DOCKER_PROXY_URL", "http://socket-proxy:2375")

OPENROUTER_BASE = "https://openrouter.ai/api/v1"

# The gateway's built-in OpenAI-compatible API. Enabling it is what lets this
# page be a usable client on its own instead of a settings screen you leave.
HERMES_API = os.getenv("HERMES_API_URL", "http://gateway:8642")
API_KEY = os.getenv("API_SERVER_KEY", "")

# Round-trip mode so the 100KB of comments Hermes ships in config.yaml survive
# our edits. A plain yaml.safe_dump would silently strip every one of them.
yaml = YAML()
yaml.preserve_quotes = True

app = FastAPI(title="hermes-starter setup", docs_url=None, redoc_url=None)


# --- auth --------------------------------------------------------------------
# A form login with a signed session cookie, not HTTP Basic. Basic auth has no
# logout, and on a box already running a dozen services the browser's credential
# manager starts offering the wrong saved password for the wrong port. The
# Hermes dashboard next door works the same way, so the two feel like one thing.

COOKIE = "hermes_setup_session"
SESSION_TTL = 12 * 3600

# Signs the cookie. Without a stable secret every restart logs everyone out, so
# we fall back to an ephemeral one and say so rather than refusing to start.
_SECRET = os.getenv("SETUP_SECRET") or ""
if not _SECRET:
    _SECRET = secrets.token_hex(32)
    print("[setup] SETUP_SECRET is not set; sessions will not survive a restart")


def _sign(payload: str) -> str:
    return hmac.new(_SECRET.encode(), payload.encode(), hashlib.sha256).hexdigest()


def issue_token(username: str) -> str:
    body = json.dumps({"sub": username, "exp": int(time.time()) + SESSION_TTL})
    raw = base64.urlsafe_b64encode(body.encode()).decode().rstrip("=")
    return f"{raw}.{_sign(raw)}"


def verify_token(token: str | None) -> str | None:
    if not token or "." not in token:
        return None
    raw, sig = token.rsplit(".", 1)
    # compare_digest so a wrong signature cannot be narrowed down by timing.
    if not hmac.compare_digest(sig, _sign(raw)):
        return None
    try:
        padded = raw + "=" * (-len(raw) % 4)
        data = json.loads(base64.urlsafe_b64decode(padded))
    except (ValueError, json.JSONDecodeError):
        return None
    if int(data.get("exp", 0)) < time.time():
        return None
    return data.get("sub")


def require_auth(request: Request) -> str:
    user = verify_token(request.cookies.get(COOKIE))
    if not user:
        raise HTTPException(status_code=401, detail="not signed in")
    return user


class LoginIn(BaseModel):
    username: str
    password: str


@app.post("/api/login")
def login(body: LoginIn, response: Response) -> dict[str, Any]:
    user = os.getenv("SETUP_USER", "")
    password = os.getenv("SETUP_PASSWORD", "")
    if not user or not password:
        raise HTTPException(500, "SETUP_USER/SETUP_PASSWORD not configured")

    # Always compare both, so a wrong username and a wrong password take the
    # same time and this is not a username oracle.
    ok_user = secrets.compare_digest(body.username, user)
    ok_pass = secrets.compare_digest(body.password, password)
    if not (ok_user and ok_pass):
        raise HTTPException(401, "invalid username or password")

    response.set_cookie(
        COOKIE,
        issue_token(user),
        httponly=True,
        samesite="lax",
        max_age=SESSION_TTL,
        path="/",
    )
    return {"ok": True, "username": user}


@app.post("/api/logout")
def logout(response: Response) -> dict[str, Any]:
    response.delete_cookie(COOKIE, path="/")
    return {"ok": True}


@app.get("/api/session")
def session(request: Request) -> dict[str, Any]:
    return {"authenticated": bool(verify_token(request.cookies.get(COOKIE)))}


# --- .env read/write ---------------------------------------------------------
# Hermes' own .env is a plain KEY=value file that it rewrites itself, so we edit
# it line-wise instead of rewriting the whole thing: anything we do not know
# about is left exactly where it was.

_ENV_LINE = re.compile(r"^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=(.*)$")


def read_env() -> dict[str, str]:
    if not ENV_FILE.exists():
        return {}
    out: dict[str, str] = {}
    for line in ENV_FILE.read_text(encoding="utf-8").splitlines():
        m = _ENV_LINE.match(line)
        if m:
            out[m.group(1)] = m.group(2).strip().strip('"').strip("'")
    return out


def write_env(updates: dict[str, str]) -> None:
    lines = ENV_FILE.read_text(encoding="utf-8").splitlines() if ENV_FILE.exists() else []
    seen: set[str] = set()
    for i, line in enumerate(lines):
        m = _ENV_LINE.match(line)
        if m and m.group(1) in updates:
            key = m.group(1)
            lines[i] = f"{key}={updates[key]}"
            seen.add(key)
    for key, value in updates.items():
        if key not in seen:
            lines.append(f"{key}={value}")
    ENV_FILE.parent.mkdir(parents=True, exist_ok=True)
    ENV_FILE.write_text("\n".join(lines) + "\n", encoding="utf-8")
    os.chmod(ENV_FILE, 0o600)


def read_config() -> dict[str, Any]:
    if not CONFIG_FILE.exists():
        return {}
    with CONFIG_FILE.open(encoding="utf-8") as fh:
        return yaml.load(fh) or {}


def write_config(cfg: dict[str, Any]) -> None:
    buf = io.StringIO()
    yaml.dump(cfg, buf)
    CONFIG_FILE.write_text(buf.getvalue(), encoding="utf-8")


# --- state -------------------------------------------------------------------

@app.get("/api/status")
def status(_: str = Depends(require_auth)) -> dict[str, Any]:
    env = read_env()
    cfg = read_config()
    model = cfg.get("model", {}) or {}
    allowed = [x for x in (env.get("TELEGRAM_ALLOWED_USERS", "") or "").split(",") if x.strip()]
    return {
        "key_set": bool(env.get("OPENROUTER_API_KEY")),
        "key_hint": (env.get("OPENROUTER_API_KEY", "")[-4:] if env.get("OPENROUTER_API_KEY") else ""),
        "model": model.get("default", ""),
        "provider": model.get("provider", ""),
        "fallbacks": [f.get("model", "") for f in (cfg.get("fallback_providers") or [])],
        "telegram_token_set": bool(env.get("TELEGRAM_BOT_TOKEN")),
        "telegram_allowed": allowed,
        "telegram_bot": env.get("TELEGRAM_BOT_USERNAME", ""),
        "data_dir": str(DATA),
        "dashboard_url": os.getenv("DASHBOARD_URL", ""),
    }


# --- step 1: the key ---------------------------------------------------------

class KeyIn(BaseModel):
    key: str


@app.post("/api/key")
async def set_key(body: KeyIn, _: str = Depends(require_auth)) -> dict[str, Any]:
    key = body.key.strip()
    if not key:
        raise HTTPException(400, "empty key")

    # Verify before saving. A typo'd key that only fails later looks like a
    # broken agent, which is the single most confusing way for this to go wrong.
    async with httpx.AsyncClient(timeout=20) as client:
        r = await client.get(
            f"{OPENROUTER_BASE}/key", headers={"Authorization": f"Bearer {key}"}
        )
    if r.status_code == 401:
        raise HTTPException(400, "openrouter rejected this key")
    if r.status_code >= 400:
        raise HTTPException(502, f"openrouter error {r.status_code}")

    info = (r.json() or {}).get("data", {})
    write_env({"OPENROUTER_API_KEY": key})

    # Point Hermes at OpenRouter while we are here; otherwise the model we pick
    # in the next step resolves against whatever provider was configured before.
    cfg = read_config()
    model = cfg.setdefault("model", {})
    model["provider"] = "openrouter"
    model["base_url"] = OPENROUTER_BASE
    write_config(cfg)

    # `limit: null` on a free account means "no credit limit set", not unlimited
    # — the free-model allowance is a separate daily request count.
    return {
        "ok": True,
        "label": info.get("label", ""),
        "usage": info.get("usage"),
        "limit": info.get("limit"),
        "is_free_tier": info.get("is_free_tier", True),
    }


# --- step 2: free models -----------------------------------------------------

def _is_free(m: dict[str, Any]) -> bool:
    # Two independent signals, because neither alone is reliable: the ``:free``
    # suffix is a naming convention that OpenRouter has kept on models after
    # withdrawing the free endpoint, and a few genuinely-free models have never
    # carried the suffix.
    pricing = m.get("pricing") or {}
    priced_zero = all(
        str(pricing.get(f, "0")).strip() in ("0", "0.0", "-1")
        for f in ("prompt", "completion")
    )
    return m.get("id", "").endswith(":free") and priced_zero


@app.get("/api/models")
async def models(_: str = Depends(require_auth)) -> dict[str, Any]:
    """The live free-model list, ranked.

    This is re-read every time rather than pinned. Free endpoints are withdrawn
    without notice and without the id changing — on 2026-08-27 three well-known
    ``:free`` models lost theirs in a single day — so a list written down at
    install time is wrong within weeks.
    """
    env = read_env()
    headers = {}
    if env.get("OPENROUTER_API_KEY"):
        headers["Authorization"] = f"Bearer {env['OPENROUTER_API_KEY']}"
    async with httpx.AsyncClient(timeout=30) as client:
        r = await client.get(f"{OPENROUTER_BASE}/models", headers=headers)
    if r.status_code >= 400:
        raise HTTPException(502, f"openrouter error {r.status_code}")

    free = []
    for m in (r.json() or {}).get("data", []):
        if not _is_free(m):
            continue
        top = m.get("top_provider") or {}
        free.append(
            {
                "id": m.get("id"),
                "name": m.get("name", m.get("id")),
                "context_length": m.get("context_length") or top.get("context_length") or 0,
                "max_completion_tokens": top.get("max_completion_tokens"),
                "modality": (m.get("architecture") or {}).get("modality", ""),
                "supports_tools": "tools" in (m.get("supported_parameters") or []),
                "description": (m.get("description") or "")[:400],
            }
        )

    # Tool-calling first, then context. An agent whose model cannot call tools
    # is a chatbot — it will fail on the first thing Hermes actually does.
    free.sort(key=lambda m: (m["supports_tools"], m["context_length"]), reverse=True)
    return {"models": free, "count": len(free)}


class ModelIn(BaseModel):
    model: str
    fallbacks: list[str] = []


@app.post("/api/model")
def set_model(body: ModelIn, _: str = Depends(require_auth)) -> dict[str, Any]:
    cfg = read_config()
    model = cfg.setdefault("model", {})
    model["default"] = body.model
    model["provider"] = "openrouter"
    model["base_url"] = OPENROUTER_BASE

    # Fallbacks matter more on free models than anywhere else: a 429 on the
    # daily allowance is routine, and without a chain the agent simply stops.
    if body.fallbacks:
        cfg["fallback_providers"] = [
            {"provider": "openrouter", "model": f, "base_url": OPENROUTER_BASE}
            for f in body.fallbacks
        ]
    write_config(cfg)
    return {"ok": True, "model": body.model, "fallbacks": body.fallbacks}


# --- step 3: telegram --------------------------------------------------------

class TokenIn(BaseModel):
    token: str


@app.post("/api/telegram/token")
async def telegram_token(body: TokenIn, _: str = Depends(require_auth)) -> dict[str, Any]:
    token = body.token.strip()
    async with httpx.AsyncClient(timeout=20) as client:
        r = await client.get(f"https://api.telegram.org/bot{token}/getMe")
    data = r.json() if r.content else {}
    if not data.get("ok"):
        raise HTTPException(400, data.get("description", "telegram rejected this token"))
    bot = data.get("result", {})
    write_env({
        "TELEGRAM_BOT_TOKEN": token,
        # Not used by Hermes; kept so this page can offer a t.me link without
        # another round trip to Telegram every time it loads.
        "TELEGRAM_BOT_USERNAME": bot.get("username", ""),
    })
    return {
        "ok": True,
        "username": bot.get("username"),
        "name": bot.get("first_name"),
        "link": f"https://t.me/{bot.get('username')}" if bot.get("username") else "",
    }


@app.get("/api/telegram/chats")
async def telegram_chats(_: str = Depends(require_auth)) -> dict[str, Any]:
    """Who has messaged the bot.

    Telegram hands each update to the first caller and only once. If the
    gateway is polling the same token it takes the message and this returns
    nothing — worse, if this wins, the gateway silently misses what was said.
    So the gateway is stopped for the length of the call and started again
    afterwards, in a finally block: leaving it down would be a far more
    confusing failure than an empty list.
    """
    env = read_env()
    token = env.get("TELEGRAM_BOT_TOKEN")
    if not token:
        raise HTTPException(400, "no bot token saved yet")

    await _docker("POST", f"/containers/{GATEWAY_CONTAINER}/stop")
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            r = await client.get(f"https://api.telegram.org/bot{token}/getUpdates")
    finally:
        await _docker("POST", f"/containers/{GATEWAY_CONTAINER}/start")

    data = r.json() if r.content else {}
    if not data.get("ok"):
        raise HTTPException(502, data.get("description", "telegram error"))

    seen: dict[int, dict[str, str]] = {}
    for update in data.get("result", []):
        msg = update.get("message") or update.get("edited_message") or {}
        chat = msg.get("chat") or {}
        if chat.get("id") is None:
            continue
        who = (
            chat.get("username")
            or " ".join(p for p in (chat.get("first_name"), chat.get("last_name")) if p)
            or chat.get("title")
            or "?"
        )
        seen[chat["id"]] = {"id": str(chat["id"]), "who": who, "type": chat.get("type", "?")}
    return {"chats": list(seen.values())}


class AllowIn(BaseModel):
    ids: list[str]


@app.post("/api/telegram/allow")
def telegram_allow(body: AllowIn, _: str = Depends(require_auth)) -> dict[str, Any]:
    ids = [i.strip() for i in body.ids if i.strip()]
    if not ids:
        # An empty allow-list is not "no restriction" here, it is "anyone who
        # finds the bot gets your files and your quota". Refuse it outright.
        raise HTTPException(400, "refusing to save an empty allow-list")
    write_env({"TELEGRAM_ALLOWED_USERS": ",".join(ids)})
    return {"ok": True, "ids": ids}


@app.post("/api/telegram/test")
async def telegram_test(_: str = Depends(require_auth)) -> dict[str, Any]:
    """Send one message to the allow-listed chats.

    Saving a token and an id proves the fields are filled in. Only a message
    arriving on the phone proves the pair actually belongs together.
    """
    env = read_env()
    token = env.get("TELEGRAM_BOT_TOKEN")
    ids = [x for x in (env.get("TELEGRAM_ALLOWED_USERS", "") or "").split(",") if x.strip()]
    if not token:
        raise HTTPException(400, "no bot token saved yet")
    if not ids:
        raise HTTPException(400, "no allowed users saved yet")

    sent, failed = [], []
    async with httpx.AsyncClient(timeout=20) as client:
        for chat_id in ids:
            r = await client.post(
                f"https://api.telegram.org/bot{token}/sendMessage",
                json={
                    "chat_id": chat_id.strip(),
                    "text": "\u2713 Hermes Starter — 연결됐습니다. / You are connected.",
                },
            )
            body = r.json() if r.content else {}
            (sent if body.get("ok") else failed).append(
                {"id": chat_id, "error": body.get("description", "")}
            )
    if not sent:
        raise HTTPException(502, failed[0]["error"] if failed else "telegram refused")
    return {"ok": True, "sent": [s["id"] for s in sent], "failed": failed}


# --- step 4: MCP -------------------------------------------------------------
# Hermes ships a 65-entry MCP catalog, but almost all of it is remote SaaS
# behind OAuth, and OAuth cannot complete in a container: the gateway logs
# `OAuthNonInteractiveError ... parked` and the tools never arrive. What works
# unattended is stdio servers that need no browser step, so those are what we
# offer. The image already carries node/npx and uv/uvx, so none of this pulls
# a second image.
#
# `filesystem` is first for a reason — it is the one people install a NAS agent
# for, and it is the one the catalog does not have at all.

MCP_PRESETS: dict[str, dict[str, Any]] = {
    "filesystem": {
        "recommended": True,
        "label_ko": "파일",
        "label_en": "Files",
        "desc_ko": "./files 안의 파일을 읽고 쓴다. 나스 공유를 붙이는 자리.",
        "desc_en": "Read and write files under ./files — where you mount a NAS share.",
        "spec": {
            "command": "npx",
            "args": ["-y", "@modelcontextprotocol/server-filesystem", "/files"],
            "enabled": True,
        },
    },
    "fetch": {
        "recommended": True,
        "label_ko": "웹 읽기",
        "label_en": "Fetch",
        "desc_ko": "URL 을 열어 본문을 읽는다. 무료 모델은 검색 능력이 없어 체감이 크다.",
        "desc_en": "Open a URL and read the page. Free models have no browsing of their own.",
        "spec": {"command": "uvx", "args": ["mcp-server-fetch"], "enabled": True},
    },
    "search": {
        "recommended": True,
        "label_ko": "웹 검색",
        "label_en": "Web search",
        "desc_ko": "DuckDuckGo 검색. 계정도 키도 필요 없다.",
        "desc_en": "DuckDuckGo search. No account, no key.",
        "spec": {"command": "npx", "args": ["-y", "duck-duck-mcp"], "enabled": True},
    },
    "docs": {
        "recommended": False,
        "label_ko": "라이브러리 문서",
        "label_en": "Library docs",
        "desc_ko": "Context7 — 라이브러리 최신 문서를 버전까지 맞춰 가져온다.",
        "desc_en": "Context7 — version-accurate docs for libraries.",
        "spec": {"command": "npx", "args": ["-y", "@upstash/context7-mcp"], "enabled": True},
    },
    "time": {
        "recommended": False,
        "label_ko": "시간·시간대",
        "label_en": "Time",
        "desc_ko": "현재 시각과 시간대 변환. 예약·알림을 쓸 거면 넣는다.",
        "desc_en": "Current time and timezone conversion. Needed for schedules.",
        "spec": {"command": "uvx", "args": ["mcp-server-time"], "enabled": True},
    },
}


@app.get("/api/mcp")
def mcp_list(_: str = Depends(require_auth)) -> dict[str, Any]:
    cfg = read_config()
    installed = cfg.get("mcp_servers") or {}
    out = []
    for name, preset in MCP_PRESETS.items():
        out.append(
            {
                "name": name,
                "label_ko": preset["label_ko"],
                "label_en": preset["label_en"],
                "desc_ko": preset["desc_ko"],
                "desc_en": preset["desc_en"],
                "recommended": bool(preset.get("recommended")),
                "installed": name in installed,
                "enabled": bool((installed.get(name) or {}).get("enabled", False)),
            }
        )
    # Anything the user added by hand or through Hermes itself, so this screen
    # never looks like it is the whole truth.
    others = [
        {"name": n, "installed": True, "enabled": bool((s or {}).get("enabled", False)), "foreign": True}
        for n, s in installed.items()
        if n not in MCP_PRESETS
    ]
    return {"presets": out, "others": others}


class McpIn(BaseModel):
    name: str
    install: bool = True


@app.post("/api/mcp/recommended")
def mcp_recommended(_: str = Depends(require_auth)) -> dict[str, Any]:
    """Install the three that pay for themselves and stop there.

    Every tool a model can call is described to it on every single turn, so the
    tool list is a standing tax on the context window and on the model's
    attention. Three is a working agent; ten is a slower, more confused one —
    especially on the free models this starter points at, whose tool-calling is
    the first thing to degrade under a long prompt.
    """
    cfg = read_config()
    servers = cfg.setdefault("mcp_servers", {})
    names = [n for n, p in MCP_PRESETS.items() if p.get("recommended")]
    for name in names:
        servers[name] = dict(MCP_PRESETS[name]["spec"])
    write_config(cfg)
    return {"ok": True, "installed": names}


@app.post("/api/mcp")
def mcp_apply(body: McpIn, _: str = Depends(require_auth)) -> dict[str, Any]:
    preset = MCP_PRESETS.get(body.name)
    if not preset:
        raise HTTPException(404, f"unknown preset {body.name!r}")
    cfg = read_config()
    servers = cfg.setdefault("mcp_servers", {})
    if body.install:
        servers[body.name] = dict(preset["spec"])
    else:
        servers.pop(body.name, None)
    write_config(cfg)
    return {"ok": True, "name": body.name, "installed": body.install}



# --- chat ---------------------------------------------------------------------
# Deliberately small: send a message, read the reply, start over. Sessions,
# skills, cron and the rest live in the Hermes dashboard — this is the ramp,
# not a replacement for it.

class ChatIn(BaseModel):
    message: str
    session_id: str = ""


@app.post("/api/chat")
async def chat(body: ChatIn, _: str = Depends(require_auth)) -> dict[str, Any]:
    text = body.message.strip()
    if not text:
        raise HTTPException(400, "empty message")

    headers = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}
    # Continuity is opt-in per request; the same id keeps the thread, a new one
    # is what "reset" means here.
    if body.session_id:
        headers["X-Hermes-Session-Id"] = body.session_id

    payload = {"model": "hermes-agent", "messages": [{"role": "user", "content": text}]}
    try:
        async with httpx.AsyncClient(timeout=300) as client:
            r = await client.post(
                f"{HERMES_API}/v1/chat/completions", headers=headers, json=payload
            )
    except httpx.HTTPError as exc:
        raise HTTPException(502, f"could not reach the agent: {exc}") from exc

    if r.status_code == 401:
        raise HTTPException(502, "the gateway rejected API_SERVER_KEY")
    if r.status_code >= 400:
        raise HTTPException(502, f"agent error {r.status_code}: {r.text[:300]}")

    data = r.json()
    choices = data.get("choices") or [{}]
    reply = (choices[0].get("message") or {}).get("content", "")
    return {
        "reply": reply,
        "session_id": body.session_id or data.get("id", ""),
        "model": data.get("model", ""),
        "usage": data.get("usage"),
    }


@app.get("/api/chat/health")
async def chat_health(_: str = Depends(require_auth)) -> dict[str, Any]:
    """Is the agent actually answerable right now.

    Separate from the gateway container being up: the API server only listens
    once API_SERVER_KEY is set, and a model still has to be configured.
    """
    try:
        async with httpx.AsyncClient(timeout=8) as client:
            r = await client.get(f"{HERMES_API}/health")
        return {"ready": r.status_code == 200, "detail": r.text[:200]}
    except httpx.HTTPError as exc:
        return {"ready": False, "detail": str(exc)}


# --- applying ----------------------------------------------------------------

async def _docker(method: str, path: str) -> httpx.Response:
    async with httpx.AsyncClient(timeout=60) as client:
        return await client.request(method, f"{DOCKER_HOST_URL}{path}")


@app.post("/api/gateway/{action}")
async def gateway_action(action: str, _: str = Depends(require_auth)) -> dict[str, Any]:
    if action not in ("restart", "stop", "start"):
        raise HTTPException(400, "unsupported action")
    r = await _docker("POST", f"/containers/{GATEWAY_CONTAINER}/{action}")
    if r.status_code >= 400:
        raise HTTPException(502, f"docker said {r.status_code}: {r.text[:200]}")
    return {"ok": True, "action": action}


@app.get("/api/gateway")
async def gateway_state(_: str = Depends(require_auth)) -> dict[str, Any]:
    try:
        r = await _docker("GET", f"/containers/{GATEWAY_CONTAINER}/json")
        if r.status_code >= 400:
            return {"reachable": False, "running": False}
        state = (r.json() or {}).get("State", {})
        return {"reachable": True, "running": bool(state.get("Running")), "status": state.get("Status")}
    except httpx.HTTPError:
        return {"reachable": False, "running": False}


# --- static ------------------------------------------------------------------

# The built React bundle. Mounted after the API routes so /api/* wins.
app.mount("/assets", StaticFiles(directory=WEB / "assets"), name="assets")


@app.get("/favicon.svg")
def favicon() -> FileResponse:
    # Vite copies public/ to the dist root, which the /assets mount does not
    # cover. Served unauthenticated so the tab icon appears on the login page.
    return FileResponse(WEB / "favicon.svg", media_type="image/svg+xml")


@app.get("/")
def index() -> FileResponse:
    # Served unauthenticated on purpose: the bundle renders the login form and
    # asks /api/session what to do. Every route that touches config is guarded.
    #
    # Never cached. The asset filenames are content-hashed, so a stale index is
    # the one thing that can pin a browser to an old bundle after an upgrade —
    # you change the UI, redeploy, and the user still sees last week's page.
    return FileResponse(
        WEB / "index.html",
        headers={"Cache-Control": "no-store, must-revalidate"},
    )


@app.exception_handler(HTTPException)
def http_error(_: Request, exc: HTTPException) -> JSONResponse:
    return JSONResponse(
        {"error": exc.detail}, status_code=exc.status_code, headers=exc.headers or {}
    )
