import type { Locale } from '@/i18n/config';
import type { SiteContent, SiteSettings } from './types';

/* ---------------------------------------------------------------------------
   Seed / fallback-контент. Источник правды в рантайме — Directus
   (см. getSiteContent и scripts/seed-directus.mjs).

   Что здесь ещё ждёт заказчицу (см. content/TODO-CONTENT.md):
     • coordinates      — точка базы, без неё карта ведёт на поиск по адресу
     • address          — фактический адрес базы, а не юридический адрес ИП
     • directions       — ориентиры и состояние дороги
     • image у объектов — пока не заданы, Media рисует штриховку
     • hero.video       — фоновое видео первого экрана, требования
                          в content/TODO-CONTENT.md
     • cabins[].gallery — фотографии домика; полоса миниатюр появляется
                          сама, начиная с двух кадров
--------------------------------------------------------------------------- */

const settings: SiteSettings = {
  legalName: 'ИП Филимонова Т. А.',
  inn: '651200771931',
  ogrnip: '324650000004441',
  legalAddress: '693005, Сахалинская область, г. Южно-Сахалинск, пер. Дачный, д. 8',

  phone: '+7 (924) 182-19-64',
  phoneHref: 'tel:+79241821964',
  email: 'tanjafil@list.ru',

  telegramBot: 'https://t.me/Hizhina_booking_bot',
  whatsapp: 'https://wa.me/79241821964',
  vk: 'https://vk.com/hizhina',

  // TODO(заказчик): фактический адрес базы. Сейчас стоит юридический адрес ИП —
  // это не то место, куда едет гость. До уточнения ссылка на карту работает
  // как поиск по строке, а не как точка.
  address: '693005, Сахалинская область, г. Южно-Сахалинск, пер. Дачный, д. 8',

  // TODO(заказчик): координаты базы. Как только появятся, карта откроется
  // ровно на объекте — см. buildMapsUrl() в src/lib/utils/maps.ts.
  // coordinates: { lat: 46.9591, lng: 142.7380 },

  // TODO(заказчик): ориентиры, состояние дороги, нужен ли внедорожник зимой.
  directions: [],
};

/*
 * TODO(заказчик): фоновое видео первого экрана. Пока не задано — показывается
 * постер, а без постера штриховка. Подключается добавлением в hero:
 *
 *   video: {
 *     mp4: '/video/hero.mp4',
 *     webm: '/video/hero.webm',
 *     poster: { src: '/video/hero-poster.jpg', alt: 'Домики на краю леса' },
 *   },
 *
 * Требования к файлу — в content/TODO-CONTENT.md.
 */

const ru: SiteContent = {
  brand: { wordmark: 'Хижина', legalName: settings.legalName },
  hero: { title: 'База отдыха «Хижина»', subtitle: 'Отдых на природе с комфортом' },
  about: {
    title: 'Место, где выдыхают',
    body: [
      'Тишина, лес, баня на дровах. Идеальное место для перезагрузки.',
      'Мы построили «Хижину» для тех, кому нужен не отель, а пауза: несколько домиков на краю леса, чан с горячей водой под открытым небом и никакой спешки.',
    ],
  },
  cabins: [
    {
      id: 'cabin-a',
      name: 'Домик',
      description:
        'Тёплый дом с большим окном в лес: двуспальная кровать, раскладной диван, обеденный стол и терраса. Постель, полотенца и свет — всё уже внутри, привозить ничего не нужно.',
      meta: 'до 4 гостей · 22 часа · заезд с 14:00',
      pricePerNight: 15000,
      priceUnit: 'за дом, 22 часа, до 4 гостей',
      priceNote: 'Продление до 6 часов — 5 000 ₽',
      features: [
        'Двуспальная кровать',
        'Раскладной диван на двоих',
        'Постельные принадлежности',
        'Отопление',
        'Освещение и розетки',
        'Стол и терраса',
      ],
      rules: [
        'Заезд с 14:00, проживание 22 часа',
        'Продление до 6 часов — 5 000 ₽',
        'Максимум 4 гостя',
        'Фурако и баня бронируются отдельно',
      ],
    },
  ],
  services: [
    {
      key: 'furako',
      name: 'Японская баня «Фурако»',
      description:
        'Горячий чан под открытым небом. Предоставляем халаты, тапочки, полотенца и шапки.',
      meta: 'нагрев до 40 °C · до 4 гостей',
      price: '7 000 ₽',
      standaloneBookable: false,
    },
    {
      key: 'banya',
      name: 'Русская баня на дровах',
      description:
        'Парная с настоящим жаром. Простыни, полотенца, тапочки, шапки, чай и снэки включены.',
      meta: 'до 6 гостей · 2 часа',
      price: '5 000 ₽ · продление 1 000 ₽/час',
      standaloneBookable: true,
    },
    {
      key: 'common_house',
      name: 'Общий дом с детской комнатой',
      description: 'Камин, кухонное оборудование, зона отдыха и отдельная детская с игрушками.',
      meta: 'до 25 гостей · 14:00–24:00',
      price: 'до 15 чел. — 15 000 ₽ · от 16 до 25 — 1 000 ₽/чел.',
      standaloneBookable: true,
    },
  ],
  extras: [
    { id: 'coal', name: 'Уголь древесный, 3 кг', price: 500 },
    { id: 'firestarter', name: 'Средство для розжига', price: 300 },
    { id: 'broom', name: 'Веник дубовый или берёзовый', price: 500 },
  ],
  settings,
};

