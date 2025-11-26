# ---------------------------
# Builder Stage
# ---------------------------
FROM node:22-alpine AS builder
WORKDIR /app

RUN apk update && apk add --no-cache \
  bash \
  chromium \
  chromium-chromedriver \
  nss \
  freetype \
  harfbuzz \
  ca-certificates \
  ttf-freefont \
  && apk add --no-cache --virtual .build-deps \
  gcc g++ make python3 && \
  npm install -g cross-env

COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

RUN npm install playwright

COPY tsconfig*.json ./
COPY src ./src

RUN npm run build
RUN npm run build:cli

# ---------------------------
# Runtime Stage
# ---------------------------
FROM node:22-alpine AS runtime
WORKDIR /app

RUN apk update && apk add --no-cache \
  chromium \
  chromium-chromedriver \
  nss \
  freetype \
  harfbuzz \
  ca-certificates \
  ttf-freefont

ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 \
  PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium-browser \
  NODE_ENV=production

COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/data ./src/data

RUN mkdir -p logs storage

CMD ["node", "dist/index.js"]
