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
            Скрим, а не просто затемнение: текст стоит в нижней трети, поэтому
            градиент гуще снизу. Без него контраст заголовка зависел бы от того,
            какой кадр загрузит заказчица.
          */}
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-gradient-to-t from-[rgb(20_17_13/0.82)] via-[rgb(20_17_13/0.45)] to-[rgb(20_17_13/0.15)]"
          />
        </>
      ) : (
        <div aria-hidden="true" className="hatch absolute inset-0 opacity-30" />
      )}

      <div className="max-w-main gutter relative mx-auto flex min-h-[82svh] flex-col justify-end pt-32 pb-16 md:min-h-[92svh]">
        <p
          className={cn(
            'text-label uppercase',
            hasBackdrop ? 'text-text-inverse opacity-90' : 'text-text-muted',
          )}
        >
          {messages.hero.eyebrow}
        </p>
        <h1
          className={cn(
            'text-display mt-6 max-w-4xl',
            hasBackdrop ? 'text-white' : 'text-text-primary',
          )}
        >
          {content.hero.title}
        </h1>
        <p
          className={cn(
            'text-lead mt-5 max-w-xl',
            hasBackdrop ? 'text-text-inverse opacity-90' : 'text-text-secondary',
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
    </section>
  );
}
