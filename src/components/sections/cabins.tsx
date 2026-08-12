import { BookingButton } from '@/components/booking/booking-button';
import { intlLocale, type Locale, type Messages } from '@/i18n/config';
import type { SiteContent } from '@/lib/content/types';
import { cn } from '@/lib/utils/cn';
import { CabinDetails } from './cabin-details';
import { CabinGallery } from './cabin-gallery';

export function Cabins({
  content,
  messages,
  locale,
}: {
  content: SiteContent;
  messages: Messages;
  locale: Locale;
}) {
  // Типов домиков может быть несколько: раньше здесь брался только первый
  // элемент массива, и вторая запись из Directus не попадала в вёрстку.
  if (content.cabins.length === 0) return null;

  const formatPrice = (value: number) =>
    new Intl.NumberFormat(intlLocale[locale], {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <section id="cabins" className="bg-surface-sunk section-y">
      <div className="max-w-main gutter mx-auto">
        {/*
          Шапка секции: слева надкатегория и заголовок, справа примечание,
          прижатое к базовой линии заголовка.
        */}
        <div className="mb-10 flex flex-col gap-4 md:mb-16 md:flex-row md:items-end md:justify-between md:gap-8">
          <div>
            <p className="text-label text-text-secondary uppercase">
              {messages.sections.cabinsLabel}
            </p>
            <h2 className="text-h1 text-text-primary mt-5 max-w-[16ch] md:mt-8">
              {messages.sections.cabinsTitle}
            </h2>
          </div>
          <p className="text-small text-text-secondary max-w-[34ch] self-start font-light md:max-w-[26ch] md:self-end md:text-right">
            {messages.sections.cabinsNote}
          </p>
        </div>

        <div className="flex flex-col gap-14 md:gap-20">
          {content.cabins.map((cabin, index) => {
            const gallery = cabin.gallery ?? (cabin.image ? [cabin.image] : []);
            const price = formatPrice(cabin.pricePerNight);

            return (
              <article
                key={cabin.id}
                className={cn(
                  'grid items-start gap-9 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-20',
                  // Разделитель только между домиками, не перед первым.
                  index > 0 && 'border-border border-t pt-14 md:pt-20',
                )}
              >
                <CabinGallery
                  images={gallery}
                  alt={cabin.name}
                  labels={{
                    placeholder: messages.common.photoSoon,
                    prev: messages.actions.prevPhoto,
                    next: messages.actions.nextPhoto,
                    thumbTemplate: messages.common.photoOf,
                  }}
                />

                <div className="min-w-0">
                  {/* Название домика: при одном типе было избыточно,
                      при нескольких — единственный способ их различить. */}
                  <h3 className="text-h3 text-text-primary">{cabin.name}</h3>

                  <p className="text-meta text-text-secondary mt-3 uppercase">{cabin.meta}</p>

                  <p className="text-text-secondary mt-5 max-w-[42ch] font-light">
                    {cabin.description}
                  </p>

                  {cabin.features && cabin.features.length > 0 ? (
                    <ul className="mt-8 grid gap-2.5 sm:grid-cols-2 sm:gap-x-6">
                      {cabin.features.map((feature) => (
                        <li key={feature} className="text-small relative pl-[18px] font-light">
                          <span
                            aria-hidden="true"
                            className="bg-accent absolute top-[9px] left-0 size-[5px] rounded-full"
                          />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  <div className="border-border mt-9 border-t pt-7">
                    <p className="font-display text-price tabular text-text-primary">{price}</p>
                    {cabin.priceUnit ? (
                      <p className="text-small text-text-secondary mt-2 font-light">
                        {cabin.priceUnit}
                      </p>
                    ) : null}
                    {cabin.priceNote ? (
                      <p className="text-small text-text-secondary mt-3.5 font-light">
                        {cabin.priceNote}
                      </p>
                    ) : null}

                    <div className="mt-7 flex flex-wrap gap-3 [&>*]:max-sm:flex-1 [&>*]:max-sm:basis-full">
                      <BookingButton
                        placement="cabin"
                        subject={{ code: cabin.id, label: cabin.name }}
                      >
                        {messages.actions.bookCabin}
                      </BookingButton>
                      <CabinDetails cabin={cabin} messages={messages} priceLabel={price} />
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
