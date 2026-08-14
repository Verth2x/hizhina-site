'use client';

import { useEffect, useState } from 'react';
import { Phone } from 'lucide-react';
import { BookingButton } from '@/components/booking/booking-button';
import { Button } from '@/components/ui/button';
import type { Messages } from '@/i18n/config';
import { GOALS } from '@/lib/analytics/goals';
import { track } from '@/lib/analytics/track';
import type { SiteSettings } from '@/lib/content/types';
import { cn } from '@/lib/utils/cn';

export function MobileCtaBar({
  messages,
  settings,
}: {
  messages: Messages;
  settings: SiteSettings;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Бар прибит к низу экрана и перекрывает последние строки футера.
  // Класс на <body> компенсирует его высоту, чтобы контент оставался читаемым.
  useEffect(() => {
    document.body.classList.toggle('has-mobile-cta', visible);
    return () => document.body.classList.remove('has-mobile-cta');
  }, [visible]);

  return (
    <div
      // Раньше бар размонтировался целиком, и порядок табуляции менялся
      // прямо во время прокрутки. Теперь он всегда в DOM, а скрытое состояние
      // выключается через inert: кнопки не попадают в фокус и не читаются
      // скринридером, но структура страницы остаётся стабильной.
      inert={!visible}
      aria-hidden={!visible}
      className={cn(
        'z-bar border-border bg-surface shadow-bar fixed inset-x-0 bottom-0 flex gap-2 border-t p-3',
        'pb-[max(0.75rem,env(safe-area-inset-bottom))] transition-transform duration-200 md:hidden',
        visible ? 'translate-y-0' : 'translate-y-full',
      )}
    >
      <BookingButton block placement="mobile-bar">
        {messages.actions.book}
      </BookingButton>
      {settings.phoneHref ? (
        <Button asChild variant="ghost" size="icon" aria-label={messages.popup.phone}>
          <a
            href={settings.phoneHref}
            onClick={() => track(GOALS.phoneClick, { placement: 'mobile-bar' })}
          >
            <Phone size={20} strokeWidth={1.5} aria-hidden="true" />
          </a>
        </Button>
      ) : null}
    </div>
  );
}
