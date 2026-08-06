'use client';

import { useCallback, useId, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Menu, Phone, X } from 'lucide-react';
import { useBooking } from '@/components/booking/booking-provider';
import { Button } from '@/components/ui/button';
import type { Messages } from '@/i18n/config';
import { GOALS } from '@/lib/analytics/goals';
import { track } from '@/lib/analytics/track';
import type { SiteSettings } from '@/lib/content/types';
import type { NavItem } from './header';

export function MobileNav({
  items,
  messages,
  settings,
  wordmark,
}: {
  items: NavItem[];
  messages: Messages;
  settings: SiteSettings;
  wordmark: string;
}) {
  const [open, setOpen] = useState(false);
  const { open: openBooking } = useBooking();
  const bookingPending = useRef(false);
  const panelId = useId();

  const close = useCallback(() => setOpen(false), []);

  // Две модалки одновременно открывать нельзя: закрываясь, Radix возвращает
  // фокус на свой триггер и отнимает его у только что смонтированного попапа
  // бронирования. Поэтому запоминаем намерение, закрываем панель и открываем
  // попап уже в onCloseAutoFocus, когда первый диалог размонтирован.
  const requestBooking = useCallback(() => {
    bookingPending.current = true;
    setOpen(false);
  }, []);

  const handleCloseAutoFocus = useCallback(
    (event: Event) => {
      if (!bookingPending.current) return;
      bookingPending.current = false;
      event.preventDefault();
      openBooking(undefined, 'mobile-nav');
    },
    [openBooking],
  );

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={messages.common.menu}
          aria-expanded={open}
          aria-controls={panelId}
          className="lg:hidden"
        >
          <Menu size={20} strokeWidth={1.5} aria-hidden="true" />
        </Button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="bg-overlay z-overlay data-[state=open]:animate-fade-in fixed inset-0 lg:hidden" />
        <Dialog.Content
          id={panelId}
          aria-describedby={undefined}
          onCloseAutoFocus={handleCloseAutoFocus}
          className="z-modal bg-surface shadow-modal data-[state=open]:animate-slide-in fixed inset-y-0 right-0 flex w-[min(360px,88vw)] flex-col lg:hidden"
        >
          <div className="gutter flex h-18 shrink-0 items-center justify-between">
            <Dialog.Title className="font-display text-h3 text-text-primary">
              {wordmark}
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" aria-label={messages.actions.close}>
                <X size={20} strokeWidth={1.5} aria-hidden="true" />
              </Button>
            </Dialog.Close>
          </div>

          <nav
            aria-label={messages.common.mainNav}
            className="gutter flex-1 overflow-y-auto overscroll-contain"
          >
            <ul className="flex flex-col">
              {items.map((item) => (
                <li key={item.href}>
                  {/*
                    Закрываем панель до якорного перехода: иначе браузер
                    проскроллит документ под открытым оверлеем и пользователь
                    останется смотреть на ту же панель.
                  */}
                  <a
                    href={item.href}
                    onClick={close}
                    className="border-border text-lead text-text-primary hover:text-action block border-b py-4 transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="border-border gutter shrink-0 border-t py-5">
            <Button type="button" block size="lg" onClick={requestBooking}>
              {messages.actions.book}
            </Button>
            <a
              href={settings.phoneHref}
              onClick={() => {
                track(GOALS.phoneClick, { placement: 'mobile-nav' });
                close();
              }}
              className="text-small text-text-secondary mt-4 flex items-center justify-center gap-2"
            >
              <Phone size={16} strokeWidth={1.5} aria-hidden="true" />
              {settings.phone}
            </a>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
