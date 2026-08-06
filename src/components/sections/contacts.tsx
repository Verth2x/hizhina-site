import { ArrowUpRight, Route, Send } from 'lucide-react';
import { TrackedLink } from '@/components/analytics/tracked-link';
import { BookingButton } from '@/components/booking/booking-button';
import type { Messages } from '@/i18n/config';
import { GOALS } from '@/lib/analytics/goals';
import type { SiteSettings } from '@/lib/content/types';
import { buildMapsUrl, buildRouteUrl } from '@/lib/utils/maps';

function Social({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      // Граница здесь — единственный визуальный признак кнопки, поэтому
      // берётся интерактивный токен (3.58:1), а не разделительный (1.89:1).
      className="border-border-inverse-interactive text-text-inverse hover:bg-inverse-hover grid size-12 place-items-center rounded-full border transition-colors"
    >
      {children}
    </a>
  );
}

export function Contacts({ settings, messages }: { settings: SiteSettings; messages: Messages }) {
  const mapsUrl = buildMapsUrl(settings.address, settings.coordinates);
  const routeUrl = buildRouteUrl(settings.address, settings.coordinates);
  const directions = settings.directions ?? [];

  const lines: { label: string; value: React.ReactNode }[] = [
    {
      label: messages.popup.phone,
      value: (
        <TrackedLink
          href={settings.phoneHref}
          goal={GOALS.phoneClick}
          params={{ placement: 'contacts' }}
          className="border-border-inverse-interactive hover:border-text-inverse border-b transition-colors"
        >
          {settings.phone}
        </TrackedLink>
      ),
    },
    {
      label: messages.common.email,
      value: (
        <TrackedLink
          href={'mailto:' + settings.email}
          goal={GOALS.emailClick}
          params={{ placement: 'contacts' }}
          className="border-border-inverse-interactive hover:border-text-inverse border-b transition-colors"
        >
          {settings.email}
        </TrackedLink>
      ),
    },
    { label: messages.common.address, value: settings.address },
  ];

  return (
    <section id="contacts" className="bg-surface-inverse text-text-inverse section-y">
      <div className="max-w-main gutter mx-auto grid gap-10 md:grid-cols-12">
        <div className="md:col-span-5">
          {/*
            Надкатегория раньше дублировала заголовок слово в слово
            («Контакты» / «Контакты»). Теперь она называет действие,
            а заголовок — раздел.
          */}
          <p className="text-label uppercase opacity-60">{messages.sections.contactsLabel}</p>
          <h2 className="text-h1 text-text-inverse mt-5">{messages.sections.contactsTitle}</h2>

          <dl className="mt-8">
            {lines.map((line, index) => (
              <div
                key={line.label}
                className={'border-border-inverse border-b py-4' + (index === 0 ? ' border-t' : '')}
              >
                {/*
                  opacity-50 давало 4.06:1 при норме 4.5. opacity-60 → 5.17:1.
                  Кегль и трекинг тоже поправлены: 13px/0.18em вместо
                  12px/0.28em — прописная кириллица на широкой разрядке
                  распадается на буквы.
                */}
                <dt className="text-meta uppercase opacity-60">{line.label}</dt>
                <dd className="mt-1.5 text-lg font-light">{line.value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <BookingButton size="lg" variant="primary" placement="contacts">
              {messages.actions.book}
            </BookingButton>
            <div className="flex gap-3">
              <Social href={settings.telegramBot} label={messages.popup.telegram}>
                <Send size={18} strokeWidth={1.5} aria-hidden="true" />
              </Social>
              <Social href={settings.vk} label={messages.popup.vk}>
                <ArrowUpRight size={18} strokeWidth={1.5} aria-hidden="true" />
              </Social>
            </div>
          </div>
        </div>

        <div className="md:col-span-7">
          <div className="bg-surface-inverse-raised flex aspect-4/3 flex-col items-center justify-center gap-5 rounded-lg p-6 text-center">
            <p className="text-small text-text-inverse opacity-80">{settings.address}</p>

            <div className="flex flex-wrap justify-center gap-4">
              <TrackedLink
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                goal={GOALS.mapOpen}
                params={{ kind: 'map' }}
                className="border-border-inverse-interactive text-small text-text-inverse hover:border-text-inverse inline-flex items-center gap-2 border-b transition-colors"
              >
                {messages.actions.showMap}
                <ArrowUpRight size={14} strokeWidth={1.5} aria-hidden="true" />
              </TrackedLink>

              <TrackedLink
                href={routeUrl}
                target="_blank"
                rel="noopener noreferrer"
                goal={GOALS.mapOpen}
                params={{ kind: 'route' }}
                className="border-border-inverse-interactive text-small text-text-inverse hover:border-text-inverse inline-flex items-center gap-2 border-b transition-colors"
              >
                {messages.actions.buildRoute}
                <Route size={14} strokeWidth={1.5} aria-hidden="true" />
              </TrackedLink>
            </div>
          </div>

          {/*
            Для загородной базы «как доехать» важнее адреса: гость хочет знать
            про дорогу, а не про индекс. Блок появляется, только когда заказчица
            заполнит directions — пустой заглушки на сайте не будет.
          */}
          {directions.length > 0 ? (
            <div className="border-border-inverse mt-8 border-t pt-6">
              <h3 className="text-meta text-text-inverse uppercase opacity-70">
                {messages.sections.directionsTitle}
              </h3>
              <ul className="text-small mt-4 space-y-2 opacity-90">
                {directions.map((step) => (
                  <li key={step.slice(0, 24)}>{step}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
