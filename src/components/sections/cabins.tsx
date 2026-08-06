import { BookingButton } from '@/components/booking/booking-button';
import { intlLocale, type Locale, type Messages } from '@/i18n/config';
import type { SiteContent } from '@/lib/content/types';
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
  // На площадке один тип домика. Массив в контенте оставлен: если появится
  // второй тип, вернуть сетку карточек будет дешевле, чем менять модель данных.
  const cabin = content.cabins[0];
  if (!cabin) return null;

  const price = new Intl.NumberFormat(intlLocale[locale], {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(cabin.pricePerNight);

  const gallery = cabin.gallery ?? (cabin.image ? [cabin.image] : []);

  return (
    <section id="cabins" className="bg-surface-sunk section-y">
      <div className="max-w-main gutter mx-auto">
        {/*
          Шапка секции из референса: слева надкатегория и заголовок,
          справа — примечание, прижатое к базовой линии заголовка.
          На узких экранах колонка, примечание уходит вправо под заголовок.
        */}
        <div className="mb-10 flex flex-col gap-4 md:mb-16 md:flex-row md:items-end md:justify-between md:gap-8">
          <div>
            <p className="text-label text-text-secondary uppercase">
              {messages.sections.cabinsLabel}
            </p>
            <h2 className="text-h1 text-text-primary mt-8 max-w-[16ch]">
              {messages.sections.cabinsTitle}
            </h2>
          </div>
          <p className="text-small text-text-secondary max-w-[34ch] self-end font-light md:max-w-[26ch] md:text-right">
            {messages.sections.cabinsNote}
          </p>
        </div>

        <div className="grid items-start gap-9 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
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

          <div>
            <p className="text-meta text-text-secondary uppercase">{cabin.meta}</p>

            <p className="text-text-secondary mt-5 max-w-[42ch] font-light">{cabin.description}</p>

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
                <p className="text-small text-text-secondary mt-2 font-light">{cabin.priceUnit}</p>
              ) : null}
              {cabin.priceNote ? (
                <p className="text-small text-text-secondary mt-3.5 font-light">
                  {cabin.priceNote}
                </p>
              ) : null}

              <div className="mt-7 flex flex-wrap gap-3 [&>*]:max-sm:flex-1 [&>*]:max-sm:basis-full">
                <BookingButton placement="cabin" subject={{ code: cabin.id, label: cabin.name }}>
                  {messages.actions.bookCabin}
                </BookingButton>
                <CabinDetails cabin={cabin} messages={messages} priceLabel={price} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
