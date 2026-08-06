'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { locales, type Locale } from '@/i18n/config';
import { GOALS } from '@/lib/analytics/goals';
import { track } from '@/lib/analytics/track';
import { cn } from '@/lib/utils/cn';

export function LangSwitcher({ current, label }: { current: Locale; label: string }) {
  const pathname = usePathname();
  const rest = pathname.replace(/^\/(ru|en)/, '') || '';

  return (
    <nav aria-label={label} className="text-small flex items-center gap-1">
      {locales.map((locale) => (
        <Link
          key={locale}
          href={'/' + locale + rest}
          hrefLang={locale}
          // Ссылка ведёт на текущую страницу в другой локали, поэтому для
          // активного пункта корректен именно `page`, а не `true`:
          // скринридер объявит «текущая страница», а не «текущий элемент».
          aria-current={locale === current ? 'page' : undefined}
          onClick={() => {
            if (locale !== current) track(GOALS.localeSwitch, { to: locale });
          }}
          className={cn(
            'rounded-sm px-2 py-1 uppercase transition-colors',
            locale === current
              ? 'text-text-primary font-medium'
              : 'text-text-muted hover:text-text-primary',
          )}
        >
          {locale}
        </Link>
      ))}
    </nav>
  );
}
