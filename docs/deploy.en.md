# Installing on a NAS — copy and paste

[← README](../README.en.md) · [한국어](deploy.md)

No terminal. Paste a compose file and you are done. Two routes: plain Docker
(including Portainer) and Synology DSM.

Nothing here builds. It pulls three images and runs them.

```
nousresearch/hermes-agent:latest          Hermes itself
ghcr.io/jshsakura/hermes-starter-setup    the beginner setup screen
tecnativa/docker-socket-proxy:0.3.0       lets the setup screen restart the gateway, and nothing else
```

---

## Before you paste

**1. Where it lives.** Every box differs. Pick yours and replace every
`/CHANGE/ME` in the compose below.

| Box | Example path |
|---|---|
| Plain Linux · Portainer | `/opt/hermes` |
| Synology DSM | `/volume1/docker/hermes` |

Create two folders under it **before** you deploy. If you don't, Docker creates
them owned by root and your file manager cannot open them afterwards.

```
<path>/data      everything Hermes remembers — this is what you back up
<path>/files     what the agent may see. Do not mount your whole NAS share
```

**2. UID / GID.** This decides who owns the files the container writes. **It differs
per box, so look it up rather than leaving a default.** Get it wrong and the containers
start fine but the file manager says "permission denied" — a symptom that does not point
at its cause, and the place most people get stuck.

| Box | Value |
|---|---|
| Plain Linux | `id -u` / `id -g` — usually `1000` / `1000` |
| Synology DSM | Varies per user. Check over SSH with `id <account>`. Usually `1026` / group `100` |

**3. A password.** Replace `CHANGE_ME_PASSWORD` and `CHANGE_ME_SECRET`. The secret can
be any long random string (`openssl rand -hex 32`) — it signs session cookies, and without
a stable one every restart signs you out.

**4. Your address.** Replace `CHANGE_ME_HOST` with the address you reach this box on
(e.g. `192.168.0.10`). The button that hands you to the Hermes dashboard uses it.

> **Your OpenRouter key and Telegram token do not go in here.** You add them in
> the setup screen after it is running. That is the whole point of this repo.

---

## The compose

Copy the whole thing. Both routes use this same file.

```yaml
services:

  # ─────────────────────────────────────────────────────────────────────
  # The setup screen — what this repo adds. Open this one first.
  # ─────────────────────────────────────────────────────────────────────
  setup:
    image: ghcr.io/jshsakura/hermes-starter-setup:latest
    container_name: hermes-setup
    restart: unless-stopped
    depends_on: [socket-proxy]
    ports:
      # The address you open in a browser. If the left number collides,
      # change only that (e.g. "19120:9120").
      - "9120:9120"
    volumes:
      # It edits Hermes' own config, so it needs the same data directory.
      - /CHANGE/ME/data:/opt/data
    environment:
      # Same login as the Hermes dashboard. This screen can write your API key
      # and your bot token, so it must not be the soft spot beside a locked door.
      - SETUP_USER=admin
      - SETUP_PASSWORD=CHANGE_ME_PASSWORD
      # Signs the login cookie. Without it, every restart signs you out.
      - SETUP_SECRET=CHANGE_ME_SECRET
      # What to restart. Must match the gateway container_name below.
      - GATEWAY_CONTAINER=hermes-gateway
      - DOCKER_PROXY_URL=http://socket-proxy:2375
      # Where the chat tab reaches the agent.
      - HERMES_API_URL=http://gateway:8642
      - API_SERVER_KEY=CHANGE_ME_SECRET
      # Where "open the dashboard" goes at the end. Use your real address.
      - DASHBOARD_URL=http://CHANGE_ME_HOST:9119
      - TZ=UTC

  # ─────────────────────────────────────────────────────────────────────
  # Hermes itself — the part that thinks and uses the tools.
  # It long-polls Telegram, so it publishes no port.
  # ─────────────────────────────────────────────────────────────────────
  gateway:
    image: nousresearch/hermes-agent:latest
    container_name: hermes-gateway
    restart: unless-stopped
    command: ["gateway", "run"]
    volumes:
      # Everything Hermes remembers — config, sessions, skills, credentials.
      # This is the only thing you need to back up.
      - /CHANGE/ME/data:/opt/data
      # What the agent may see. Only what is in here is visible to it.
      # Do not mount your whole NAS share — told to, it will delete things.
      - /CHANGE/ME/files:/files
    environment:
      # Who owns the files the container writes. This differs per box — look it
      # up rather than leaving a default in place.
      #   Linux         id -u  /  id -g       (usually 1000 / 1000)
      #   Synology DSM  id youraccount over SSH  (per user; often 1026 / 100)
      # Get it wrong and the containers start fine, but your file manager
      # cannot open the data folder.
      - HERMES_UID=CHANGE_ME_UID
      - HERMES_GID=CHANGE_ME_GID
      # The image defaults to /opt/data alone, which leaves the agent able to
      # read /files but not write to it — the "it will not save" you would
      # otherwise hit after mounting a share.
      - HERMES_WRITE_SAFE_ROOT=/opt/data:/files
      # Turns on the gateway's built-in OpenAI-compatible API, which the setup
      # screen chats through. No port is published; only these containers reach it.
      - API_SERVER_KEY=CHANGE_ME_SECRET
      - API_SERVER_HOST=0.0.0.0
      - API_SERVER_PORT=8642
      # Used for schedules and the timestamps it shows you.
      - TZ=UTC

  # ─────────────────────────────────────────────────────────────────────
  # The Hermes dashboard proper. Move here once you are comfortable —
  # skills, schedules, sessions and plugins all live in it.
  # ─────────────────────────────────────────────────────────────────────
  dashboard:
    image: nousresearch/hermes-agent:latest
    container_name: hermes-dashboard
    restart: unless-stopped
    depends_on: [gateway]
    # 0.0.0.0 so other devices can reach it. That is safe here only because the
    # server refuses to start at all without an auth provider.
    command: ["dashboard", "--host", "0.0.0.0", "--no-open"]
    ports:
      - "9119:9119"
    volumes:
      - /CHANGE/ME/data:/opt/data
      - /CHANGE/ME/files:/files
    environment:
      - HERMES_UID=CHANGE_ME_UID
      - HERMES_GID=CHANGE_ME_GID
      # Named BASIC_AUTH, but it is actually a form login.
      - HERMES_DASHBOARD_BASIC_AUTH_USERNAME=admin
      - HERMES_DASHBOARD_BASIC_AUTH_PASSWORD=CHANGE_ME_PASSWORD
      - HERMES_DASHBOARD_BASIC_AUTH_SECRET=CHANGE_ME_SECRET
      - TZ=UTC

  # ─────────────────────────────────────────────────────────────────────
  # The setup screen needs Docker in order to restart the gateway. Handing it
  # /var/run/docker.sock directly would mean that if that container is ever
  # compromised, so is the host. This proxy stands in between and lets only
  # container operations through — no images, no exec, no volumes.
  # It publishes no port, so nothing outside knows it is there.
  # ─────────────────────────────────────────────────────────────────────
  socket-proxy:
    image: tecnativa/docker-socket-proxy:0.3.0
    container_name: hermes-socket-proxy
    restart: unless-stopped
    environment:
      - CONTAINERS=1   # needed to restart
      - POST=1         # a read-only proxy cannot restart anything
      - EXEC=0         # running commands inside containers — blocked
      - IMAGES=0
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
      # Read-only.
      - /var/run/docker.sock:/var/run/docker.sock:ro
```

