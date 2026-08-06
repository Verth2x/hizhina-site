import ru from './messages/ru.json';
import en from './messages/en.json';

export const locales = ['ru', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'ru';
export type Messages = typeof ru;

const dictionaries: Record<Locale, Messages> = { ru, en: en as Messages };

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function getMessages(locale: Locale): Messages {
  return dictionaries[locale];
}

export const htmlLang: Record<Locale, string> = { ru: 'ru-RU', en: 'en-US' };
export const intlLocale: Record<Locale, string> = { ru: 'ru-RU', en: 'en-US' };
