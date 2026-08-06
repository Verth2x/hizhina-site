# Directus

Схема и права создаются скриптом `pnpm bootstrap:directus` после
`docker compose up -d db directus`. Контент — `pnpm seed`.

## Коллекции

| Коллекция   | Тип        | Назначение                                      |
| ----------- | ---------- | ----------------------------------------------- |
| `settings`  | singleton  | Контакты и реквизиты (общие для локалей)        |
| `pages`     | collection | Brand / hero / about — одна запись на локаль    |
| `cabins`    | collection | Домики (`locale` + `slug`)                      |
| `services`  | collection | Услуги (`locale` + `key`)                       |
| `extras`    | collection | Доп. товары (`locale` + `slug`)                 |

Локаль — поле `locale` (`ru` \| `en`), а не O2M Translations: так bootstrap
и seed воспроизводимы через REST без хрупких junction-таблиц. Редактор
правит русскую и английскую карточки отдельно (как в Keystatic).

Роль **Website** — только чтение опубликованного. Static token печатает
bootstrap; его кладут в `DIRECTUS_TOKEN`.

## Flow: revalidate

После seed создайте Flow вручную (или повторите шаги из
[`flows/revalidate.md`](flows/revalidate.md)):

1. Trigger: Event Hook → Action (`items.create` / `items.update` / `items.delete`)
   на коллекциях `settings`, `pages`, `cabins`, `services`, `extras`
2. Operation: Webhook → `POST http://web:3000/api/revalidate`
   Header: `x-revalidate-secret: <REVALIDATE_SECRET>`
   (при `pnpm dev` на хосте: `http://host.docker.internal:3000/api/revalidate`)