Then open **`http://<nas-address>:9120`**. Sign in as `admin` with the password
you set above.

---

## Plain Docker · Portainer

With a terminal, save it as a file and run `docker compose up -d`.

With Portainer:

1. **Stacks** → **Add stack**
2. Name it (e.g. `hermes`)
3. Paste the compose into the **Web editor**
4. Replace `/CHANGE/ME` and the passwords
5. **Deploy the stack**

> **A compose with `build:` will not work in the web editor.** That is why there
> is none here. If an example from elsewhere fails, check that first.

Paths must be **absolute, on the host**. Portainer runs in a container, so a
relative `./data` points somewhere you did not mean.

---

## Synology DSM — Container Manager

DSM 7.2 or newer. (Older DSM ships the Docker package, which handles compose
differently.)

1. In **File Station**, create `hermes/data` and `hermes/files` under the
   `docker` shared folder
2. **Container Manager** → **Project** → **Create**
3. Name it `hermes` and point the path at the `docker/hermes` folder
4. Choose **"Create docker-compose.yml"** and paste the compose
5. Replace `/CHANGE/ME` with `/volume1/docker/hermes`

**Check your UID.** DSM assigns a different one per user. Enable SSH in Control
Panel once and run:

```bash
id youraccount
# uid=1026(youraccount) gid=100(users) ...
```

Put those in `HERMES_UID` / `HERMES_GID`. Get this wrong and the containers
start fine but File Station cannot open the `data` folder.

**Ports may collide.** DSM uses 5000/5001, and some packages take 9119. If so,
change only the **left** number in `"9119:9119"` (e.g. `"19119:9119"`).

---

## Once it is up

1. **`http://<nas-address>:9120`** — the setup screen. `admin` and your password
2. Walk the five steps: API key → model → Telegram → tools → done
3. On the last step press **Apply and restart**, then **Run a test**
4. When an answer comes back you are finished. Once you are comfortable, move on
   to Hermes itself at **`http://<nas-address>:9119`**

---

## When it does not work

**The setup screen never loads.** Most likely a port collision. Change the left
number in `"9120:9120"`.

**"Permission denied".** `HERMES_UID` / `HERMES_GID` are wrong. Check the table
above, fix the owner of the existing `data` folder, and recreate the containers.

**Settings saved but nothing changed.** Press **Apply and restart** on the last
step. Settings are written to disk, but the running agent is still holding the
old ones.

**The restart button fails.** Check that `socket-proxy` is running and that
`/var/run/docker.sock` is the right path on your box. Failing that, restart the
`hermes-gateway` container from your NAS UI — the effect is the same.

**The chat tab only offers "go to setup".** No API key or model yet. Finish
steps 1 and 2.
