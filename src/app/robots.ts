import type { MetadataRoute } from 'next';
import { isProduction, siteUrl } from '@/lib/site';

/**
 * Превью-деплои Vercel имеют собственные публичные адреса. Без этой проверки
 * поисковики индексировали бы десяток копий сайта на *.vercel.app и решали
 * сами, какая из них каноническая.
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
