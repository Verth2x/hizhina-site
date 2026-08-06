/* ---------------------------------------------------------------------------
   Конфигурация Keystatic.

   ФАЙЛ ПОКА НЕ АКТИВЕН. Он написан заранее, чтобы включение CMS было
   механической операцией, а не проектированием с нуля. Обоснование, почему
   не включён сейчас, — в DECISIONS.md, решение №11.

   ЧТОБЫ ВКЛЮЧИТЬ:

     1. pnpm add @keystatic/core @keystatic/next
     2. Переименовать этот файл: keystatic.config.example.ts → keystatic.config.ts
     3. Создать два маршрута:

        src/app/keystatic/layout.tsx
          import KeystaticApp from './keystatic';
          export default function Layout({ children }) { return children; }

        src/app/keystatic/[[...params]]/page.tsx
          'use client';
          import { makePage } from '@keystatic/next/ui/app';
          import config from '../../../../keystatic.config';
          export default makePage(config);

        src/app/api/keystatic/[...params]/route.ts
          import { makeRouteHandler } from '@keystatic/next/route-handler';
          import config from '../../../../../keystatic.config';
          export const { POST, GET } = makeRouteHandler({ config });

     4. Перевести getSiteContent() с site-content.ts на createReader():

        import { createReader } from '@keystatic/core/reader';
        import config from '../../../keystatic.config';
        const reader = createReader(process.cwd(), config);

     5. Запретить индексацию админки: добавить /keystatic в disallow в robots.ts
     6. Завести заказчице GitHub-аккаунт и выдать доступ ВМЕСТЕ С НЕЙ,
        не инструкцией по почте. Записать скринкаст на три минуты:
        как поменять цену домика.

   ЛОКАЛИЗАЦИЯ. Две параллельные коллекции (ru/en) вместо полей-переводов
   внутри одной записи: у заказчицы английские тексты появятся позже и от
   другого человека (копирайтера), а редактировать их будут по отдельности.
   Общая запись с парой полей заставляла бы открывать русскую карточку,
   чтобы поправить английскую опечатку.

   ИЗОБРАЖЕНИЯ грузятся прямо в репозиторий (public/images) — это тот же
   git-based подход, что и у текста: правка контента = коммит = ребилд.
   Отдельный ревалидационный маршрут не нужен, поэтому /api/revalidate удалён.
--------------------------------------------------------------------------- */

import { collection, config, fields, singleton } from '@keystatic/core';

const localeDirs = { ru: 'content/ru', en: 'content/en' } as const;

/** Цена в рублях. Целое, без копеек — прайс-лист заказчицы так и устроен. */
const rubles = (label: string) =>
  fields.integer({
    label,
    validation: { isRequired: true, min: 0 },
    description: 'Целое число рублей, без пробелов и знака ₽',
  });

const image = (label: string, directory: string) =>
  fields.image({
    label,
    directory: 'public/images/' + directory,
    publicPath: '/images/' + directory + '/',
    description: 'Горизонтальный кадр, от 1600 px по длинной стороне',
  });

function cabinsCollection(locale: keyof typeof localeDirs) {
  return collection({
    label: 'Домики (' + locale.toUpperCase() + ')',
    slugField: 'name',
    path: localeDirs[locale] + '/cabins/*',
    format: { data: 'json' },
    schema: {
      name: fields.slug({
        name: {
          label: 'Название',
          description: 'Как называется домик — например, Домик «Лесной»',
        },
        slug: {
          label: 'Код объекта',
          description:
            'Уходит в ссылку на Telegram-бот. Только латиница, цифры, дефис ' +
            'и подчёркивание — кириллицу Telegram молча отбрасывает.',
          validation: { length: { min: 2, max: 64 } },
        },
      }),
      description: fields.text({ label: 'Описание', multiline: true }),
      meta: fields.text({
        label: 'Кратко',
        description: 'Строка под названием — например: до 4 гостей · 22 часа',
      }),
      pricePerNight: rubles('Цена за сутки'),
      priceNote: fields.text({
        label: 'Примечание к цене',
        description: 'Например: продление до 6 часов — 5 000 ₽',
      }),
      image: image('Фотография', 'cabins'),
    },
  });
}

