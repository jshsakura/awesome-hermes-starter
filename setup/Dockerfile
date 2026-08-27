# Two stages so the published image carries no toolchain: node builds the
# bundle, python serves it. Users pull this from ghcr and never build — the
# whole point of the starter is that nothing compiles on the NAS.

FROM node:22-alpine AS web
WORKDIR /src
COPY web/package.json web/package-lock.json* ./
RUN npm install --no-audit --no-fund
COPY web/ ./
RUN npm run build

FROM python:3.13-slim
WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .
COPY --from=web /src/dist ./web

ENV WEB_DIST=/app/web \
    HERMES_DATA=/opt/data \
    PYTHONUNBUFFERED=1

EXPOSE 9120
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "9120"]
