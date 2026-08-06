import { intlLocale, type Locale, type Messages } from '@/i18n/config';
import type { Extra } from '@/lib/content/types';

export function Extras({
  extras,
  messages,
  locale,
}: {
  extras: Extra[];
  messages: Messages;
  locale: Locale;
}) {
  const format = (value: number) =>
    new Intl.NumberFormat(intlLocale[locale], {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <section id="extras" className="section-y-tight">
      <div className="max-w-main gutter mx-auto">
        <h2 className="text-h2 text-text-primary">{messages.sections.extrasTitle}</h2>
        <p className="text-text-secondary mt-2">{messages.sections.extrasLead}</p>
        <ul className="text-text-secondary mt-6 flex flex-wrap gap-x-6 gap-y-2">
          {extras.map((extra) => (
            <li key={extra.id}>
              {extra.name} —{' '}
              <span className="tabular text-text-primary">{format(extra.price)}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
