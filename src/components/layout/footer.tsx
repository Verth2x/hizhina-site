import Link from 'next/link';
import type { Locale, Messages } from '@/i18n/config';
import type { SiteContent } from '@/lib/content/types';
import { CopyrightYear } from './copyright-year';

/** Год запуска базы — нижняя граница копирайта. */
const SINCE = 2024;

export function Footer({
  locale,
  messages,
  content,
}: {
  locale: Locale;
  messages: Messages;
  content: SiteContent;
}) {
  const { settings, brand } = content;
  const buildYear = new Date().getFullYear();

  return (
    <footer className="bg-surface-deep text-text-inverse">
      <div className="max-w-main section-y-tight gutter mx-auto">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="font-brand text-h3">{brand.wordmark}</p>
            <p className="text-small mt-2 opacity-75">{settings.address}</p>
          </div>

          <div className="text-small flex flex-col gap-2">
            {settings.phoneHref ? (
              <a href={settings.phoneHref} className="opacity-85 hover:opacity-100">
                {settings.phone}
              </a>
            ) : (
              <span className="opacity-85">{settings.phone}</span>
            )}
            <a href={'mailto:' + settings.email} className="opacity-85 hover:opacity-100">
              {settings.email}
            </a>
            {/*
              Раньше здесь стоял <span> без ссылки — то есть политика была
              заявлена, но недоступна. Теперь это настоящая страница.
            */}
            <Link
              href={'/' + locale + '/privacy'}
              className="underline decoration-1 underline-offset-4 opacity-85 hover:opacity-100"
            >
              {messages.footer.privacy}
            </Link>
          </div>
        </div>

        {/*
          Реквизиты ИП. Для предпринимателя, публикующего цены, это обычная
          практика: гость видит, с кем именно заключает договор оказания услуг.
        */}
        <div className="border-border-inverse text-small mt-10 flex flex-col gap-2 border-t pt-6 opacity-70 md:flex-row md:items-center md:justify-between">
          <p>
            © <CopyrightYear since={SINCE} buildYear={buildYear} /> {brand.legalName}.{' '}
            {messages.footer.rights}
          </p>
          <p className="tabular">
            {messages.footer.inn} {settings.inn} · {messages.footer.ogrnip} {settings.ogrnip}
          </p>
        </div>
      </div>
    </footer>
  );
}
