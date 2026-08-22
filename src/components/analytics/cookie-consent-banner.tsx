'use client';

import { useSyncExternalStore } from 'react';
import type { Locale } from '@/i18n/config';

type CookieTexts = { text: string; accept: string; policyLink: string };

/**
 * Информационный cookie-баннер.
 *
 * На сайте нет ни одной формы, собирающей данные, — только внешние ссылки
 * на Telegram/WhatsApp/звонок и Яндекс.Метрика. В этом случае закон не
 * требует блокирующего чекбокса перед подключением аналитики: достаточно
 * уведомить и дать ссылку на политику. Продолжение просмотра сайта
 * засчитывается как согласие — «мягкий» вариант баннера.
 *
 * Поэтому счётчик Метрики (см. YandexMetrica в layout) продолжает
 * грузиться независимо от этого баннера: баннер информирует, а не
 * управляет доступом.
 *
 * Версия в ключе позволяет показать баннер повторно, если политика
 * когда-нибудь изменится существенно — тогда достаточно увеличить число.
 */
const STORAGE_KEY = 'hz-cookie-consent-v1';

// localStorage — внешнее хранилище относительно React, поэтому читаем его
// через useSyncExternalStore, а не setState внутри useEffect: второе даёт
// лишний ре-рендер сразу после монтирования и не синхронизируется между
// вкладками. getServerSnapshot всегда «не показываем» — баннер решается
// только на клиенте, сервер про localStorage ничего не знает.
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((cb) => cb());

function subscribe(callback: () => void) {
  listeners.add(callback);
  window.addEventListener('storage', callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener('storage', callback);
  };
}

function getSnapshot() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== 'accepted';
  } catch {
    return false;
  }
}

function getServerSnapshot() {
  return false;
}

function dismiss() {
  try {
    window.localStorage.setItem(STORAGE_KEY, 'accepted');
  } catch {
    // Не смогли сохранить — переживём повторный показ при следующем визите.
  }
  notify();
}

export function CookieConsentBanner({ locale, texts }: { locale: Locale; texts: CookieTexts }) {
  const visible = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!visible) return null;

  const policyHref = '/' + locale + '/privacy';

  return (
    <div
      role="region"
      aria-label="Cookie"
      className="bg-surface-inverse text-text-inverse z-modal fixed inset-x-0 bottom-0 border-t border-border-inverse"
    >
      <div className="max-w-main gutter mx-auto flex flex-col items-center gap-3 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:flex-row sm:justify-between">
        <p className="text-small max-w-[62ch] font-light opacity-90">
          {texts.text}{' '}
          <a href={policyHref} className="border-border-inverse-interactive hover:border-text-inverse border-b transition-colors">
            {texts.policyLink}
          </a>
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="bg-white text-surface-inverse hover:bg-surface-sunk shrink-0 rounded-md px-5 py-2.5 text-[15px] font-medium transition-colors"
        >
          {texts.accept}
        </button>
      </div>
    </div>
  );
}
