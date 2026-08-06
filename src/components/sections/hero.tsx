import Image from 'next/image';
import { BookingButton } from '@/components/booking/booking-button';
import { Button } from '@/components/ui/button';
import type { Messages } from '@/i18n/config';
import type { SiteContent } from '@/lib/content/types';
import { cn } from '@/lib/utils/cn';
import { HeroVideo } from './hero-video';

export function Hero({ content, messages }: { content: SiteContent; messages: Messages }) {
  const { video } = content.hero;

  // Постер видео главнее статичной картинки: если задано видео, первый кадр
  // берём из него, чтобы подмена «постер → видео» прошла без скачка.
  const still = video?.poster ?? content.hero.image;
  const hasBackdrop = Boolean(still?.src);

  return (
    <section className={cn('relative isolate overflow-hidden', !hasBackdrop && 'bg-surface-soft')}>
      {hasBackdrop && still ? (
        <>
          <Image
            src={still.src}
            alt={still.alt ?? ''}
            fill
            // Первый экран — почти всегда LCP-элемент. priority снимает
            // ленивую загрузку и добавляет preload. Видео поверх грузится
            // позже и на эту метрику уже не влияет.
            priority
            sizes="100vw"
            placeholder={still.blurDataURL ? 'blur' : 'empty'}
            blurDataURL={still.blurDataURL}
            className="-z-10 object-cover"
          />
          {video ? <HeroVideo video={video} /> : null}
          {/*
            Общий скрим остаётся, хотя текст защищён собственной подложкой:
            он нужен шапке сайта, которая стоит поверх того же кадра.
          */}
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-gradient-to-t from-[rgb(20_17_13/0.72)] via-[rgb(20_17_13/0.35)] to-[rgb(20_17_13/0.15)]"
          />
        </>
      ) : (
        <div aria-hidden="true" className="hatch absolute inset-0 opacity-30" />
      )}

      <div className="max-w-main gutter relative mx-auto flex min-h-[82svh] flex-col justify-end pt-32 pb-16 md:min-h-[92svh]">
        {/*
          Подложка появляется только там, где под текстом что-то движется.
          На светлом фоне без видео она была бы тёмным пятном без причины.
        */}
        <div
          className={cn('max-w-3xl', hasBackdrop && 'hero-panel rounded-lg p-7 sm:p-10 lg:p-12')}
        >
          <p
            className={cn(
              'text-label uppercase',
              hasBackdrop ? 'text-text-inverse' : 'text-text-muted',
            )}
          >
            {messages.hero.eyebrow}
          </p>

          <h1 className={cn('text-display mt-6', hasBackdrop ? 'text-white' : 'text-text-primary')}>
            {content.hero.title}
          </h1>

          <p
            className={cn(
              'text-hero-lead mt-5 max-w-xl font-light',
              hasBackdrop ? 'text-text-inverse' : 'text-text-secondary',
            )}
          >
            {content.hero.subtitle}
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <BookingButton size="lg" placement="hero">
              {messages.actions.book}
            </BookingButton>
            <Button asChild variant={hasBackdrop ? 'ghost-inverse' : 'ghost'} size="lg">
              <a href="#cabins">{messages.actions.viewCabins}</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
