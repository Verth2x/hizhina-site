'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Phone } from 'lucide-react';
import { BookingButton } from '@/components/booking/booking-button';
import type { Locale, Messages } from '@/i18n/config';
import { GOALS } from '@/lib/analytics/goals';
import { track } from '@/lib/analytics/track';
import type { SiteSettings } from '@/lib/content/types';
import { cn } from '@/lib/utils/cn';
import { LangSwitcher } from './lang-switcher';
import { MobileNav } from './mobile-nav';

export type NavItem = { href: string; label: string };

export function Header({
  locale,
  messages,
  settings,
  wordmark,
}: {
  locale: Locale;
  messages: Messages;
  settings: SiteSettings;
  wordmark: string;
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const nav: NavItem[] = [
    { href: '#cabins', label: messages.nav.cabins },
    { href: '#furako', label: messages.nav.furako },
    { href: '#banya', label: messages.nav.banya },
    { href: '#common-house', label: messages.nav.commonHouse },
    { href: '#about', label: messages.nav.about },
    { href: '#contacts', label: messages.nav.contacts },
  ];

  return (
    <header
      className={cn(
        'z-sticky fixed inset-x-0 top-0 transition-colors duration-200',
        scrolled ? 'bg-surface shadow-pop' : 'header-over-hero',
      )}
    >
      <div className="gutter flex h-18 w-full items-center justify-between gap-6">
        <Link
          href={'/' + locale}
          aria-label={messages.common.toHome}
          className="font-brand text-h3 text-text-primary"
        >
          {wordmark}
        </Link>

        <nav aria-label={messages.common.mainNav} className="hidden lg:flex lg:flex-1 lg:justify-center lg:gap-8 xl:gap-10">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-small text-text-secondary hover:text-text-primary transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LangSwitcher current={locale} label={messages.common.langSwitch} />
          {settings.phoneHref ? (
            <a
              href={settings.phoneHref}
              onClick={() => track(GOALS.phoneClick, { placement: 'header' })}
              className="text-small text-text-secondary hover:text-text-primary hidden items-center gap-2 md:flex"
            >
              <Phone size={16} strokeWidth={1.5} aria-hidden="true" />
              {settings.phone}
            </a>
          ) : null}
          <BookingButton placement="header" className="hidden md:inline-flex">
            {messages.actions.book}
          </BookingButton>
          <MobileNav items={nav} messages={messages} settings={settings} wordmark={wordmark} />
        </div>
      </div>
    </header>
  );
}
