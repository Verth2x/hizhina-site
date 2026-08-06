'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { defaultLocale, getMessages, isLocale, type Locale } from '@/i18n/config';

/**
 * Граница ошибки для локали. Раньше при сбое рендера пользователь видел
 * дефолтный экран Next — на английском и без единого способа связаться.
 *
 * Локаль берём из адреса: `error.tsx` не получает params, но путь всегда
 * начинается с сегмента локали.
 */
export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname();
  const segment = pathname.split('/')[1] ?? '';
  const locale: Locale = isLocale(segment) ? segment : defaultLocale;
  const messages = getMessages(locale);

  useEffect(() => {
    console.error('Ошибка рендера страницы:', error);
  }, [error]);

  return (
    <div className="max-w-main section-y gutter mx-auto pt-32">
      <h1 className="text-h1 text-text-primary">{messages.error.title}</h1>
      <p className="max-w-prose text-text-secondary mt-4">{messages.error.body}</p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button type="button" onClick={reset}>
          {messages.actions.retry}
        </Button>
        <Button asChild variant="ghost">
          <a href={'/' + locale}>{messages.actions.backHome}</a>
        </Button>
      </div>

      {error.digest ? (
        <p className="text-small text-text-muted tabular mt-8">
          {messages.error.digest}: {error.digest}
        </p>
      ) : null}
    </div>
  );
}
