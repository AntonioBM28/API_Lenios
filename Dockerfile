# syntax=docker/dockerfile:1

# ──────────────────────────────────────────────────────────────────────────
# Leños Rellenos API — Dockerfile multi-stage (NestJS + TypeORM)
#
# 4 etapas para mantener la imagen final pequeña y sin herramientas de
# compilación:
#   1. build-deps  → base con compiladores (necesarios para `bcrypt` nativo)
#   2. build       → instala TODAS las deps y compila TypeScript → dist/
#   3. prod-deps   → instala SOLO deps de producción (bcrypt ya compilado)
#   4. runtime     → imagen final: node "slim" limpio + dist/ + node_modules
# ──────────────────────────────────────────────────────────────────────────

FROM node:20-bookworm-slim AS build-deps
WORKDIR /app
# python3/make/g++: requeridos por node-gyp para compilar el binding nativo
# de `bcrypt`. Solo existen en las etapas intermedias, nunca en la final.
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

# ── Etapa: build ────────────────────────────────────────────────────────────
FROM build-deps AS build
COPY package*.json ./
RUN npm ci
COPY tsconfig*.json nest-cli.json ./
COPY src ./src
RUN npm run build

# ── Etapa: dependencias de producción ───────────────────────────────────────
FROM build-deps AS prod-deps
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# ── Etapa final: runtime ────────────────────────────────────────────────────
FROM node:20-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app

# Usuario no-root (mejor práctica de seguridad para contenedores)
RUN groupadd --system nodejs && useradd --system --gid nodejs nestjs

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package*.json ./

USER nestjs

EXPOSE 3000

# Healthcheck usando el endpoint GET /health (sin curl, con Node nativo)
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:' + (process.env.PORT || 3000) + '/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "dist/main"]
