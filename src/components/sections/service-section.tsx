import { Info } from 'lucide-react';
import { BookingButton } from '@/components/booking/booking-button';
import { Media } from '@/components/ui/media';
import type { Messages } from '@/i18n/config';
import type { Service } from '@/lib/content/types';
import { cn } from '@/lib/utils/cn';

export function ServiceSection({
  service,
  messages,
  id,
  tone = 'light',
  mediaSide = 'left',
}: {
  service: Service;
  messages: Messages;
  id: string;
  tone?: 'light' | 'dark' | 'sunk';
  mediaSide?: 'left' | 'right';
}) {
  const dark = tone === 'dark';

  return (
    <section
      id={id}
      className={cn(
        'section-y',
        dark && 'bg-surface-inverse text-text-inverse',
        tone === 'sunk' && 'bg-surface-sunk',
      )}
    >
      <div className="max-w-main gutter mx-auto grid items-center gap-10 md:grid-cols-2">
        <div className={cn(mediaSide === 'right' && 'md:order-2')}>
          <Media
            alt={service.name}
            source={service.image}
            ratio="4/3"
            placeholderLabel={messages.common.photoSoon}
            sizes="(min-width: 768px) 46vw, 100vw"
            className="rounded-lg"
          />
        </div>

        <div>
          <h2 className={cn('text-h1', dark ? 'text-text-inverse' : 'text-text-primary')}>
            {service.name}
          </h2>
          {/*
            На светлом фоне метаданные шли через text-text-muted, на тёмном —
            через opacity-70, что давало 3.9:1. Приводим тёмный вариант
            к opacity-80: 4.7:1 при кегле 14px.
          */}
          <p className={cn('text-small mt-3', dark ? 'opacity-80' : 'text-text-muted')}>
            {service.meta}
          </p>
          <p className={cn('max-w-prose mt-5', dark ? 'opacity-90' : 'text-text-secondary')}>
            {service.description}
          </p>
          <p className={cn('font-display text-price tabular mt-6', dark && 'text-text-inverse')}>
            {service.price}
          </p>

          {service.standaloneBookable ? (
            <div className="mt-8">
              <BookingButton
                variant={dark ? 'inverse' : 'primary'}
                placement="service"
                subject={{ code: service.key, label: service.name }}
              >
                {messages.actions.check}
              </BookingButton>
            </div>
          ) : (
            <div
              className={cn(
                'text-small mt-8 flex gap-3 rounded-sm border p-4',
                dark
                  ? 'border-border-inverse-interactive opacity-90'
                  : 'border-border text-text-secondary',
              )}
            >
              <Info size={20} strokeWidth={1.5} aria-hidden="true" className="shrink-0" />
              <p>{messages.sections.notBookableSeparately}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
