FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache \
  chromium \
  nss \
  freetype \
  freetype-dev \
  harfbuzz \
  ca-certificates \
  ttf-freefont

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
  PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

COPY package*.json ./
RUN npm install --omit=dev

COPY . .
RUN npm run build

RUN mkdir -p logs storage

EXPOSE 3001

CMD ["npm", "start"]