function servicesCollection(locale: keyof typeof localeDirs) {
  return collection({
    label: 'Услуги (' + locale.toUpperCase() + ')',
    slugField: 'name',
    path: localeDirs[locale] + '/services/*',
    format: { data: 'json' },
    schema: {
      name: fields.slug({
        name: { label: 'Название' },
        slug: {
          label: 'Код услуги',
          description: 'furako, banya или common_house — менять не нужно',
        },
      }),
      description: fields.text({ label: 'Описание', multiline: true }),
      meta: fields.text({ label: 'Кратко' }),
      price: fields.text({
        label: 'Цена',
        description: 'Свободный текст: у бани есть продление, у общего дома — тариф от числа гостей',
      }),
      standaloneBookable: fields.checkbox({
        label: 'Можно забронировать отдельно',
        description:
          'У «Фурако» снято: чан не бронируется без домика, доступен только ' +
          'выбор времени готовности',
        defaultValue: true,
      }),
      image: image('Фотография', 'services'),
    },
  });
}

function extrasCollection(locale: keyof typeof localeDirs) {
  return collection({
    label: 'Дополнительные товары (' + locale.toUpperCase() + ')',
    slugField: 'name',
    path: localeDirs[locale] + '/extras/*',
    format: { data: 'json' },
    schema: {
      name: fields.slug({ name: { label: 'Товар' }, slug: { label: 'Код' } }),
      price: rubles('Цена'),
    },
  });
}

function pageSingleton(locale: keyof typeof localeDirs) {
  return singleton({
    label: 'Главная страница (' + locale.toUpperCase() + ')',
    path: localeDirs[locale] + '/page',
    format: { data: 'json' },
    schema: {
      wordmark: fields.text({
        label: 'Название в шапке',
        description: 'RU — «Хижина», EN — «Hizhina»',
      }),
      legalName: fields.text({ label: 'Правообладатель для копирайта' }),
      heroTitle: fields.text({ label: 'Заголовок первого экрана' }),
      heroSubtitle: fields.text({ label: 'Подзаголовок первого экрана' }),
      heroImage: image('Фон первого экрана', 'hero'),
      aboutTitle: fields.text({ label: 'Заголовок блока «О нас»' }),
      aboutBody: fields.array(fields.text({ label: 'Абзац', multiline: true }), {
        label: 'Текст блока «О нас»',
        itemLabel: (item) => item.value.slice(0, 48),
      }),
      aboutImage: image('Фотография в блоке «О нас»', 'about'),
    },
  });
}

const settings = singleton({
  label: 'Контакты и реквизиты',
  path: 'content/settings',
  format: { data: 'json' },
  schema: {
    phone: fields.text({ label: 'Телефон', description: 'Как показывать: +7 (924) 182-19-64' }),
    phoneHref: fields.text({ label: 'Телефон для ссылки', description: 'tel:+79241821964' }),
    email: fields.text({ label: 'Электронная почта' }),

    telegramBot: fields.url({ label: 'Ссылка на Telegram-бот' }),
    whatsapp: fields.url({ label: 'Ссылка на WhatsApp' }),
    vk: fields.url({ label: 'Страница ВКонтакте' }),

    address: fields.text({
      label: 'Адрес базы',
      description: 'Куда едет гость. Не путать с юридическим адресом ИП',
    }),
    latitude: fields.number({
      label: 'Широта',
      description: 'Яндекс.Карты → правой кнопкой по точке → «Что здесь?»',
    }),
    longitude: fields.number({ label: 'Долгота' }),
    directions: fields.array(fields.text({ label: 'Пункт' }), {
      label: 'Как доехать',
      description: 'Ориентиры, состояние дороги, нужен ли внедорожник зимой',
      itemLabel: (item) => item.value.slice(0, 48),
    }),

    legalName: fields.text({ label: 'Наименование ИП' }),
    inn: fields.text({ label: 'ИНН' }),
    ogrnip: fields.text({ label: 'ОГРНИП' }),
    legalAddress: fields.text({ label: 'Юридический адрес' }),
  },
});

export default config({
  // 'local' — правки идут в файлы рабочей копии, удобно на разработке.
  // Для заказчицы переключить на:
  //   { kind: 'github', repo: { owner: '...', name: 'hizhina-site' } }
  storage: { kind: 'local' },

  ui: {
    brand: { name: 'Хижина' },
    navigation: {
      'Главная страница': ['pageRu', 'pageEn'],
      Размещение: ['cabinsRu', 'cabinsEn'],
      Услуги: ['servicesRu', 'servicesEn', 'extrasRu', 'extrasEn'],
      Организация: ['settings'],
    },
  },

  singletons: {
    pageRu: pageSingleton('ru'),
    pageEn: pageSingleton('en'),
    settings,
  },

  collections: {
    cabinsRu: cabinsCollection('ru'),
    cabinsEn: cabinsCollection('en'),
    servicesRu: servicesCollection('ru'),
    servicesEn: servicesCollection('en'),
    extrasRu: extrasCollection('ru'),
    extrasEn: extrasCollection('en'),
  },
});
