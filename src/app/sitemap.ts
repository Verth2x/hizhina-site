import type { MetadataRoute } from 'next';
import { locales } from '@/i18n/config';
import { PRIVACY_UPDATED_AT } from '@/lib/legal/privacy';
import { absoluteUrl } from '@/lib/site';

/** Языковые версии одной страницы связываем через alternates — иначе поиск
 *  считает /ru и /en разными документами, а не переводами. */
function alternates(path: string) {
  return {
    languages: Object.fromEntries(
      locales.map((locale) => [locale, absoluteUrl('/' + locale + path)]),
    ),
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const home = locales.map((locale) => ({
    url: absoluteUrl('/' + locale),
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: locale === 'ru' ? 1 : 0.8,
    alternates: alternates(''),
  }));

  const privacy = locales.map((locale) => ({
    url: absoluteUrl('/' + locale + '/privacy'),
    lastModified: new Date(PRIVACY_UPDATED_AT),
    changeFrequency: 'yearly' as const,
    priority: 0.2,
    alternates: alternates('/privacy'),
  }));

  return [...home, ...privacy];
}
