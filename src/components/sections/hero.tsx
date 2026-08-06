import Image from 'next/image';
import { BookingButton } from '@/components/booking/booking-button';
import { Button } from '@/components/ui/button';
import type { Messages } from '@/i18n/config';
import type { SiteContent } from '@/lib/content/types';
import { cn } from '@/lib/utils/cn';

export function Hero({ content, messages }: { content: SiteContent; messages: Messages }) {
  const image = content.hero.image;
  const hasImage = Boolean(image?.src);

  return (
    <section className={cn('relative isolate overflow-hidden', !hasImage && 'bg-surface-soft')}>
      {hasImage && image ? (
        <>
          <Image
            src={image.src}
            alt={image.alt ?? ''}
            fill
            // Первый экран — почти всегда LCP-элемент. priority снимает
            // ленивую загрузку и добавляет preload.
            priority
            sizes="100vw"
            placeholder={image.blurDataURL ? 'blur' : 'empty'}
            blurDataURL={image.blurDataURL}
            className="-z-10 object-cover"
          />
          {/*
            Скрим, а не просто затемнение: текст стоит в нижней трети, поэтому
            градиент гуще снизу. Без него контраст заголовка зависел бы от того,
            какую фотографию загрузит заказчица.
          */}
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-gradient-to-t from-[rgb(20_17_13/0.82)] via-[rgb(20_17_13/0.45)] to-[rgb(20_17_13/0.15)]"
          />
        </>
      ) : (
        <div aria-hidden="true" className="hatch absolute inset-0 opacity-30" />
      )}

      <div className="max-w-main gutter relative mx-auto flex min-h-[78svh] flex-col justify-end pt-32 pb-16 md:min-h-[86svh]">
        <p
          className={cn(
            'text-label uppercase',
            hasImage ? 'text-text-inverse opacity-90' : 'text-text-muted',
          )}
        >
          {messages.hero.eyebrow}
        </p>
        <h1
          className={cn(
            'text-display mt-5 max-w-3xl',
            hasImage ? 'text-white' : 'text-text-primary',
          )}
        >
          {content.hero.title}
        </h1>
        <p
          className={cn(
            'text-lead mt-4 max-w-xl',
            hasImage ? 'text-text-inverse' : 'text-text-secondary',
          )}
        >
          {content.hero.subtitle}
        </p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <BookingButton size="lg" placement="hero">
            {messages.actions.book}
          </BookingButton>
          <Button asChild variant={hasImage ? 'ghost-inverse' : 'ghost'} size="lg">
            <a href="#cabins">{messages.actions.viewCabins}</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
