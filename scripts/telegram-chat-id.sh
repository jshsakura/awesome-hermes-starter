#!/usr/bin/env bash
# Print the Telegram user/chat ids that have messaged your bot.
#
# You need this because TELEGRAM_ALLOWED_USERS takes numeric ids, not @handles,
# and Telegram gives you no way to look your own id up from the app.
#
#   1. Create a bot: message @BotFather, /newbot, copy the token
#   2. Put the token in .env as TELEGRAM_BOT_TOKEN
#   3. Open your new bot in Telegram and send it any message ("hi")
#   4. Run this script
#
# IMPORTANT — run this BEFORE `docker compose up`, or stop the gateway first:
#
#     docker compose stop gateway
#
# Telegram hands each update to whoever asks first and only once. If the Hermes
# gateway is polling the same bot token, it takes the message and this script
# sees nothing — and worse, if this script wins, the gateway silently misses
# what you said. There is no error either way; the two just quietly steal from
# each other.

set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

TOKEN="${TELEGRAM_BOT_TOKEN:-}"
if [ -z "$TOKEN" ] && [ -f .env ]; then
  TOKEN="$(grep -E '^TELEGRAM_BOT_TOKEN=' .env | tail -1 | cut -d= -f2- | tr -d '"'"'"' ')"
fi

if [ -z "$TOKEN" ]; then
  echo "TELEGRAM_BOT_TOKEN is not set (checked the environment and .env)." >&2
  echo "Get one from @BotFather, then put it in .env." >&2
  exit 1
fi

if docker compose ps --services --filter status=running 2>/dev/null | grep -qx gateway; then
  echo "WARNING: the gateway is running and is polling this same bot token." >&2
  echo "         Run 'docker compose stop gateway' first, or it will take the" >&2
  echo "         messages before this script sees them." >&2
  echo >&2
fi

echo "Asking Telegram what your bot has received..."
response="$(curl -fsS "https://api.telegram.org/bot${TOKEN}/getUpdates")"

python3 - "$response" <<'PY'
import json, sys

data = json.loads(sys.argv[1])
if not data.get("ok"):
    print(f"Telegram said no: {data.get('description', data)}")
    sys.exit(1)

seen = {}
for update in data.get("result", []):
    msg = update.get("message") or update.get("edited_message") or {}
    chat = msg.get("chat") or {}
    if chat.get("id") is None:
        continue
    who = chat.get("username") or " ".join(
        p for p in (chat.get("first_name"), chat.get("last_name")) if p
    ) or chat.get("title") or "?"
    seen[chat["id"]] = (who, chat.get("type", "?"))

if not seen:
    print()
    print("No messages yet. Open your bot in Telegram, send it anything, and")
    print("run this again. (Telegram only keeps recent updates, so if you sent")
    print("a message days ago it may already be gone — just send another.)")
    sys.exit(0)

print()
for chat_id, (who, kind) in seen.items():
    print(f"  {chat_id}\t{who}\t({kind})")
print()
ids = ",".join(str(i) for i in seen)
print("Put this line in .env:")
print()
print(f"  TELEGRAM_ALLOWED_USERS={ids}")
print()
print("Only these ids will be able to talk to your agent. Leaving it empty")
print("lets anyone who finds the bot use your files and your quota.")
PY
