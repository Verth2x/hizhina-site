import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * Размеры текста в проекте заданы своими токенами (--text-display, --text-lead
 * и так далее). tailwind-merge про них не знает: он видит `text-display`,
 * не находит такого размера в стандартной шкале и относит класс к группе
 * цвета. Дальше `cn('text-display', 'text-white')` считается конфликтом
 * одной группы — и размер молча выбрасывается из разметки.
 *
 * Поэтому перечисляем свои размеры явно. Список обязан совпадать
 * с `--text-*` в src/styles/theme.css.
 */
const FONT_SIZES = [
  'display',
  'hero-lead',
  'lead',
  'body',
  'small',
  'label',
  'meta',
  'price',
] as const;

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: [...FONT_SIZES] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