const en: SiteContent = {
  // Название базы транслитерируем: гость из-за рубежа должен уметь его
  // произнести и найти. Кириллический логотип на EN-версии читался как
  // недоделка — теперь это решение, а не пропуск.
  brand: { wordmark: 'Hizhina', legalName: 'Tatiana Filimonova, sole proprietor' },
  hero: { title: 'Hizhina Retreat', subtitle: 'Nature, comfortably' },
  about: {
    title: 'A place to exhale',
    body: [
      'Silence, forest, a wood-fired banya. A perfect place to reset.',
      'We built Hizhina for people who need a pause rather than a hotel: a few cabins at the forest edge, a hot tub under open sky, and no rush at all.',
    ],
  },
  cabins: [
    {
      id: 'cabin-a',
      name: 'The cabin',
      description:
        'A warm cabin with a wide window into the forest: a double bed, a sofa bed, a dining table and a terrace. Linen, towels and lighting are already inside — bring nothing.',
      meta: 'up to 4 guests · 22 hours · check-in from 2 pm',
      pricePerNight: 15000,
      priceUnit: 'per cabin, 22 hours, up to 4 guests',
      priceNote: 'Extension up to 6 hours — 5,000 ₽',
      features: [
        'Double bed',
        'Sofa bed for two',
        'Bed linen and towels',
        'Heating',
        'Lighting and power sockets',
        'Dining table and terrace',
      ],
      rules: [
        'Check-in from 2 pm, 22-hour stay',
        'Extension up to 6 hours — 5,000 ₽',
        'Maximum 4 guests',
        'Furako and banya are booked separately',
      ],
    },
  ],
  services: [
    {
      key: 'furako',
      name: 'Furako hot tub',
      description: 'An open-air hot tub. Robes, slippers, towels and hats are provided.',
      meta: 'heated to 40 °C · up to 4 guests',
      price: '7,000 RUB',
      standaloneBookable: false,
    },
    {
      key: 'banya',
      name: 'Wood-fired Russian banya',
      description: 'A real steam room. Sheets, towels, slippers, hats, tea and snacks included.',
      meta: 'up to 6 guests · 2 hours',
      price: '5,000 RUB · extension 1,000 RUB/hour',
      standaloneBookable: true,
    },
    {
      key: 'common_house',
      name: 'Common house with a kids room',
      description: 'Fireplace, kitchen equipment, lounge area and a separate room for children.',
      meta: 'up to 25 guests · 14:00–24:00',
      price: 'up to 15 guests — 15,000 RUB · 16 to 25 — 1,000 RUB per guest',
      standaloneBookable: true,
    },
  ],
  extras: [
    { id: 'coal', name: 'Charcoal, 3 kg', price: 500 },
    { id: 'firestarter', name: 'Fire starter', price: 300 },
    { id: 'broom', name: 'Oak or birch broom', price: 500 },
  ],
  settings: {
    ...settings,
    address: 'Yuzhno-Sakhalinsk, Sakhalin Region, Russia',
  },
};

export function readSiteContent(locale: Locale): SiteContent {
  return locale === 'en' ? en : ru;
}
