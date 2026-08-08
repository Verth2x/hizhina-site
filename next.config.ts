import type { NextConfig } from "next";

/** HSTS и upgrade-insecure-requests — только когда явно прод (VDS). */
const isProd = process.env.APP_ENV === "production";

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
  "script-src 'self' 'unsafe-inline' https://mc.yandex.ru https://yastatic.net https://va.vercel-scripts.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://mc.yandex.ru" +
    (imageHost ? ` http://${imageHost} https://${imageHost}` : ""),
  "media-src 'self' blob:" +
    (imageHost ? ` http://${imageHost} https://${imageHost}` : ""),
  "font-src 'self' data:",
  "connect-src 'self' https://mc.yandex.ru https://mc.yandex.com https://va.vercel-scripts.com",
  "frame-src https://mc.yandex.ru",
  "manifest-src 'self'",
  ...(isProd ? ["upgrade-insecure-requests"] : []),
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

if (isProd) {
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
