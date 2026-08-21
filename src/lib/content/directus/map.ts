import type { Locale } from '@/i18n/config';
import { safeMediaUrl, safeUrl, TEL_SCHEMES } from '@/lib/utils/safe-url';
import type {
  Cabin,
  Extra,
  HeroVideo,
  MediaSource,
  Service,
  ServiceKey,
  SiteContent,
  SiteSettings,
} from '../types';

export type DirectusFile = {
  id: string;
  title?: string | null;
  description?: string | null;
};

export type DirectusSettings = {
  legal_name: string;
  inn: string;
  ogrnip: string;
  legal_address: string;
  phone: string;
  phone_href: string;
  email: string;
  telegram_bot: string;
  whatsapp: string;
  vk: string;
  address: string;
  lat?: number | null;
  lng?: number | null;
  directions?: string[] | null;
};

export type DirectusPage = {
  locale: Locale;
  status: string;
  wordmark: string;
  legal_name: string;
  hero_title: string;
  hero_subtitle: string;
  hero_image?: DirectusFile | string | null;
  hero_video_mp4?: string | null;
  hero_video_webm?: string | null;
  hero_video_poster?: DirectusFile | string | null;
  about_title: string;
  about_body: string[];
  about_image?: DirectusFile | string | null;
};

export type DirectusCabin = {
  locale: Locale;
  status: string;
  slug: string;
  name: string;
  description: string;
  meta: string;
  coming_soon?: boolean | null;
  price_per_night: number;
  price_note?: string | null;
  price_unit?: string | null;
  image?: DirectusFile | string | null;
  gallery?: Array<DirectusFile | string | { directus_files_id: DirectusFile | string }> | null;
  features?: string[] | null;
  rules?: string[] | null;
};

export type DirectusService = {
  gallery?: Array<DirectusFile | string | { directus_files_id: DirectusFile | string }> | null;
  locale: Locale;
  status: string;
  key: ServiceKey;
  name: string;
  description: string;
  meta: string;
  price: string;
  standalone_bookable: boolean;
  image?: DirectusFile | string | null;
};

export type DirectusExtra = {
  locale: Locale;
  status: string;
  slug: string;
  name: string;
  price: number;
};

function resolveAssetBaseUrl(): string {
  // Публичный URL ассетов для браузера — через IMAGE_HOST или PUBLIC Directus URL.
  const host = process.env.NEXT_PUBLIC_IMAGE_HOST?.trim();
  if (host) {
    const protocol = host.startsWith('localhost') || host.startsWith('127.') || /^[0-9.]+(:|$)/.test(host) ? 'http' : 'https';
    return `${protocol}://${host}`;
  }
  return (process.env.DIRECTUS_PUBLIC_URL || process.env.DIRECTUS_URL || 'http://localhost:8055').replace(
    /\/+$/,
    '',
  );
}

/**
 * Считается один раз на модуль, а не на каждую картинку: `mapMedia` вызывается
 * на каждый кадр каждой галереи, и разбирать одни и те же переменные окружения
 * заново незачем — в пределах процесса они не меняются.
 */
const ASSET_BASE_URL = resolveAssetBaseUrl();

export function mapMedia(
  file: DirectusFile | string | null | undefined,
  fallbackAlt?: string,
): MediaSource | undefined {
  if (!file) return undefined;
  const id = typeof file === 'string' ? file : file.id;
  if (!id) return undefined;
  const alt =
    typeof file === 'string'
      ? fallbackAlt
      : file.description || file.title || fallbackAlt || undefined;
  return { src: `${ASSET_BASE_URL}/assets/${id}`, alt };
}

