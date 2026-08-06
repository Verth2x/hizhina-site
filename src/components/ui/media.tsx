import Image from 'next/image';
import type { MediaSource } from '@/lib/content/types';
import { cn } from '@/lib/utils/cn';

const ratioClass = {
  '4/3': 'aspect-4/3',
  '16/9': 'aspect-video',
  '3/4': 'aspect-3/4',
} as const;

type Ratio = keyof typeof ratioClass;

type MediaProps = {
  /** Название объекта — идёт в alt, если у изображения нет своего. */
  alt: string;
  source?: MediaSource;
  ratio?: Ratio;
  className?: string;
  /** Подпись заглушки, когда фотографии ещё нет. */
  placeholderLabel: string;
  /**
   * Значение `sizes` для next/image. Задавать обязательно осмысленно:
   * по умолчанию `fill` тянет картинку под ширину вьюпорта, и на телефоне
   * прилетает файл под десктоп.
   */
  sizes?: string;
  /** Только для изображения, попадающего в первый экран (LCP). */
  priority?: boolean;
};

export function Media({
  alt,
  source,
  ratio = '4/3',
  className,
  placeholderLabel,
  sizes = '(min-width: 1024px) 40vw, (min-width: 768px) 50vw, 100vw',
  priority = false,
}: MediaProps) {
  const wrapper = cn('relative overflow-hidden bg-surface-soft', ratioClass[ratio], className);

  // Фотографий пока нет — оставляем ту же штриховку, что была: она честно
  // сообщает о состоянии и не притворяется картинкой.
  if (!source?.src) {
    return (
      <div role="img" aria-label={alt + '. ' + placeholderLabel} className={wrapper}>
        <div aria-hidden="true" className="hatch absolute inset-0 opacity-40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-label text-text-muted uppercase">{placeholderLabel}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={wrapper}>
      <Image
        src={source.src}
        alt={source.alt ?? alt}
        fill
        sizes={sizes}
        priority={priority}
        loading={priority ? undefined : 'lazy'}
        placeholder={source.blurDataURL ? 'blur' : 'empty'}
        blurDataURL={source.blurDataURL}
        className="object-cover"
      />
    </div>
  );
}
