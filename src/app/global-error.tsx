'use client';

import { getMessages, htmlLang } from '@/i18n/config';
import { display, sans } from '@/styles/fonts';
import '@/styles/globals.css';

/**
 * Последний рубеж: ошибка в корневом лейауте, когда [locale]/error.tsx уже
 * не смонтируется. Обязан рендерить собственные <html> и <body>.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const primary = getMessages('ru');
  const secondary = getMessages('en');

  return (
    <html lang={htmlLang.ru} className={display.variable + ' ' + sans.variable}>
      <body>
        <main className="max-w-main section-y gutter mx-auto flex min-h-[70svh] flex-col justify-center">
          <h1 className="text-h1 text-text-primary">{primary.error.title}</h1>
          <p className="max-w-prose text-text-secondary mt-4">{primary.error.body}</p>

          <p className="max-w-prose text-text-muted mt-6" lang={htmlLang.en}>
            {secondary.error.body}
          </p>

          <div className="mt-8">
            <button
              type="button"
              onClick={reset}
              className="bg-action hover:bg-action-hover focus-visible:outline-focus inline-flex h-12 cursor-pointer items-center rounded-md px-6 font-medium text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {primary.actions.retry}
            </button>
          </div>

          {error.digest ? (
            <p className="text-small text-text-muted tabular mt-8">
              {primary.error.digest}: {error.digest}
            </p>
          ) : null}
        </main>
      </body>
    </html>
  );
}
