# Хижина — сайт базы отдыха

Одностраничный сайт с приёмом заявок через Telegram-бот. Две локали (ru/en).
Контент ведётся в **Directus** (PostgreSQL); сайт — Next.js за Docker Compose.
На VDS весь стек работает за декларативным **Nginx**. Правила проксирования лежат в репозитории и не требуют настройки в интерфейсе.

- **Стек:** Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · Directus 11 · Postgres 16
- **Пакетный менеджер:** pnpm 10
- **Хостинг:** свой VDS (Vercel отложен)

---

## Быстрый старт (локально)

```bash
cp .env.example .env
# .env.example — шаблон VDS (hizhina-sakhalin.ru). Для локалки переопределите:
#   APP_ENV=  CONTENT_FALLBACK=static
#   DIRECTUS_URL=http://localhost:8055  DIRECTUS_PUBLIC_URL=http://localhost:8055
#   NEXT_PUBLIC_SITE_URL=http://localhost:3000  NEXT_PUBLIC_IMAGE_HOST=localhost:8055
#   NEXT_PUBLIC_IMAGE_PROTOCOL=http  SITE_DOMAIN=_  CMS_DOMAIN=cms.localhost
# и все CHANGE_ME_* пароли / секреты

pnpm install
pnpm compose:up                 # db + Directus → http://localhost:8055
pnpm bootstrap:directus         # схема, роль Website, печатает DIRECTUS_TOKEN
# вставьте DIRECTUS_TOKEN в .env
pnpm seed                       # контент из репозитория → Directus

pnpm dev                        # http://localhost:3000 → /ru
```

Команды:

| Команда                              | Что делает                               |
| ------------------------------------ | ---------------------------------------- |
| `pnpm dev`                           | Дев-сервер                               |
| `pnpm build` / `start`               | Продовая сборка / запуск                 |
| `pnpm bootstrap:directus`            | Схема + роль Website + static token      |
| `pnpm seed`                          | Залить контент в Directus                |
| `pnpm compose:up`                    | Postgres + Directus                      |
| `pnpm compose:web`                   | Собрать и поднять Next в Docker          |
| `pnpm compose:proxy`                 | Поднять весь стек, включая Nginx gateway |
| `pnpm lint` / `typecheck` / `format` | Проверки и формат                        |

---

## Переменные окружения

Полный список — в [`.env.example`](.env.example).

| Переменная               | Назначение                                                        |
| ------------------------ | ----------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`   | Canonical (обязателен при `APP_ENV=production`)                   |
| `APP_ENV`                | `production` на VDS — robots Allow, HSTS, проверка SITE_URL       |
| `NEXT_PUBLIC_IMAGE_HOST` | Hostname ассетов Directus (`cms.hizhina-sakhalin.ru`)             |
| `DIRECTUS_URL`           | Серверный URL CMS                                                 |
| `DIRECTUS_TOKEN`         | Static token роли Website                                         |
| `REVALIDATE_SECRET`      | Секрет webhook `/api/revalidate`                                  |
| `CONTENT_FALLBACK`       | `static` — читать `site-content.ts`, если Directus недоступен     |

`NEXT_PUBLIC_*` вшиваются на **сборке**.

---

## Контент

Точка входа сайта: `getSiteContent()` → Directus (`src/lib/content/directus/`).
Файл `src/lib/content/site-content.ts` остаётся seed/fallback.

Схема коллекций и Flow revalidate: [`directus/README.md`](directus/README.md),
[`directus/flows/revalidate.md`](directus/flows/revalidate.md).

UI-строки (`src/i18n/messages`) и политика (`src/lib/legal/privacy.ts`) в CMS не входят.

Что ещё нужно от заказчицы — [`content/TODO-CONTENT.md`](content/TODO-CONTENT.md).

---

## Структура

```
docker-compose.yml              db, directus, web, nginx
nginx/templates/                декларативные правила gateway
docker-compose.prod.yml         на VDS снимает публикацию портов web/directus
Dockerfile                      Next standalone
directus/                       схема (через bootstrap), flows
scripts/                        bootstrap-directus.mjs, seed-directus.mjs
src/
├── app/
│   ├── api/revalidate/         webhook из Directus Flow
│   └── [locale]/              страницы
├── lib/content/
│   ├── index.ts                getSiteContent
│   ├── site-content.ts         seed / fallback
│   └── directus/               client, map, fetch
└── ...
```

---

## Хостинг на VDS

Стек целиком в Docker: Postgres, Directus, Next и Nginx gateway.
Vercel не нужен. Минимально: VPS с 2 GB RAM, Ubuntu 22.04+, открытые порты
`22` и `80`.

### 1. Сервер

```bash
# Docker + Compose plugin
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER   # затем перелогиниться

