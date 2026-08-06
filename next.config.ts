import type { NextConfig } from 'next';

const isProd = process.env.VERCEL_ENV === 'production';

/**
 * Домен, откуда приходят фотографии, если их решат хранить не в репозитории
 * (например, в облаке хостера). Пустая переменная — значит картинки лежат
 * локально в /public и разрешать ничего не нужно.
 */
const imageHost = process.env.NEXT_PUBLIC_IMAGE_HOST?.trim();

/**
 * Content-Security-Policy.
 *
 * Честная оговорка: `'unsafe-inline'` в script-src оставлен сознательно.
 * Строгий CSP на nonce требует, чтобы каждый ответ формировался на лету,
 * а сайт статический — весь смысл в том, чтобы отдавать готовый HTML с CDN.
 * Заменив это на nonce, мы вернули бы вызов посредника на каждый запрос —
 * ровно тот, от которого избавились ниже.
 *
 * Что политика всё равно даёт: запрещает подгрузку скриптов и фреймов
 * с посторонних доменов, запрещает встраивание сайта в чужой iframe и
 * ограничивает, куда браузер вправе отправлять данные. Инлайновые скрипты
 * на странице — только наши: JSON-LD и бутстрап Next.
 */
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  // mc.yandex.ru — счётчик Метрики, включая вебвизор.
  "script-src 'self' 'unsafe-inline' https://mc.yandex.ru https://yastatic.net https://va.vercel-scripts.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://mc.yandex.ru" + (imageHost ? ' https://' + imageHost : ''),
  "font-src 'self' data:",
  "connect-src 'self' https://mc.yandex.ru https://mc.yandex.com https://va.vercel-scripts.com",
  'frame-src https://mc.yandex.ru',
  "manifest-src 'self'",
  'upgrade-insecure-requests',
].join('; ');

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  {
    // Сайту не нужны ни камера, ни микрофон, ни геолокация: маршрут строит
    // Яндекс.Карты у себя. Явный отказ снимает вопросы у сканеров.
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  { key: 'Content-Security-Policy', value: csp },
];

if (isProd) {
  // HSTS включаем только на проде: на localhost он заставил бы браузер
  // навсегда запомнить https для 127.0.0.1 и сломал бы разработку.
  securityHeaders.push({
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  });
}

const nextConfig: NextConfig = {
  poweredByHeader: false,

  images: {
    formats: ['image/avif', 'image/webp'],
    ...(imageHost ? { remotePatterns: [{ protocol: 'https' as const, hostname: imageHost }] } : {}),
  },

  /**
   * Раньше корень уводил на локаль через middleware. Сайт статический:
   * тратить вызов функции на каждый запрос к `/` не за что. Редирект
   * в конфиге разрешается на уровне маршрутизации, до файловой системы,
   * и не стоит ничего.
   *
   * `permanent: false` (307), а не 308: постоянный редирект браузеры кэшируют
   * бессрочно, и если однажды появится выбор локали по языку браузера,
   * старые клиенты продолжат уходить на /ru.
   */
  async redirects() {
    return [
      { source: '/', destination: '/ru', permanent: false },
      { source: '/privacy', destination: '/ru/privacy', permanent: false },
    ];
  },

  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
