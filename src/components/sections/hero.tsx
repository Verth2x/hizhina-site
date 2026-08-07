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
            Два слоя вместо одной панели. Порядок важен: оба идут после
            HeroVideo, чтобы лечь поверх кадра, но остаться под контентом.
          */}
          <div aria-hidden="true" className="hero-scrim-blur absolute inset-0 -z-10" />
          <div aria-hidden="true" className="hero-scrim absolute inset-0 -z-10" />
        </>
      ) : (
        <div aria-hidden="true" className="hatch absolute inset-0 opacity-30" />
      )}

      <div className="gutter relative flex min-h-[82svh] w-full flex-col justify-center pt-28 pb-20 md:min-h-[92svh]">
        <div className="max-w-2xl lg:max-w-3xl">
          {/* Тонкая черта над надзаголовком — единственная линия на экране,
              она задаёт левый край всей колонки. */}
          {hasBackdrop ? (
            <span
              aria-hidden="true"
              className="bg-action mb-7 block h-px w-16 origin-left opacity-80"
            />
          ) : null}

          <p
            className={cn(
              'text-label uppercase',
              hasBackdrop ? 'text-text-inverse' : 'text-text-muted',
            )}
          >
            {messages.hero.eyebrow}
          </p>

          <h1
            className={cn(
              'text-display mt-6',
              hasBackdrop
                ? 'text-white [text-shadow:0_2px_40px_rgb(20_17_13/0.55)]'
                : 'text-text-primary',
            )}
          >
            {content.hero.title}
          </h1>

          <p
            className={cn(
              'text-hero-lead mt-6 max-w-xl font-light',
              hasBackdrop
                ? 'text-text-inverse [text-shadow:0_1px_24px_rgb(20_17_13/0.5)]'
                : 'text-text-secondary',
            )}
          >
            {content.hero.subtitle}
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
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
