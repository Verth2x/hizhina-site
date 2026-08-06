import Link from 'next/link';
import { getMessages, htmlLang, locales } from '@/i18n/config';
import { display, sans } from '@/styles/fonts';
import '@/styles/globals.css';

/**
 * Корневая 404.
 *
 * Раньше страница хардкодила русский текст, при том что ключи `notFound`
 * лежали в обоих словарях неиспользованными. Теперь она берёт их оттуда.
 *
 * Почему сразу оба языка: `not-found.tsx` не получает params, а на несуществующем
 * адресе локали в пути может не быть вовсе (`/foo`, `/de/bar`). Гадать по
 * заголовку Accept-Language означало бы сделать страницу динамической ради
 * одного экрана. Показать оба варианта — честнее и дешевле.
 */
export default function GlobalNotFound() {
  const primary = getMessages('ru');
  const secondary = getMessages('en');

  return (
    <html lang={htmlLang.ru} className={display.variable + ' ' + sans.variable}>
      <body>
        <main className="max-w-main section-y gutter mx-auto flex min-h-[70svh] flex-col justify-center">
          <p className="text-label text-text-muted tabular uppercase">404</p>

          <h1 className="text-h1 text-text-primary mt-6">{primary.notFound.title}</h1>
          <p className="max-w-prose text-lead text-text-secondary mt-4">{primary.notFound.body}</p>

          <div className="border-border mt-10 border-t pt-8">
            <h2 className="text-h3 text-text-secondary" lang={htmlLang.en}>
              {secondary.notFound.title}
            </h2>
            <p className="max-w-prose text-text-muted mt-2" lang={htmlLang.en}>
              {secondary.notFound.body}
            </p>
          </div>

          <nav aria-label={primary.common.mainNav} className="mt-10 flex flex-wrap gap-4">
            {locales.map((locale) => (
              <Link
                key={locale}
                href={'/' + locale}
                hrefLang={locale}
                className="border-border-interactive text-text-primary hover:bg-surface-sunk hover:border-border-strong inline-flex h-12 items-center rounded-md border px-6 font-medium transition-colors"
              >
                {getMessages(locale).notFound.home}
                <span className="text-text-muted ml-2 text-sm uppercase">{locale}</span>
              </Link>
            ))}
          </nav>
        </main>
      </body>
    </html>
  );
}
