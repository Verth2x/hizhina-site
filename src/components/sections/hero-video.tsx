'use client';

import { useEffect, useRef, useState } from 'react';
import type { HeroVideo } from '@/lib/content/types';

/**
 * Фоновое видео первого экрана.
 *
 * Порядок событий: Hero рисует постер через next/image с priority — он и есть
 * LCP-элемент. Это видео грузится следом, в простое браузера, и проявляется
 * поверх постера, только когда действительно пошло воспроизведение.
 *
 * Раньше здесь стояли три условия, при которых видео не грузилось вовсе:
 * `prefers-reduced-motion`, режим экономии трафика и соединение уровня 2G.
 * Они сняты по решению владельца. Причина практическая: `reduce` включает не
 * только осознанная настройка доступности, но и энергосбережение на телефоне,
 * поэтому видео молча не показывалось заметной доле гостей — в том числе на
 * устройствах, где его никто не просил отключать.
 *
 * Что осталось от бережности: загрузка не начинается на критическом пути
 * отрисовки, а воспроизведение останавливается за пределами экрана — незачем
 * декодировать кадры, которых никто не видит.
 */
export function HeroVideo({ video }: { video: HeroVideo }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [visible, setVisible] = useState(false);

  // Пока браузер занят гидратацией и шрифтами, несколько мегабит на видео —
  // это отобранная у страницы полоса. Ждём простоя, но не дольше таймаута.
  useEffect(() => {
    const start = () => setShouldLoad(true);

    // Тип объявляет requestIdleCallback безусловно, но в Safari он появился
    // только в 18.2 — проверка нужна именно в рантайме. Присваивание в
    // переменную не даёт TS сузить `window` до never в ветке отката.
    const idle: typeof window.requestIdleCallback | undefined = window.requestIdleCallback;

    if (idle) {
      const handle = idle(start, { timeout: 2000 });
      return () => window.cancelIdleCallback(handle);
    }

    const handle = window.setTimeout(start, 800);
    return () => window.clearTimeout(handle);
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (!shouldLoad || !element) return;

    // Отказ в автозапуске — штатная ситуация, а не ошибка: остаётся постер.
    const tryPlay = () => void element.play().catch(() => {});

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) tryPlay();
        else element.pause();
      },
      { threshold: 0.05 },
    );
    observer.observe(element);

    // Safari на iOS в режиме энергосбережения отклоняет автозапуск даже у
    // беззвучного видео. Ограничение снимается любым жестом пользователя,
    // поэтому одну повторную попытку делаем после первого касания или клика.
    window.addEventListener('pointerdown', tryPlay, { once: true, passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('pointerdown', tryPlay);
    };
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
      autoPlay
      preload="auto"
      aria-hidden="true"
      tabIndex={-1}
      disablePictureInPicture
      // Проявляем по `playing`, а не по `canplay`: если автозапуск отклонён,
      // кадры уже готовы, но видео стоит — и вместо постера гость получил бы
      // замерший первый кадр. Обратно не прячем: пауза за пределами экрана
      // не должна мигать подменой при обратной прокрутке.
      onPlaying={() => setVisible(true)}
      className={
        'absolute inset-0 -z-10 size-full object-cover transition-opacity duration-700 ' +
        (visible ? 'opacity-100' : 'opacity-0')
      }
    >
      {video.webm ? <source src={video.webm} type="video/webm" /> : null}
      <source src={video.mp4} type="video/mp4" />
    </video>
  );
}
