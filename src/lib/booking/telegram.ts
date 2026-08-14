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

/**
 * Telegram запускает бота только по параметру `start`, но веб-ссылка вида
 * t.me/bot?start=... в браузере нередко открывает чат, не нажимая Start:
 * пользователь видит пустой диалог и кнопку, которую надо жать вручную.
 *
 * Отсюда два адреса. Основной — https, он гарантированно открывается
 * везде. Отдельно отдаём tg://resolve: установленный клиент перехватывает
 * схему и жмёт Start сам.
 *
 * Дефис в payload формально разрешён, но часть клиентов его теряет,
 * поэтому переводим в подчёркивание — бот принимает оба варианта.
 */
export function telegramBookingUrl(botUrl: string, subject?: BookingSubject): string {
  if (!subject) return botUrl;

  const param = toStartParam(subject.code).replace(/-/g, '_');
  if (!param) return botUrl;

  return botUrl + '?start=' + param;
}

/** Прямая схема для установленного клиента: жмёт Start без участия человека. */
export function telegramAppUrl(botUrl: string, subject?: BookingSubject): string | null {
  const match = botUrl.match(/t\.me\/([A-Za-z0-9_]+)/);
  if (!match) return null;

  const domain = match[1];
  if (!subject) return 'tg://resolve?domain=' + domain;

  const param = toStartParam(subject.code).replace(/-/g, '_');
  if (!param) return 'tg://resolve?domain=' + domain;

  return 'tg://resolve?domain=' + domain + '&start=' + param;
}
