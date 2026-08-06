# Directus Flow → on-demand revalidate

Воспроизводимые шаги (Directus Admin → Settings → Flows → Create Flow).

## 1. Flow

- **Name:** `Revalidate site`
- **Status:** Active
- **Trigger:** Event Hook
- **Type:** Action (Non-Blocking)
- **Scope:** `items.create`, `items.update`, `items.delete`
- **Collections:** `settings`, `pages`, `cabins`, `services`, `extras`

## 2. Operation — Webhook / Request URL

- **Method:** POST
- **URL (Docker web):** `http://web:3000/api/revalidate`
- **URL (pnpm dev на хосте):** `http://host.docker.internal:3000/api/revalidate`
- **Headers:**
  - `Content-Type: application/json`
  - `x-revalidate-secret: <значение REVALIDATE_SECRET из .env>`
- **Body:** `{}`

## 3. Проверка

1. Открыть сайт, убедиться что цена домика на месте.
2. В Directus изменить `price_per_night` у домика.
3. Обновить страницу сайта (без `pnpm build`) — цена должна обновиться.
