/**
 * Источник изображения. `src` может быть как локальным путём (`/images/…`),
 * так и абсолютным URL — во втором случае домен должен быть перечислен
 * в `images.remotePatterns` в `next.config.ts`.
 */
export type MediaSource = {
  src: string;
  /** Альтернативный текст. Если не задан, берётся название объекта. */
  alt?: string;
  /** base64-заглушка для `placeholder="blur"`. */
  blurDataURL?: string;
};

export type Cabin = {
  id: string;
  name: string;
  description: string;
  meta: string;
  pricePerNight: number;
  priceNote?: string;
  image?: MediaSource;
};

export type ServiceKey = 'furako' | 'banya' | 'common_house';

export type Service = {
  key: ServiceKey;
  name: string;
  description: string;
  meta: string;
  price: string;
  standaloneBookable: boolean;
  image?: MediaSource;
};

export type Extra = { id: string; name: string; price: number };

/** Географические координаты объекта — из них строится ссылка на карту. */
export type GeoPoint = { lat: number; lng: number };

export type SiteSettings = {
  /** Как подписывать правообладателя: «ИП Филимонова Т. А.» */
  legalName: string;
  /** Реквизиты для футера — снимают вопрос «кто исполнитель услуги». */
  inn: string;
  ogrnip: string;
  /** Юридический адрес из ЕГРИП. Не то же самое, что адрес базы. */
  legalAddress: string;

  phone: string;
  phoneHref: string;
  email: string;

  telegramBot: string;
  whatsapp: string;
  vk: string;

  /** Фактический адрес базы отдыха — то, что гость вбивает в навигатор. */
  address: string;
  /** Координаты базы. Если заданы, ссылка на карту строится по ним. */
  coordinates?: GeoPoint;
  /** Ориентиры и состояние дороги — для загородного объекта важнее адреса. */
  directions?: string[];
};

export type SiteContent = {
  brand: { wordmark: string; legalName: string };
  hero: { title: string; subtitle: string; image?: MediaSource };
  about: { title: string; body: string[]; image?: MediaSource };
  cabins: Cabin[];
  services: Service[];
  extras: Extra[];
  settings: SiteSettings;
};

/**
 * Тема обращения, передаваемая в попап бронирования.
 *
 * `code` уходит в Telegram deep link (`?start=`), поэтому обязан состоять
 * только из [A-Za-z0-9_-] и быть не длиннее 64 символов — иначе Telegram
 * молча отбрасывает payload и бот не узнаёт, чем интересовался человек.
 * `label` — человекочитаемая подпись для интерфейса.
 */
export type BookingSubject = { code: string; label: string };
