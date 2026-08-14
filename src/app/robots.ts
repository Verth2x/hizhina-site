import type { MetadataRoute } from 'next';
import { isProduction, siteUrl } from '@/lib/site';

/**
 * Непродовые окружения (локалка, стейджинг) не должны попадать в индекс —
 * иначе поисковики решают сами, какая копия сайта каноническая.
 */
export default function robots(): MetadataRoute.Robots {
  if (!isProduction) {
    return { rules: { userAgent: '*', disallow: '/' } };
  }

  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: siteUrl + '/sitemap.xml',
    host: siteUrl,
  };
}
