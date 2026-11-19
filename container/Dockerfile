# syntax=docker/dockerfile:1

FROM node:20-bookworm-slim

WORKDIR /opt/app

COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    --mount=type=secret,id=npmrc,target=/opt/app/.npmrc \
    npm ci --omit=dev --no-audit --no-fund

COPY src ./src

ENV HOST=0.0.0.0
ENV PORT=8085
EXPOSE 8085

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:8085/',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "src/server.js"]
