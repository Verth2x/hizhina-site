/**
 * Одно место, где читается окружение. Раньше `siteUrl` объявлялся заново
 * в четырёх файлах — при расхождении canonical, sitemap и OG уехали бы
 * на разные домены, и заметили бы это только в поиске.
 */

const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

/**
 * Production = `APP_ENV=production` (Docker / VDS).
 * Не `NODE_ENV`: `next build` всегда ставит production, и локальная
 * сборка без canonical тогда бы падала. Раньше опирались на `VERCEL_ENV`.
 */
export const isProduction = process.env.APP_ENV === 'production';

if (isProduction && !rawSiteUrl) {
  throw new Error(
    'NEXT_PUBLIC_SITE_URL не задан на продовом окружении. ' +
      'Без него canonical, sitemap и OG-теги укажут на localhost. ' +
      'Задайте переменную — см. .env.example.',
  );
}

/** Абсолютный адрес сайта без завершающего слэша. */
export const siteUrl = (rawSiteUrl ?? 'http://localhost:3000').replace(/\/+$/, '');

/** Номер счётчика Яндекс.Метрики. Пусто — счётчик не подключается вовсе. */
export const metricaId = process.env.NEXT_PUBLIC_YANDEX_METRICA_ID?.trim() || undefined;

export function absoluteUrl(path: string): string {
  return siteUrl + (path.startsWith('/') ? path : '/' + path);
}
