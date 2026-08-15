/**
 * Проверка внешних адресов, приходящих из CMS.
 *
 * Контактные ссылки и адреса видео задаёт редактор в Directus, а попадают они
 * прямо в `href`/`src`. React не блокирует `javascript:` — он только пишет
 * предупреждение в консоль и всё равно рендерит атрибут. Вместе с
 * `script-src 'unsafe-inline'` в CSP (осознанный размен ради статики,
 * см. next.config.ts) это означает, что доступ к CMS превращается
 * в исполнение произвольного кода у каждого гостя.
 *
 * Отсюда белый список схем на входе — в маппинге Directus, а не по семи
 * местам подстановки.
 */

/**
 * Схемы для внешних ссылок: мессенджеры, соцсети, файлы видео.
 *
 * `http:` здесь наравне с `https:` намеренно. Смысл списка — отсечь схемы,
 * исполняющие код (`javascript:`, `data:`, `vbscript:`), а не следить за
 * транспортом: за него отвечают `upgrade-insecure-requests` в CSP и HSTS,
 * которые сами поднимают такой запрос до TLS.
 *
 * Изначально здесь стоял только `https:`, и это молча выбрасывало рабочий
 * адрес видео с `http://` — CSP при этом разрешает `http://${imageHost}`
 * и для media-src, и для img-src. Строгость, которая ничего не защищает,
 * но ломает контент, — не строгость.
 */
export const WEB_SCHEMES = ['https:', 'http:'] as const;

/** Схемы для кнопки звонка. */
export const TEL_SCHEMES = ['tel:'] as const;

/**
 * Разбор через `new URL()`, а не через проверку префикса строки.
 *
 * Наивное `raw.startsWith('http')` обходится буквально в лоб: браузер
 * выбрасывает из схемы табуляции и переводы строк, поэтому `java\tscript:`,
 * `java\nscript:` и ведущие пробелы дают рабочий `javascript:`. Парсер URL
 * нормализует всё это ровно так же, как потом сделает браузер, — значит,
 * решение принимается по тому же значению, которое реально сработает.
 *
 * Возвращается исходная строка, а не `url.href`: нормализация переписала бы
 * `tel:+7 999` в `tel:+7%20999`. На отображение это влияет, на безопасность —
 * нет, раз схема уже проверена.
 */
export function safeUrl(
  raw: string | null | undefined,
  allowed: readonly string[] = WEB_SCHEMES,
): string | undefined {
  const trimmed = raw?.trim();
  if (!trimmed) return undefined;

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    // Относительный путь или мусор. Все поля, которые сюда попадают,
    // по смыслу абсолютные, так что это не потеря.
    return undefined;
  }

  return allowed.includes(parsed.protocol) ? trimmed : undefined;
}

/**
 * То же для адресов медиа, но дополнительно разрешает путь от корня сайта.
 *
 * Видео первого экрана допустимо положить в `/public` и указать
 * `/video/hero.mp4` — именно этот вариант описан в site-content.ts. Такой путь
 * не может оказаться `javascript:`: ведущий слэш делает строку путём
 * однозначно. Протокол-относительный `//host/file.mp4` при этом отбрасывается —
 * он равнозначен внешнему адресу, и пусть тогда его и пишут целиком.
 */
export function safeMediaUrl(raw: string | null | undefined): string | undefined {
  const trimmed = raw?.trim();
  if (!trimmed) return undefined;

  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return trimmed;

  return safeUrl(trimmed);
}
