'use client';

import type { Goal, GoalParams } from '@/lib/analytics/goals';
import { track } from '@/lib/analytics/track';

type Props = React.ComponentProps<'a'> & {
  goal: Goal;
  params?: GoalParams;
};

/**
 * Обычная ссылка, которая перед переходом отправляет цель.
 *
 * Нужна потому, что секции — серверные компоненты, а `track()` работает
 * только в браузере. Это самая маленькая клиентская граница, какую можно
 * провести: разметка остаётся в серверном компоненте, в бандл уезжает
 * один обработчик.
 *
 * Событие отправляется синхронно и не задерживает переход — если счётчик
 * заблокирован, пользователь всё равно попадёт куда шёл.
 */
export function TrackedLink({ goal, params, onClick, children, ...props }: Props) {
  return (
    <a
      {...props}
      onClick={(event) => {
        track(goal, params);
        onClick?.(event);
      }}
    >
      {children}
    </a>
  );
}
