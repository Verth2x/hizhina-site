'use client';

import { useCallback, useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { MediaSource } from '@/lib/content/types';
import { cn } from '@/lib/utils/cn';

/**
 * Сколько кадров показывать в дорожке, пока фотографий нет.
 * Совпадает с тем, сколько их просят у заказчицы в content/TODO-CONTENT.md,
 * поэтому после загрузки настоящих снимков блок не изменится в размерах.
 */
const PLACEHOLDER_SLIDES = 5;

type Labels = {
  /** Подпись заглушки, пока фотографий нет. */
  placeholder: string;
  prev: string;
  next: string;
  /**
   * Шаблон подписи миниатюры с плейсхолдерами {n} и {total}.
   * Именно строка, а не функция: пропсы клиентского компонента
   * сериализуются, и функцию через эту границу передать нельзя.
   */
  thumbTemplate: string;
};

export function CabinGallery({
  images,
  alt,
  labels,
  priority = false,
}: {
  images: MediaSource[];
  alt: string;
  labels: Labels;
  /**
   * Только для галереи, попадающей в первый экран.
   *
   * По умолчанию выключено, и это важно: компонент стоит на странице до
   * четырёх раз (домики плюс три услуги), все — ниже сгиба. Безусловный
   * priority означал четыре <link rel=preload> с fetchpriority=high,
   * соревнующихся за канал с настоящим LCP-элементом — фоном первого экрана.
   */
  priority?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Пока снимков нет, дорожка живёт на пустых слотах: механика листания
  // видна и проверяема до того, как заказчица пришлёт фотографии.
  // Как только gallery заполнится, слоты заменятся кадрами без правок вёрстки.
  const slides: (MediaSource | null)[] =
    images.length > 0 ? images : Array.from({ length: PLACEHOLDER_SLIDES }, () => null);

  const total = slides.length;

  const select = useCallback(
    (next: number) => {
      const clamped = (next + total) % total;
      setIndex(clamped);
      thumbRefs.current[clamped]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    },
    [total],
  );

  const current = slides[index];

  const label = (position: number) =>
    labels.thumbTemplate.replace('{n}', String(position + 1)).replace('{total}', String(total));

  return (
    // min-w-0 обязателен: это grid-элемент, а у grid-элементов min-width по
    // умолчанию auto — то есть равен min-content. Дорожка миниатюр шире
    // экрана, поэтому без сброса колонка растягивалась до её ширины (676px),
    // страница переставала помещаться, и мобильный браузер отъезжал по X.
    <div className="min-w-0">
      <div
        className="bg-surface media-fill relative aspect-4/3 overflow-hidden rounded-lg lg:aspect-auto"
        {...(current ? {} : { role: 'img', 'aria-label': alt + '. ' + labels.placeholder })}
      >
        {current ? (
          // key на индексе перемонтирует картинку, и она проявляется анимацией.
          // В референсе то же самое сделано таймером на 200 мс — здесь это лишнее:
          // CSS справляется сам и не оставляет висящих таймеров при размонтировании.
          <Image
            key={index}
            src={current.src}
            alt={current.alt ?? alt}
            fill
            sizes="(min-width: 1024px) 55vw, 100vw"
            priority={priority && index === 0}
            placeholder={current.blurDataURL ? 'blur' : 'empty'}
            blurDataURL={current.blurDataURL}
            className="animate-fade-in object-cover"
          />
        ) : (
          <>
            <div aria-hidden="true" className="hatch absolute inset-0 opacity-40" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <span className="text-label text-text-muted uppercase">{labels.placeholder}</span>
              <span aria-hidden="true" className="text-small text-text-muted tabular">
                {index + 1} / {total}
              </span>
            </div>
          </>
        )}
      </div>

      <div className="relative mt-3.5">
        <StripButton
          side="prev"
          label={labels.prev}
          disabled={index === 0}
          onClick={() => select(index - 1)}
        />

        <div
          role="tablist"
          aria-label={alt}
          onKeyDown={(event) => {
            if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
            event.preventDefault();
            const next = index + (event.key === 'ArrowRight' ? 1 : -1);
            select(next);
            thumbRefs.current[(next + total) % total]?.focus();
          }}
          // scrollbar-width:none повторяет референс: дорожка листается жестом,
          // стрелками и клавишами, но системный скроллбар под миниатюрами
          // ломал бы ритм блока.
          // На мобильном стрелок нет, поэтому и место под них не резервируем:
          // px-11 съедал 88px из 350 доступных. Прилипание по оси X даёт
          // пальцу останавливаться ровно на кадре, а не между двумя.
          className="flex snap-x snap-mandatory items-center gap-2 overflow-x-auto px-0 py-2.5 sm:gap-2.5 sm:px-11 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {slides.map((slide, position) => {
            const active = position === index;
            return (
              <button
                key={slide ? slide.src : 'slot-' + position}
                ref={(node) => {
                  thumbRefs.current[position] = node;
                }}
                type="button"
                role="tab"
                aria-selected={active}
                tabIndex={active ? 0 : -1}
                aria-label={label(position)}
                onClick={() => select(position)}
                className={cn(
                  'bg-surface relative shrink-0 snap-start overflow-hidden rounded-sm transition-all duration-300',
                  active
                    ? 'h-[66px] w-[88px] opacity-100 sm:h-[99px] sm:w-[132px]'
                    : 'h-[54px] w-[72px] opacity-50 hover:opacity-80 sm:h-[78px] sm:w-[104px]',
                )}
              >
                {slide ? (
                  <Image
                    src={slide.src}
                    alt=""
                    fill
                    sizes="132px"
                    className="object-cover"
                    aria-hidden="true"
                  />
                ) : (
                  <>
                    <span aria-hidden="true" className="hatch absolute inset-0 opacity-40" />
                    <span
                      aria-hidden="true"
                      className="text-small text-text-muted tabular absolute inset-0 grid place-items-center"
                    >
                      {position + 1}
                    </span>
                  </>
                )}
              </button>
            );
          })}
        </div>

        <StripButton
          side="next"
          label={labels.next}
          disabled={index === total - 1}
          onClick={() => select(index + 1)}
        />
      </div>
    </div>
  );
}

function StripButton({
  side,
  label,
  disabled,
  onClick,
}: {
  side: 'prev' | 'next';
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  const Icon = side === 'prev' ? ChevronLeft : ChevronRight;

  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        // hidden на мобильном: пальцем дорожка листается свайпом, а две
        // кнопки по краям отнимали бы место у самих миниатюр.
        'bg-surface border-border-interactive text-text-primary absolute top-1/2 z-10 hidden size-[38px] -translate-y-1/2 place-items-center rounded-full border transition-colors sm:grid',
        'hover:border-text-primary disabled:pointer-events-none disabled:opacity-30',
        side === 'prev' ? 'left-0' : 'right-0',
      )}
    >
      <Icon size={16} strokeWidth={1.5} aria-hidden="true" />
    </button>
  );
}
