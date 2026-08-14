import type { Locale } from '@/i18n/config';
import type { SiteContent } from '../types';
import {
  directusGetItem,
  directusGetItems,
  getDirectusToken,
  getDirectusUrl,
} from './client';
import {
  mapSiteContent,
  type DirectusCabin,
  type DirectusExtra,
  type DirectusPage,
  type DirectusService,
  type DirectusSettings,
} from './map';

/**
 * Раскрытие связанного файла: сам id плюс подписи, из которых берётся alt.
 *
 * Перечислять поля коллекций поимённо вместо `*` заманчиво, но неприменимо:
 * фактическая схема в Directus разошлась с scripts/bootstrap-directus.mjs
 * (галерея переехала на M2M, у services появился gallery), а Directus отвечает
 * ошибкой на весь запрос, если в fields попало несуществующее поле. `*` здесь —
 * не небрежность, а устойчивость к дрейфу схемы.
 */
const fileSubfields = (field: string) => `${field}.id,${field}.title,${field}.description`;

/** Файловые поля страницы: обложка героя, постер видео, картинка «о нас». */
const pageFields = [
  '*',
  fileSubfields('hero_image'),
  fileSubfields('hero_video_poster'),
  fileSubfields('about_image'),
].join(',');

/** Одиночная картинка плюс галерея через junction-таблицу — общее у домиков и услуг. */
const withGalleryFields = [
  '*',
  fileSubfields('image'),
  fileSubfields('gallery.directus_files_id'),
].join(',');

export function isDirectusConfigured(): boolean {
  return Boolean(getDirectusUrl() && getDirectusToken());
}

export async function fetchSiteContentFromDirectus(locale: Locale): Promise<SiteContent> {
  const published = `filter[locale][_eq]=${locale}&filter[status][_eq]=published`;

  const [settings, pages, cabins, services, extras] = await Promise.all([
    directusGetItem<DirectusSettings>('settings'),
    directusGetItems<DirectusPage>(
      'pages',
      `${published}&fields=${encodeURIComponent(pageFields)}&limit=1`,
    ),
    directusGetItems<DirectusCabin>(
      'cabins',
      `${published}&sort=sort&fields=${encodeURIComponent(withGalleryFields)}`,
    ),
    directusGetItems<DirectusService>(
      'services',
      `${published}&sort=sort&fields=${encodeURIComponent(withGalleryFields)}`,
    ),
    directusGetItems<DirectusExtra>('extras', `${published}&sort=sort`),
  ]);

  const page = pages[0];
  if (!page) {
    throw new Error(`Directus: нет опубликованной pages для locale=${locale}`);
  }
  if (!settings) {
    throw new Error('Directus: singleton settings пуст');
  }

  return mapSiteContent({ settings, page, cabins, services, extras });
}
