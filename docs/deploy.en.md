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

## Three things to decide before pasting

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

**2. UID / GID.** This decides who owns the files the container writes. Get it
wrong and the file manager says "permission denied".

| Box | Value |
|---|---|
| Plain Linux | `id -u` / `id -g` — usually `1000` / `1000` |
| Synology DSM | Varies per user. Check over SSH with `id <account>`. Usually `1026` / group `100` |

**3. A password.** Replace `CHANGE_ME_PASSWORD` and `CHANGE_ME_SECRET`. The
secret can be any long random string — it signs session cookies, and without a
stable one every restart signs you out.

> **Your OpenRouter key and Telegram token do not go in here.** You add them in
> the setup screen after it is running. That is the whole point of this repo.

---

## The compose

Copy the whole thing. Both routes use this same file.

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
      # Without this the agent can read /files but not write to it.
      - HERMES_WRITE_SAFE_ROOT=/opt/data:/files
      # What the setup screen chats through. No port is published for it.
      - API_SERVER_KEY=CHANGE_ME_SECRET
      - API_SERVER_HOST=0.0.0.0
      - API_SERVER_PORT=8642
      - TZ=UTC

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
      - TZ=UTC

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
      # Same login as the Hermes dashboard.
      - SETUP_USER=admin
      - SETUP_PASSWORD=CHANGE_ME_PASSWORD
      - SETUP_SECRET=CHANGE_ME_SECRET
      - GATEWAY_CONTAINER=hermes-gateway
      - DOCKER_PROXY_URL=http://socket-proxy:2375
      - HERMES_API_URL=http://gateway:8642
      - API_SERVER_KEY=CHANGE_ME_SECRET
      # Where "open the dashboard" goes at the end. Use your NAS address.
      - DASHBOARD_URL=http://192.168.0.10:9119
      - TZ=UTC

  # The setup screen has to be able to restart the gateway. Handing it the raw
  # Docker socket would hand it the host, so this proxy exposes the container
  # endpoints and refuses images, exec and volumes. It publishes no port.
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
