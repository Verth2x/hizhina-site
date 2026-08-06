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

const fileFields = '*,hero_image.id,hero_image.title,hero_image.description,hero_video_poster.id,hero_video_poster.title,hero_video_poster.description,about_image.id,about_image.title,about_image.description';

export function isDirectusConfigured(): boolean {
  return Boolean(getDirectusUrl() && getDirectusToken());
}

export async function fetchSiteContentFromDirectus(locale: Locale): Promise<SiteContent> {
  const [settings, pages, cabins, services, extras] = await Promise.all([
    directusGetItem<DirectusSettings>('settings'),
    directusGetItems<DirectusPage>(
      'pages',
      `filter[locale][_eq]=${locale}&filter[status][_eq]=published&fields=${encodeURIComponent(fileFields)}&limit=1`,
    ),
    directusGetItems<DirectusCabin>(
      'cabins',
      `filter[locale][_eq]=${locale}&filter[status][_eq]=published&sort=sort&fields=*,image.id,image.title,image.description`,
    ),
    directusGetItems<DirectusService>(
      'services',
      `filter[locale][_eq]=${locale}&filter[status][_eq]=published&sort=sort&fields=*,image.id,image.title,image.description`,
    ),
    directusGetItems<DirectusExtra>(
      'extras',
      `filter[locale][_eq]=${locale}&filter[status][_eq]=published&sort=sort`,
    ),
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
