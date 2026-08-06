'use client';

import { useEffect, useRef, useState } from 'react';
import type { HeroVideo } from '@/lib/content/types';

/**
 * `navigator.connection` — экспериментальное API, в lib.dom его нет.
 * Описываем ровно те два поля, которые используем.
 */
type NetworkInformation = { saveData?: boolean; effectiveType?: string };

/**
 * Фоновое видео первого экрана.
 *
 * Главное требование — не замедлить сайт. Отсюда четыре правила:
 *
 * 1. Постер отрисовывает Hero, а не этот компонент. Постер — LCP-элемент,
 *    он проходит через next/image и грузится с priority. Видео появляется
 *    поверх него и на LCP не влияет вовсе.
 *
 * 2. Загрузка начинается не при монтировании, а в простое (requestIdleCallback).
 *    Пока браузер занят гидратацией и шрифтами, десяток мегабит на видео —
 *    это отобранная у страницы полоса.
 *
 * 3. Три причины не грузить видео совсем: включён режим экономии трафика,
 *    соединение уровня 2G, или пользователь просил уменьшить анимацию.
 *    В любом из этих случаев остаётся постер — картинка, не заглушка.
 *
 * 4. Видео останавливается, когда уезжает за пределы экрана. Декодирование
 *    кадров, которых никто не видит, тратит батарею на телефоне.
 */
export function HeroVideo({ video }: { video: HeroVideo }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
    if (connection?.saveData) return;
    if (connection?.effectiveType && /(^|-)2g$/.test(connection.effectiveType)) return;

    const start = () => setShouldLoad(true);

    // Тип объявляет requestIdleCallback безусловно, но в Safari он появился
    // только в 18.2 — проверка нужна именно в рантайме. Присваивание в
    // переменную не даёт TS сузить `window` до never в ветке отката.
    const idle: typeof window.requestIdleCallback | undefined = window.requestIdleCallback;

    if (idle) {
      const handle = idle(start, { timeout: 2500 });
      return () => window.cancelIdleCallback(handle);
    }

    const handle = window.setTimeout(start, 1200);
    return () => window.clearTimeout(handle);
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (!shouldLoad || !element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Автовоспроизведение может быть отклонено политикой браузера —
          // это штатная ситуация, а не ошибка: остаётся постер.
          void element.play().catch(() => {});
        } else {
          element.pause();
        }
      },
      { threshold: 0.05 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [shouldLoad]);

  if (!shouldLoad) return null;

  return (
    <video
      ref={ref}
      // Дорожки звука в файле быть не должно вовсе: она весит лишних
      // несколько сотен килобайт и в некоторых браузерах мешает автозапуску.
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden="true"
      tabIndex={-1}
      disablePictureInPicture
      onCanPlay={() => setReady(true)}
      className={
        'absolute inset-0 -z-10 size-full object-cover transition-opacity duration-700 ' +
        (ready ? 'opacity-100' : 'opacity-0')
      }
    >
      {video.webm ? <source src={video.webm} type="video/webm" /> : null}
      <source src={video.mp4} type="video/mp4" />
    </video>
  );
}
