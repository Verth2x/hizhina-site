import type { BookingSubject } from '@/lib/content/types';

/**
 * Telegram допускает в deep-link параметре `start` только символы
 * [A-Za-z0-9_-] и длину до 64 символов. Всё остальное приводит к тому,
 * что бот получает пустой payload.
 *
 * Функция — последний рубеж: коды в контенте и так задаются латиницей,
 * но если в Directus/CMS кто-то заведёт объект с кириллическим id,
 * ссылка не должна ломаться молча.
 */
export function toStartParam(code: string): string {
  const cleaned = code
    .trim()
    .replace(/[^A-Za-z0-9_-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '');

  return cleaned.slice(0, 64);
}

export function telegramBookingUrl(botUrl: string, subject?: BookingSubject): string {
  if (!subject) return botUrl;

  const param = toStartParam(subject.code);
  if (!param) return botUrl;

  return botUrl + '?start=' + param;
}
