# syntax=docker/dockerfile:1

FROM node:24.3.0-bookworm-slim AS deps

WORKDIR /opt/app

COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev --no-audit --no-fund

FROM node:24.3.0-bookworm-slim AS build

WORKDIR /opt/app

COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund

COPY tsconfig.json ./
COPY src ./src
RUN npx tsc -p tsconfig.json

FROM node:24.3.0-bookworm-slim AS runtime

WORKDIR /opt/app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=8085

COPY --from=deps --chown=node:node /opt/app/node_modules ./node_modules
COPY --from=deps --chown=node:node /opt/app/package.json ./package.json
COPY --from=build --chown=node:node /opt/app/build ./build

USER node

EXPOSE 8085

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:8085/',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "build/server/http/server.js"]
