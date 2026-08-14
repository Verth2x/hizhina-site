'use client';

import type { Goal, GoalParams } from './goals';

declare global {
  interface Window {
    ym?: (counterId: number, action: string, ...rest: unknown[]) => void;
  }
}

/**
 * Отправляет цель в Метрику и молчит, если счётчик не подключён.
 *
 * Аналитика не должна ронять интерфейс: пользователь нажал «Забронировать»,
 * и его задача — попасть в Telegram, а не пережить исключение из-за блокировщика
 * рекламы. Поэтому всё внутри try/catch, а вызов — синхронный и без await:
 * клик по ссылке не ждёт сети.
 */
export function track(goal: Goal, params?: GoalParams): void {
  if (typeof window === 'undefined') return;

  try {
    const counterId = Number(process.env.NEXT_PUBLIC_YANDEX_METRICA_ID);
    if (window.ym && Number.isFinite(counterId) && counterId > 0) {
      window.ym(counterId, 'reachGoal', goal, params);
    }
  } catch {
    // Метрика не загрузилась или заблокирована — это не повод ломать переход.
  }
}
