import { cache } from 'react';
import type { Locale } from '@/i18n/config';
import { readSiteContent } from './site-content';
import type { SiteContent } from './types';
import { fetchSiteContentFromDirectus, isDirectusConfigured } from './directus/fetch-content';

/**
 * За один рендер контент запрашивают трижды: `[locale]/layout.tsx`,
 * `generateMetadata` и `[locale]/page.tsx`. `React.cache()` дедуплицирует
 * вызовы в пределах одного рендера.
 *
 * Источник: Directus, если заданы DIRECTUS_URL + DIRECTUS_TOKEN.
 * Fallback на TypeScript-модуль — только при CONTENT_FALLBACK=static
 * (удобно локально без поднятого CMS). На билде без fallback ошибка
 * Directus валит сборку явно.
 */
export const getSiteContent = cache(async (locale: Locale): Promise<SiteContent> => {
  const allowFallback = process.env.CONTENT_FALLBACK === 'static';

  if (!isDirectusConfigured()) {
    // Локальный build/dev без CMS. На VDS (APP_ENV=production) без токена —
    // только явный CONTENT_FALLBACK=static (так собирается Docker-образ).
    if (allowFallback || process.env.APP_ENV !== 'production') {
      return readSiteContent(locale);
    }
    throw new Error(
      'Directus не настроен: задайте DIRECTUS_URL и DIRECTUS_TOKEN ' +
        '(или CONTENT_FALLBACK=static для локальной разработки).',
    );
  }

  try {
    return await fetchSiteContentFromDirectus(locale);
  } catch (err) {
    if (allowFallback) {
      console.warn('[content] Directus недоступен, fallback на site-content.ts:', err);
      return readSiteContent(locale);
    }
    throw err;
  }
});

export type { SiteContent } from './types';
