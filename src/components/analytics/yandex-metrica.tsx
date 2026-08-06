'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';
import { usePathname } from 'next/navigation';

/**
 * Яндекс.Метрика. Подключается только если задан NEXT_PUBLIC_YANDEX_METRICA_ID —
 * на превью-деплоях и локально счётчика не будет, и статистика не засорится.
 *
 * `strategy="afterInteractive"` вместо `beforeInteractive`: счётчик не должен
 * стоять на критическом пути отрисовки лендинга, чья заявленная цель —
 * открываться за 2–3 секунды.
 */
export function YandexMetrica({ counterId }: { counterId?: string }) {
  const pathname = usePathname();
  const previousPath = useRef<string | null>(null);

  const numericId = Number(counterId);
  const enabled = Boolean(counterId) && Number.isFinite(numericId) && numericId > 0;

  // Переключатель языка — клиентская навигация, полной перезагрузки нет.
  // Без ручного hit Метрика посчитает /ru и /en одним просмотром.
  useEffect(() => {
    if (!enabled) return;
    if (previousPath.current === null) {
      previousPath.current = pathname;
      return;
    }
    if (previousPath.current === pathname) return;

    previousPath.current = pathname;
    window.ym?.(numericId, 'hit', window.location.href);
  }, [enabled, numericId, pathname]);

  if (!enabled) return null;

  return (
    <>
      <Script id="yandex-metrica" strategy="afterInteractive">
        {`
(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
m[i].l=1*new Date();
for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}
k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
(window,document,'script','https://mc.yandex.ru/metrika/tag.js','ym');
ym(${numericId},'init',{ssr:true,webvisor:true,clickmap:true,trackLinks:true,accurateTrackBounce:true});
        `}
      </Script>
      <noscript>
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://mc.yandex.ru/watch/${numericId}`}
            style={{ position: 'absolute', left: '-9999px' }}
            alt=""
          />
        </div>
      </noscript>
    </>
  );
}
