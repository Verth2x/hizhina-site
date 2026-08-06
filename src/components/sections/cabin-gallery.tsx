'use client';

import { useCallback, useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { MediaSource } from '@/lib/content/types';
import { cn } from '@/lib/utils/cn';

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
}: {
  images: MediaSource[];
  alt: string;
  labels: Labels;
}) {
  const [index, setIndex] = useState(0);
  const stripRef = useRef<HTMLDivElement>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const select = useCallback(
    (next: number) => {
      if (images.length === 0) return;
      const clamped = (next + images.length) % images.length;
      setIndex(clamped);
      thumbRefs.current[clamped]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    },
    [images.length],
  );

  // Фотографий пока нет — оставляем ту же штриховку, что и в остальных блоках.
  // Полоса миниатюр в этом состоянии не рисуется: пустые рамки изображали бы
  // интерфейс, которого нет.
  if (images.length === 0) {
    return (
      <div
        role="img"
        aria-label={alt + '. ' + labels.placeholder}
        className="bg-surface relative aspect-4/3 overflow-hidden rounded-lg"
      >
        <div aria-hidden="true" className="hatch absolute inset-0 opacity-40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-label text-text-muted uppercase">{labels.placeholder}</span>
        </div>
      </div>
    );
  }

  const current = images[index];
  const hasStrip = images.length > 1;

  return (
    <div>
      <div className="bg-surface relative aspect-4/3 overflow-hidden rounded-lg">
        {/*
          key на индексе перемонтирует картинку, и она проявляется анимацией.
          В референсе то же самое сделано таймером на 200 мс — здесь это лишнее:
          CSS справляется сам и не оставляет висящих таймеров при размонтировании.
        */}
        <Image
          key={index}
          src={current.src}
          alt={current.alt ?? alt}
          fill
          sizes="(min-width: 1024px) 55vw, 100vw"
          priority={index === 0}
          placeholder={current.blurDataURL ? 'blur' : 'empty'}
          blurDataURL={current.blurDataURL}
          className="animate-fade-in object-cover"
        />
      </div>

      {hasStrip ? (
        <div className="relative mt-3.5">
          <StripButton
            side="prev"
            label={labels.prev}
            disabled={index === 0}
            onClick={() => select(index - 1)}
          />

          <div
            ref={stripRef}
            role="tablist"
            aria-label={alt}
            onKeyDown={(event) => {
              if (event.key === 'ArrowRight') {
                event.preventDefault();
                select(index + 1);
                thumbRefs.current[(index + 1) % images.length]?.focus();
              }
              if (event.key === 'ArrowLeft') {
                event.preventDefault();
                select(index - 1);
                thumbRefs.current[(index - 1 + images.length) % images.length]?.focus();
              }
            }}
            // scrollbar-width:none повторяет референс: полоса прокручивается
            // жестом и стрелками, но системный скроллбар под миниатюрами
            // ломал бы ритм блока.
            className="flex items-center gap-2.5 overflow-x-auto px-11 py-2.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {images.map((image, position) => {
              const active = position === index;
              return (
                <button
                  key={image.src}
                  ref={(node) => {
                    thumbRefs.current[position] = node;
                  }}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  tabIndex={active ? 0 : -1}
                  aria-label={labels.thumbTemplate
                    .replace('{n}', String(position + 1))
                    .replace('{total}', String(images.length))}
                  onClick={() => select(position)}
                  className={cn(
                    'bg-surface relative shrink-0 overflow-hidden rounded-sm transition-all duration-300',
                    active
                      ? 'h-[99px] w-[132px] opacity-100'
                      : 'h-[78px] w-[104px] opacity-50 hover:opacity-80',
                  )}
                >
                  <Image
                    src={image.src}
                    alt=""
                    fill
                    sizes="132px"
                    className="object-cover"
                    aria-hidden="true"
                  />
                </button>
              );
            })}
          </div>

          <StripButton
            side="next"
            label={labels.next}
            disabled={index === images.length - 1}
            onClick={() => select(index + 1)}
          />
        </div>
      ) : null}
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
        'bg-surface border-border-interactive text-text-primary absolute top-1/2 z-10 grid size-[38px] -translate-y-1/2 place-items-center rounded-full border transition-colors',
        'hover:border-text-primary disabled:pointer-events-none disabled:opacity-30',
        side === 'prev' ? 'left-0' : 'right-0',
      )}
    >
      <Icon size={16} strokeWidth={1.5} aria-hidden="true" />
    </button>
  );
}
