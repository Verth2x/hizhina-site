import type { NextConfig } from "next";

/** HSTS и upgrade-insecure-requests — только когда явно прод (VDS). */
const isProd = process.env.APP_ENV === "production";

/**
 * Режим разработки. Именно NODE_ENV, а не APP_ENV: `next dev` ставит
 * "development", `next build` — "production", независимо от того, куда
 * собирают. Послабления в CSP должны идти ровно по этой границе.
 */
const isDev = process.env.NODE_ENV === "development";
const usesHttps =
  process.env.NEXT_PUBLIC_SITE_URL?.trim().startsWith("https://") ?? false;

/**
 * Домен, откуда приходят фотографии (Directus assets).
 * Пустая переменная — картинки только локальные в /public.
 */
const imageHost = process.env.NEXT_PUBLIC_IMAGE_HOST?.trim();
const configuredImageProtocol = process.env.NEXT_PUBLIC_IMAGE_PROTOCOL?.trim();

function imageHostPatterns(): {
  protocol: "http" | "https";
  hostname: string;
  port?: string;
}[] {
  if (!imageHost) return [];
  const [hostname, port] = imageHost.split(":");
  const isLocal = hostname === "localhost" || hostname === "127.0.0.1";
  const protocol =
    configuredImageProtocol === "http" || configuredImageProtocol === "https"
      ? configuredImageProtocol
      : isLocal
        ? "http"
        : "https";
  const pattern: {
    protocol: "http" | "https";
    hostname: string;
    port?: string;
  } = {
    protocol,
    hostname,
  };
  if (port) pattern.port = port;
  return [pattern];
}

/**
 * Content-Security-Policy.
 *
 * `'unsafe-inline'` в script-src оставлен сознательно: строгий CSP на nonce
 * требует ответ на лету, а страницы отдаются из кеша / SSG.
 */
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  // 'unsafe-eval' только в dev и никогда в сборке: React в режиме разработки
  // использует eval() для карт кода и восстановления стеков. Без него
  // гидратация молча не происходит — страница отдаётся, выглядит целой, но
  // ни один клиентский компонент не оживает. Отлаживать это тяжело, потому
  // что в консоли лежит лишь предупреждение React, а не ошибка приложения.
  "script-src 'self' 'unsafe-inline' https://mc.yandex.ru https://yastatic.net" +
    (isDev ? " 'unsafe-eval'" : ""),
  "style-src 'self' 'unsafe-inline'",
  // blob: убран из img-src и media-src: в src/ нет ни одного createObjectURL,
  // то есть схема ничего не разрешала по делу, зато оставалась удобным
  // каналом выноса содержимого при XSS.
  "img-src 'self' data: https://mc.yandex.ru" +
    (imageHost ? ` http://${imageHost} https://${imageHost}` : ""),
  "media-src 'self'" +
    (imageHost ? ` http://${imageHost} https://${imageHost}` : ""),
  "font-src 'self' data:",
  "connect-src 'self' https://mc.yandex.ru https://mc.yandex.com",
  "frame-src https://mc.yandex.ru https://makemap.2gis.ru",
  // Явный запрет вместо молчаливого отката на default-src.
  // child-src здесь сознательно нет: он был бы фолбэком для frame-src,
  // который уже задан выше, и в браузере без поддержки frame-src запретил бы
  // виджет 2ГИС. Пользы ноль, риск ненулевой.
  "worker-src 'none'",
  "manifest-src 'self'",
  ...(usesHttps ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  { key: "Content-Security-Policy", value: csp },
];

if (isProd && usesHttps) {
  securityHeaders.push({
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  });
}

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,

  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: imageHostPatterns(),
    /**
     * 30 дней вместо дефолтной минуты.
     *
     * Ассеты Directus адресуются неизменяемым UUID: заменённое в CMS фото
     * получает новый id, то есть новый URL. Инвалидировать по времени нечего,
     * а дефолт заставлял сервер заново кодировать в AVIF/WebP одни и те же
     * файлы каждую минуту — самая дорогая операция на этом сайте.
     */
    minimumCacheTTL: 2592000,
  },

  async redirects() {
    return [
      { source: "/", destination: "/ru", permanent: false },
      { source: "/privacy", destination: "/ru/privacy", permanent: false },
    ];
  },

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
