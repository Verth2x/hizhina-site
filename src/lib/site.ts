/**
 * Одно место, где читается окружение. Раньше `siteUrl` объявлялся заново
 * в четырёх файлах — при расхождении canonical, sitemap и OG уехали бы
 * на разные домены, и заметили бы это только в поиске.
 */

const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

/**
 * `VERCEL_ENV` = production только на продовом деплое; на preview-ветках
 * и локально он другой. Это же значение управляет robots.txt.
 */
export const isProduction = process.env.VERCEL_ENV === 'production';

if (isProduction && !rawSiteUrl) {
  // Падаем на билде, а не молча уезжаем на localhost: без домена
  // canonical, sitemap.xml и OG-теги указывают в пустоту.
  throw new Error(
    'NEXT_PUBLIC_SITE_URL не задан на продовом окружении. ' +
      'Без него canonical, sitemap и OG-теги укажут на localhost. ' +
      'Задайте переменную в настройках проекта — см. .env.example.',
  );
}

/** Абсолютный адрес сайта без завершающего слэша. */
export const siteUrl = (rawSiteUrl ?? 'http://localhost:3000').replace(/\/+$/, '');

/** Номер счётчика Яндекс.Метрики. Пусто — счётчик не подключается вовсе. */
export const metricaId = process.env.NEXT_PUBLIC_YANDEX_METRICA_ID?.trim() || undefined;

export function absoluteUrl(path: string): string {
  return siteUrl + (path.startsWith('/') ? path : '/' + path);
}
