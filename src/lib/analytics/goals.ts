/**
 * Цели конверсии. Имена латиницей в snake_case — их же надо завести
 * в интерфейсе Метрики как цели типа «JavaScript-событие».
 *
 * Смысл разделения: заявка уходит в мессенджер, то есть за пределы сайта.
 * Единственная точка, где мы ещё видим пользователя, — клик по каналу.
 * Без этих событий нельзя ответить, какой канал приносит брони и стоит ли
 * вообще платить за сайт.
 */
export const GOALS = {
  /** Открыт попап бронирования (из шапки, карточки, секции, CTA-бара). */
  bookingOpen: 'booking_open',
  /** Выбран конкретный канал связи в попапе. */
  channelTelegram: 'channel_telegram',
  channelWhatsapp: 'channel_whatsapp',
  channelPhone: 'channel_phone',
  channelVk: 'channel_vk',
  /** Клик по телефону вне попапа: шапка, мобильное меню, CTA-бар, футер. */
  phoneClick: 'phone_click',
  /** Клик по e-mail. */
  emailClick: 'email_click',
  /** Открыта карта или маршрут. */
  mapOpen: 'map_open',
  /** Переключение языка — показывает, есть ли англоязычный спрос. */
  localeSwitch: 'locale_switch',
} as const;

export type Goal = (typeof GOALS)[keyof typeof GOALS];

/** Дополнительные параметры визита: какой объект, откуда нажали. */
export type GoalParams = Record<string, string | number | boolean>;
