# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.34.5 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ARG NEXT_PUBLIC_IMAGE_HOST=
ARG NEXT_PUBLIC_IMAGE_PROTOCOL=
ARG NEXT_PUBLIC_YANDEX_METRICA_ID=
ARG DIRECTUS_URL=http://directus:8055
ARG CONTENT_FALLBACK=static
ARG APP_ENV=production

ENV NEXT_TELEMETRY_DISABLED=1 \
    APP_ENV=$APP_ENV \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_IMAGE_HOST=$NEXT_PUBLIC_IMAGE_HOST \
    NEXT_PUBLIC_IMAGE_PROTOCOL=$NEXT_PUBLIC_IMAGE_PROTOCOL \
    NEXT_PUBLIC_YANDEX_METRICA_ID=$NEXT_PUBLIC_YANDEX_METRICA_ID \
    DIRECTUS_URL=$DIRECTUS_URL \
    CONTENT_FALLBACK=$CONTENT_FALLBACK

# DIRECTUS_TOKEN приходит секретом, а не ARG.
#
# ARG со значением остаётся в метаданных промежуточного образа, и `docker
# history` на машине сборки показывает токен целиком. В финальный образ он
# не попадал и раньше (стадия runner идёт FROM base), но само хранение
# долгоживущего токена CMS в истории слоёв — лишнее.
#
# Секрет виден только этой команде и не сохраняется ни в одном слое.
# Если он не передан, файла нет, DIRECTUS_TOKEN остаётся пустым, и сборка
# уходит на CONTENT_FALLBACK=static — ровно как при первом bootstrap.
RUN --mount=type=secret,id=directus_token \
    DIRECTUS_TOKEN="$(cat /run/secrets/directus_token 2>/dev/null || true)" \
    pnpm build

FROM base AS runner
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
