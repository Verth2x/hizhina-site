import { BookingButton } from '@/components/booking/booking-button';
import { Card, CardActions, CardBody, CardMeta, CardPrice, CardTitle } from '@/components/ui/card';
import { Media } from '@/components/ui/media';
import { intlLocale, type Locale, type Messages } from '@/i18n/config';
import type { SiteContent } from '@/lib/content/types';

export function Cabins({
  content,
  messages,
  locale,
}: {
  content: SiteContent;
  messages: Messages;
  locale: Locale;
}) {
  return (
    <section id="cabins" className="bg-surface-sunk section-y">
      <div className="max-w-main gutter mx-auto">
        <h2 className="text-h1 text-text-primary">{messages.sections.cabinsTitle}</h2>
        <p className="max-w-prose text-lead text-text-secondary mt-3">
          {messages.sections.cabinsLead}
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {content.cabins.map((cabin) => (
            <Card key={cabin.id}>
              <Media
                alt={cabin.name}
                source={cabin.image}
                ratio="4/3"
                placeholderLabel={messages.common.photoSoon}
                sizes="(min-width: 1024px) 30vw, (min-width: 640px) 48vw, 100vw"
              />
              <CardBody>
                <CardTitle>{cabin.name}</CardTitle>
                <CardMeta>{cabin.meta}</CardMeta>
                <p className="text-small text-text-secondary mt-3">{cabin.description}</p>
                <CardPrice
                  amount={cabin.pricePerNight}
                  unit={messages.common.perNight}
                  locale={intlLocale[locale]}
                  note={cabin.priceNote}
                />
                <CardActions>
                  <BookingButton
                    variant="secondary"
                    placement="cabin"
                    subject={{ code: cabin.id, label: cabin.name }}
                    block
                  >
                    {messages.actions.check}
                  </BookingButton>
                </CardActions>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
