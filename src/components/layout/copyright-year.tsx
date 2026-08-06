'use client';

import { useSyncExternalStore } from 'react';

/** Год не меняется в пределах сессии — подписываться не на что. */
const subscribe = () => () => {};

/**
 * `new Date().getFullYear()` в серверном компоненте вычисляется один раз —
 * на билде — и замерзает в статическом HTML. 1 января сайт будет показывать
 * прошлый год до следующего деплоя.
 *
 * `useSyncExternalStore` — штатный способ отдать разные значения на сервере
 * и на клиенте: серверный снимок возвращает год сборки (HTML корректен и без
 * JavaScript, для поисковика тоже), клиентский — фактический. React сам
 * согласует их при гидратации, без расхождения и без setState в эффекте,
 * который вызвал бы лишний каскад рендеров.
 */
export function CopyrightYear({ since, buildYear }: { since: number; buildYear: number }) {
  const year = useSyncExternalStore(
    subscribe,
    () => new Date().getFullYear(),
    () => buildYear,
  );

  const to = Math.max(year, since);

  return <span className="tabular">{to > since ? `${since}\u2013${to}` : String(since)}</span>;
}
