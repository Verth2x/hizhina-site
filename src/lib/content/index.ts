import { cache } from 'react';
import type { Locale } from '@/i18n/config';
import { readSiteContent } from './site-content';
import type { SiteContent } from './types';

/**
 * За один рендер контент запрашивают трижды: `[locale]/layout.tsx`,
 * `generateMetadata` и `[locale]/page.tsx`. Пока источник — модуль в репозитории,
 * это бесплатно; с любым внешним источником стало бы тремя сетевыми запросами.
 *
 * `React.cache()` дедуплицирует вызовы в пределах одного рендера, поэтому
 * обёртку ставим заранее — переезд на CMS не потребует править вызывающий код.
 */
export const getSiteContent = cache(async (locale: Locale): Promise<SiteContent> => {
  return readSiteContent(locale);
});

export type { SiteContent } from './types';
