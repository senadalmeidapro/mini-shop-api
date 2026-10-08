# syntax=docker/dockerfile:1.7

# ─────────────────────────────────────
# Base
# ─────────────────────────────────────
FROM node:22-bookworm-slim AS base

WORKDIR /app

ENV NPM_CONFIG_UPDATE_NOTIFIER=false \
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

# Install all dependencies, including devDependencies.
# Required because @nestjs/cli is normally a devDependency.
RUN npm ci


# ─────────────────────────────────────
# Build
# ─────────────────────────────────────
FROM base AS build

COPY package*.json ./

COPY --from=deps \
    /app/node_modules \
    ./node_modules

COPY tsconfig*.json nest-cli.json ./

COPY src ./src

COPY migrations ./migrations

RUN npm run build


# ─────────────────────────────────────
# Production runtime
# ─────────────────────────────────────
FROM node:22-bookworm-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000 \
    CI=true \
    DATABASE_PATH=/data/database.sqlite

# Runtime packages:
# - dumb-init: proper PID 1 / signal handling
# - sqlite3: allows inspecting the SQLite DB from Railway Shell
# - ca-certificates: HTTPS/TLS
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    dumb-init \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*


# ─────────────────────────────────────
# Non-root user + application directories
# ─────────────────────────────────────
RUN groupadd -r nodeapp \
    && useradd -r -g nodeapp nodeapp \
    && mkdir -p \
        /app/storage/products \
        /app/storage/invoices \
        /data \
    && chown -R nodeapp:nodeapp /app /data


# ─────────────────────────────────────
# Product images (served at /storage/products/*)
# ─────────────────────────────────────
COPY --chown=nodeapp:nodeapp \
    storage/products \
    /app/storage/products/


# ─────────────────────────────────────
# Node dependencies
# ─────────────────────────────────────
COPY --from=deps \
    --chown=nodeapp:nodeapp \
    /app/node_modules \
    ./node_modules


# ─────────────────────────────────────
# Compiled NestJS application
# ─────────────────────────────────────
COPY --from=build \
    --chown=nodeapp:nodeapp \
    /app/dist \
    ./dist


# package.json
COPY --from=build \
    --chown=nodeapp:nodeapp \
    /app/package.json \
    ./package.json


# ─────────────────────────────────────
# SQLite production database
# ─────────────────────────────────────
COPY --chown=nodeapp:nodeapp \
    data/database.sqlite \
    /data/database.sqlite


# ─────────────────────────────────────
# Run as non-root
# ─────────────────────────────────────
USER nodeapp


# ─────────────────────────────────────
# HTTP port
# ─────────────────────────────────────
EXPOSE 3000


# ─────────────────────────────────────
# Process manager
# ─────────────────────────────────────
ENTRYPOINT ["dumb-init", "--"]


# ─────────────────────────────────────
# Start application
# ─────────────────────────────────────
CMD ["node", "dist/src/main.js"]
