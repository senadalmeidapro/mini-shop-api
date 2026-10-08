# syntax=docker/dockerfile:1.7

FROM node:22-bookworm-slim AS base

WORKDIR /app

ENV NODE_ENV=production \
    NPM_CONFIG_UPDATE_NOTIFIER=false \
    NPM_CONFIG_FUND=false \
    NPM_CONFIG_AUDIT=false

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*


# ─────────────────────────────────────
# Dependencies
# ─────────────────────────────────────
FROM base AS deps

COPY package*.json ./

RUN npm ci


# ─────────────────────────────────────
# Build
# ─────────────────────────────────────
FROM base AS build

COPY package*.json ./
COPY --from=deps /app/node_modules ./node_modules

COPY tsconfig*.json nest-cli.json ./
COPY src ./src
COPY migrations ./migrations

RUN npm run build


# ─────────────────────────────────────
# Runtime
# ─────────────────────────────────────
FROM node:22-bookworm-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production \
    PORT=4000 \
    CI=true

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    dumb-init \
    && rm -rf /var/lib/apt/lists/*

RUN groupadd -r nodeapp && useradd -r -g nodeapp nodeapp \
    && mkdir -p /app/storage/products \
               /app/storage/invoices \
               /data \
    && chown -R nodeapp:nodeapp /app /data

COPY --from=deps --chown=nodeapp:nodeapp \
    /app/node_modules ./node_modules

COPY --from=build --chown=nodeapp:nodeapp \
    /app/dist ./dist

COPY --from=build --chown=nodeapp:nodeapp \
    /app/package.json ./package.json

USER nodeapp

EXPOSE 4000

ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "dist/src/main.js"]
