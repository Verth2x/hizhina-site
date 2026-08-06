# Хижина — сайт базы отдыха

Одностраничный сайт с приёмом заявок через Telegram-бот. Две локали (ru/en).
Контент ведётся в **Directus** (PostgreSQL); сайт — Next.js за Docker Compose.
На VDS — весь стек за **Nginx Proxy Manager** (прокси, Let's Encrypt, домены).

- **Стек:** Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · Directus 11 · Postgres 16
- **Пакетный менеджер:** pnpm 10
- **Хостинг:** свой VDS (Vercel отложен)

---

## Быстрый старт (локально)

```bash
cp .env.example .env
# Задайте пароли: POSTGRES_PASSWORD, DIRECTUS_SECRET, DIRECTUS_ADMIN_*, REVALIDATE_SECRET

pnpm install
pnpm compose:up                 # db + Directus → http://localhost:8055
pnpm bootstrap:directus         # схема, роль Website, печатает DIRECTUS_TOKEN
# вставьте DIRECTUS_TOKEN в .env
pnpm seed                       # контент из репозитория → Directus

# В .env.local для Next (или том же .env):
#   DIRECTUS_URL=http://localhost:8055
#   DIRECTUS_TOKEN=...
#   CONTENT_FALLBACK=static     # страховка, если CMS ещё не поднят

pnpm dev                        # http://localhost:3000 → /ru
```

Команды:

| Команда                 | Что делает                                      |
| ----------------------- | ----------------------------------------------- |
| `pnpm dev`              | Дев-сервер                                      |
| `pnpm build` / `start`  | Продовая сборка / запуск                        |
| `pnpm bootstrap:directus` | Схема + роль Website + static token           |
| `pnpm seed`             | Залить контент в Directus                       |
| `pnpm compose:up`       | Postgres + Directus                             |
| `pnpm compose:web`      | Собрать и поднять Next в Docker                 |
| `pnpm compose:proxy`    | + Nginx Proxy Manager (профиль `proxy`)         |
| `pnpm lint` / `typecheck` / `format` | Проверки и формат                    |

---

## Переменные окружения

Полный список — в [`.env.example`](.env.example).

| Переменная | Назначение |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical (обязателен при `APP_ENV=production`) |
| `APP_ENV` | `production` на VDS — robots Allow, HSTS, проверка SITE_URL |
| `NEXT_PUBLIC_IMAGE_HOST` | Hostname ассетов Directus (`localhost:8055` или `cms.example.ru`) |
| `DIRECTUS_URL` | Серверный URL CMS |
| `DIRECTUS_TOKEN` | Static token роли Website |
| `REVALIDATE_SECRET` | Секрет webhook `/api/revalidate` |
| `CONTENT_FALLBACK` | `static` — читать `site-content.ts`, если Directus недоступен |

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
docker-compose.yml              db, directus, web; npm (profile proxy)
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

Стек целиком в Docker: Postgres, Directus, Next, Nginx Proxy Manager (SSL и домены).
Vercel не нужен. Минимально: VPS с 2 GB RAM, Ubuntu 22.04+, открытые порты
`22`, `80`, `443`, `81`.

### 1. Сервер

```bash
# Docker + Compose plugin
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER   # затем перелогиниться

# Node/pnpm — только для одноразовых bootstrap/seed с хоста
curl -fsSL https://get.pnpm.io/install.sh | sh -
# либо запускайте скрипты через временный контейнер node (ниже)
```

Файрвол (пример ufw): разрешить `22/80/443/81`, остальное закрыть.
Порты `3000` и `8055` снаружи не открывать — к ним ходит только NPM внутри Docker-сети.

### 2. DNS

У регистратора домена:

| Тип | Имя | Значение |
| --- | --- | --- |
| A (или AAAA) | `@` (сайт) | IP VDS |
| A | `www` | IP VDS |
| A | `cms` | IP VDS |

Дождитесь резолва (`dig +short example.ru`), иначе Let's Encrypt не выдаст сертификат.

### 3. Код и `.env`

```bash
git clone <repo> /opt/hizhina && cd /opt/hizhina
cp .env.example .env
nano .env
```

Обязательно задать:

```env
APP_ENV=production
NEXT_PUBLIC_SITE_URL=https://example.ru
NEXT_PUBLIC_IMAGE_HOST=cms.example.ru
DIRECTUS_PUBLIC_URL=https://cms.example.ru
# DIRECTUS_URL для контейнера web подставляется в compose как http://directus:8055

POSTGRES_PASSWORD=<длинный>
DIRECTUS_SECRET=<длинный-random>
DIRECTUS_ADMIN_EMAIL=you@example.ru
DIRECTUS_ADMIN_PASSWORD=<сложный>
REVALIDATE_SECRET=<длинный>

# После bootstrap:
DIRECTUS_TOKEN=
```

`CONTENT_FALLBACK` в runtime на VDS лучше оставить пустым (источник — Directus).
На этапе Docker-сборки `web` fallback уже зашит в compose.

### 4. Первый запуск

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml --profile proxy up -d --build
```

Поднятся: `db`, `directus`, `web`, `npm`. Снаружи: `80`, `443`, `81`.

Проверка: `docker compose ps`, логи — `docker compose logs -f directus web npm`.

### 5. Nginx Proxy Manager

1. Открыть `http://<IP-VDS>:81`
2. Дефолтный логин NPM: `admin@example.com` / `changeme` — **сменить сразу**
3. **Hosts → Proxy Hosts → Add:**

**Сайт**

- Domain: `example.ru`, `www.example.ru`
- Forward: `http` → `web` → `3000` (имя сервиса Compose, не localhost)
- SSL: Request a new SSL Certificate (Let's Encrypt), Force SSL, HTTP/2
- Websockets: On (на всякий случай)

**CMS**

- Domain: `cms.example.ru`
- Forward: `http` → `directus` → `8055`
- SSL так же
- Access List: ограничить по IP или Basic Auth — админка не для публики

### 6. Схема и контент Directus (один раз)

С хоста, когда CMS уже доступен по HTTPS (или временно пробросьте порт):

```bash
# в .env для скриптов:
# DIRECTUS_URL=https://cms.example.ru
# BOOTSTRAP_ADMIN_EMAIL / PASSWORD = как DIRECTUS_ADMIN_*

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
docker compose -f docker-compose.yml -f docker-compose.prod.yml --profile proxy up -d --build web
```

### 7. Flow revalidate

В Directus Admin → Settings → Flows — по шагам из
[`directus/flows/revalidate.md`](directus/flows/revalidate.md):

- Trigger на `settings`, `pages`, `cabins`, `services`, `extras`
- Webhook `POST http://web:3000/api/revalidate`
- Header `x-revalidate-secret: <REVALIDATE_SECRET>`

URL внутренний (`web`), не публичный домен.

### 8. Проверка

- `https://example.ru` и `https://example.ru/en` открываются
- `https://cms.example.ru` — логин в Directus
- `https://example.ru/robots.txt` — `Allow: /`
- правка цены домика в CMS → через несколько секунд на сайте без ребилда
- Telegram deep link `?start=cabin-a` живой

### Обновление кода

```bash
cd /opt/hizhina
git pull
docker compose -f docker-compose.yml -f docker-compose.prod.yml --profile proxy up -d --build
```

Volumes (`pgdata`, uploads, сертификаты NPM) сохраняются.

### Бэкапы

- Postgres: `docker compose exec db pg_dump -U directus directus > backup.sql`
- Uploads Directus: volume `hizhina_directus_uploads`
- NPM (прокси + сертификаты): volumes `npm_data`, `npm_letsencrypt`

### Типичные проблемы

| Симптом | Что проверить |
| --- | --- |
| SSL не выдаётся | DNS уже на IP? Порты 80/443 открыты с интернета? |
| Сайт без картинок из CMS | `NEXT_PUBLIC_IMAGE_HOST=cms.example.ru`, пересборка `web` |
| 502 от NPM | `docker compose ps` — живы ли `web`/`directus`; forward на имя сервиса |
| Контент не обновляется | Flow, `REVALIDATE_SECRET`, логи `web` |
| Bootstrap не логинится | `DIRECTUS_URL` с хоста = публичный `https://cms…`, пароль admin |

---

## Шрифты

Comfortaa и Nunito — локально в `src/assets/fonts/` (`next/font/local`). См. `DECISIONS.md`.

---

## Безопасность

CSP, HSTS (при `APP_ENV=production`), `X-Frame-Options: DENY` и др. — в `next.config.ts`.
`'unsafe-inline'` в script-src — см. `DECISIONS.md` №9.