function mapSettings(row: DirectusSettings): SiteSettings {
  const settings: SiteSettings = {
    legalName: row.legal_name,
    inn: row.inn,
    ogrnip: row.ogrnip,
    legalAddress: row.legal_address,
    phone: row.phone,
    // Всё, что уходит в href, проходит белый список схем: значения задаёт
    // редактор в CMS, а React пропустил бы `javascript:` прямо в разметку.
    phoneHref: safeUrl(row.phone_href, TEL_SCHEMES),
    email: row.email,
    telegramBot: safeUrl(row.telegram_bot),
    whatsapp: safeUrl(row.whatsapp),
    vk: safeUrl(row.vk),
    address: row.address,
    directions: row.directions ?? [],
  };
  if (row.lat != null && row.lng != null) {
    settings.coordinates = { lat: row.lat, lng: row.lng };
  }
  return settings;
}

function mapCabin(row: DirectusCabin): Cabin {
  // M2M отдаёт строки junction-таблицы: сам файл лежит внутри
  // directus_files_id. Разворачиваем, сохраняя совместимость со старой
  // плоской формой — на случай отката схемы.
  const gallery = ((row.gallery ?? []) as Array<unknown>)
    .map((entry) => {
      const unwrapped =
        entry && typeof entry === 'object' && 'directus_files_id' in entry
          ? (entry as { directus_files_id: unknown }).directus_files_id
          : entry;
      return mapMedia(unwrapped as never, row.name);
    })
    .filter((m): m is MediaSource => !!m);

  return {
    id: row.slug,
    name: row.name,
    comingSoon: Boolean(row.coming_soon),
    description: row.description,
    meta: row.meta,
    pricePerNight: row.price_per_night,
    priceNote: row.price_note ?? undefined,
    priceUnit: row.price_unit ?? undefined,
    image: mapMedia(row.image, row.name),
    gallery: gallery.length ? gallery : undefined,
    features: row.features ?? undefined,
    rules: row.rules ?? undefined,
  };
}

function mapService(row: DirectusService): Service {
  // Та же развёртка M2M, что у домиков: файл лежит внутри directus_files_id.
  const gallery = ((row.gallery ?? []) as Array<unknown>)
    .map((entry) => {
      const unwrapped =
        entry && typeof entry === 'object' && 'directus_files_id' in entry
          ? (entry as { directus_files_id: unknown }).directus_files_id
          : entry;
      return mapMedia(unwrapped as never, row.name);
    })
    .filter((m): m is MediaSource => !!m);

  return {
    gallery: gallery.length ? gallery : undefined,
    key: row.key,
    name: row.name,
    description: row.description,
    meta: row.meta,
    price: row.price,
    standaloneBookable: row.standalone_bookable,
    image: mapMedia(row.image, row.name),
  };
}

function mapExtra(row: DirectusExtra): Extra {
  return { id: row.slug, name: row.name, price: row.price };
}

function mapHeroVideo(page: DirectusPage): HeroVideo | undefined {
  // Адреса видео тоже из CMS и тоже уходят в атрибут (`<source src>`),
  // поэтому проходят ту же проверку схемы. Без mp4 видео не существует —
  // остаётся постер, ради которого он и обязателен (см. types.ts).
  const mp4 = safeMediaUrl(page.hero_video_mp4);
  if (!mp4) return undefined;
  const poster = mapMedia(page.hero_video_poster, page.hero_title);
  if (!poster) return undefined;
  return {
    mp4,
    webm: safeMediaUrl(page.hero_video_webm),
    poster,
  };
}

export function mapSiteContent(input: {
  settings: DirectusSettings;
  page: DirectusPage;
  cabins: DirectusCabin[];
  services: DirectusService[];
  extras: DirectusExtra[];
}): SiteContent {
  const { settings, page, cabins, services, extras } = input;
  return {
    brand: { wordmark: page.wordmark, legalName: page.legal_name },
    hero: {
      title: page.hero_title,
      subtitle: page.hero_subtitle,
      image: mapMedia(page.hero_image, page.hero_title),
      video: mapHeroVideo(page),
    },
    about: {
      title: page.about_title,
      body: Array.isArray(page.about_body) ? page.about_body : [],
      image: mapMedia(page.about_image, page.about_title),
    },
    cabins: cabins.map(mapCabin),
    services: services.map(mapService),
    extras: extras.map(mapExtra),
    settings: mapSettings(settings),
  };
}
