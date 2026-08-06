import localFont from 'next/font/local';

/**
 * Шрифты подключены локально, а не через `next/font/google`.
 *
 * Причина не эстетическая: `next/font/google` ходит в fonts.googleapis.com
 * на каждом билде. Если CDN недоступен — из-за сети, блокировки или сбоя —
 * билд падает целиком, включая хотфикс в пятницу вечером. Файлы в репозитории
 * убирают эту зависимость: сборка воспроизводима и работает офлайн.
 *
 * На отдачу это не влияет: `next/font/google` тоже самостоятельно хостит
 * шрифты со своего домена, так что рантайм не меняется. Зато `font-src 'self'`
 * в CSP остаётся строгим, без исключений под сторонний домен.
 *
 * Оба файла — вариативные (одна ось `wght`), сабсеттнутые до latin + cyrillic
 * и сжатые в woff2: 39 КБ и 47 КБ на весь диапазон начертаний. Перечисление
 * `weight: ['300','400','500','600','700']`, которое стояло раньше, тянуло
 * по статическому файлу на каждое начертание и на каждое подмножество.
 *
 * Обновлять руками, из репозитория github.com/google/fonts (лицензия OFL,
 * копия — в src/assets/fonts/OFL.txt).
 */

export const display = localFont({
  src: [{ path: '../assets/fonts/Comfortaa-Variable.woff2', weight: '300 700', style: 'normal' }],
  display: 'swap',
  variable: '--font-display-loaded',
  fallback: ['Verdana', 'system-ui', 'sans-serif'],
  // Подгоняет метрики запасного шрифта под основной, чтобы подмена
  // при загрузке не двигала вёрстку (CLS).
  adjustFontFallback: 'Arial',
  preload: true,
});

export const sans = localFont({
  src: [{ path: '../assets/fonts/Nunito-Variable.woff2', weight: '200 1000', style: 'normal' }],
  display: 'swap',
  variable: '--font-sans-loaded',
  fallback: ['system-ui', 'sans-serif'],
  adjustFontFallback: 'Arial',
  preload: true,
});