# Node/pnpm — только для одноразовых bootstrap/seed с хоста
curl -fsSL https://get.pnpm.io/install.sh | sh -
# либо запускайте скрипты через временный контейнер node (ниже)
```

Файрвол (пример ufw): разрешить `22/80` (и `443` после TLS), остальное закрыть.
Порты `3000` и `8055` снаружи не открывать — к ним ходит только Nginx внутри Docker-сети.

### 2. DNS

У регистратора домена:

| Тип          | Имя        | Значение |
| ------------ | ---------- | -------- |
| A (или AAAA) | `@` (сайт) | IP VDS   |
| A            | `www`      | IP VDS   |
| A            | `cms`      | IP VDS   |

Дождитесь резолва (`dig +short hizhina-sakhalin.ru`), иначе сертификат не выдастся.

### 3. Код и `.env`

```bash
git clone <repo> /opt/hizhina && cd /opt/hizhina
cp .env.example .env
nano .env   # заменить все CHANGE_ME_*; после bootstrap — DIRECTUS_TOKEN
```

[`.env.example`](.env.example) уже заполнен под production: домен
`hizhina-sakhalin.ru`, `cms.hizhina-sakhalin.ru`, `APP_ENV=production`,
пустой `CONTENT_FALLBACK`. В Docker `web` всё равно ходит на
`http://directus:8055` внутри сети Compose.

На этапе Docker-сборки `web` fallback в TS уже зашит в compose (build-arg).

### 4. Первый запуск

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

Поднимутся: `db`, `directus`, `web`, `nginx`. Снаружи открыт только `80`.

Проверка: `docker compose ps`, логи — `docker compose logs -f nginx directus web`.

### 5. Nginx gateway

Домены уже в `.env.example`:

```env
SITE_DOMAIN=hizhina-sakhalin.ru www.hizhina-sakhalin.ru
CMS_DOMAIN=cms.hizhina-sakhalin.ru
```

Nginx направляет сайт на `web:3000`, CMS на `directus:8055`
(`nginx/templates/default.conf.template`). Сейчас gateway слушает **HTTP :80**;
после подключения TLS верните `https` в `NEXT_PUBLIC_SITE_URL` /
`DIRECTUS_PUBLIC_URL` / `NEXT_PUBLIC_IMAGE_PROTOCOL` (уже так в example) и
пересоберите `web`. Для временного HTTP до TLS смените эти три значения на
`http` и `NEXT_PUBLIC_IMAGE_PROTOCOL=http`, затем снова на `https`.

### 6. Схема и контент Directus (один раз)

С хоста, когда CMS уже доступен по HTTPS (или временно пробросьте порт):

```bash
# в .env для скриптов уже стоит:
# DIRECTUS_URL=https://cms.hizhina-sakhalin.ru

pnpm install   # если Node на сервере есть
pnpm bootstrap:directus   # напечатает DIRECTUS_TOKEN
# вписать DIRECTUS_TOKEN в .env
pnpm seed
```

Без Node на сервере:

```bash
docker run --rm -it --network hizhina_internal \
  -v "$PWD:/app" -w /app --env-file .env node:22-alpine \
  sh -c "corepack enable && node --env-file=.env scripts/bootstrap-directus.mjs"
# сеть: docker network ls | grep hizhina
```

После появления токена пересоздать `web`, чтобы подхватил `DIRECTUS_TOKEN`:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build web
```

### 7. Flow revalidate

В Directus Admin → Settings → Flows — по шагам из
[`directus/flows/revalidate.md`](directus/flows/revalidate.md):

- Trigger на `settings`, `pages`, `cabins`, `services`, `extras`
- Webhook `POST http://web:3000/api/revalidate`
- Header `x-revalidate-secret: <REVALIDATE_SECRET>`

URL внутренний (`web`), не публичный домен.

### 8. Проверка

- `https://hizhina-sakhalin.ru` и `/en` открываются (или `http://` до TLS)
- `https://cms.hizhina-sakhalin.ru` — логин в Directus
- `/robots.txt` — `Allow: /` при `APP_ENV=production`
- правка цены домика в CMS → на сайте без ребилда
- Telegram deep link `?start=cabin-a` живой

### Обновление кода

```bash
cd /opt/hizhina
git pull
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

Volumes Postgres и uploads сохраняются.

### Бэкапы

- Postgres: `docker compose exec db pg_dump -U directus directus > backup.sql`
- Uploads Directus: volume `hizhina_directus_uploads`

### Типичные проблемы

| Симптом                  | Что проверить                                                   |
| ------------------------ | --------------------------------------------------------------- |
| Нет HTTPS                | Gateway сейчас на HTTP :80; TLS подключайте отдельно            |
| Сайт без картинок из CMS | `NEXT_PUBLIC_IMAGE_HOST=cms.hizhina-sakhalin.ru`, rebuild `web` |
| 502 от Nginx             | `docker compose ps` — живы ли `web`/`directus`; логи `nginx`    |
| Контент не обновляется   | Flow, `REVALIDATE_SECRET`, логи `web`                           |
| Bootstrap не логинится   | `DIRECTUS_URL=https://cms.hizhina-sakhalin.ru`, пароль admin    |

---

## Шрифты

Comfortaa и Nunito — локально в `src/assets/fonts/` (`next/font/local`). См. `DECISIONS.md`.

---

## Безопасность

CSP, HSTS (при `APP_ENV=production`), `X-Frame-Options: DENY` и др. — в `next.config.ts`.
`'unsafe-inline'` в script-src — см. `DECISIONS.md` №9.
