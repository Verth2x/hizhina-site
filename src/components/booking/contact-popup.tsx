'use client';

import { MessageCircle, Phone, Send, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import type { Messages } from '@/i18n/config';
import { GOALS, type Goal } from '@/lib/analytics/goals';
import { track } from '@/lib/analytics/track';
import { telegramBookingUrl } from '@/lib/booking/telegram';
import type { SiteSettings } from '@/lib/content/types';
import { useBooking } from './booking-provider';

export function ContactPopup({
  settings,
  messages,
}: {
  settings: SiteSettings;
  messages: Messages;
}) {
  const { isOpen, close, subject, placement } = useBooking();
  const t = messages.popup;

  const botUrl = telegramBookingUrl(settings.telegramBot, subject);

  // Заявка уходит в мессенджер, то есть за пределы сайта. Клик по каналу —
  // последняя точка, где мы вообще видим пользователя, поэтому без этого
  // события нельзя сказать, какой канал приносит брони.
  const channel = (goal: Goal) => () =>
    track(goal, {
      ...(subject ? { subject: subject.code } : {}),
      ...(placement ? { placement } : {}),
    });

  return (
    <Modal
      open={isOpen}
      onOpenChange={(next) => {
        if (!next) close();
      }}
      title={t.title}
      description={t.description}
      closeLabel={messages.actions.close}
    >
      {subject ? (
        <p className="bg-surface-sunk text-small text-text-secondary mb-6 rounded-sm px-4 py-3">
          {t.context}: <span className="text-text-primary">{subject.label}</span>
        </p>
      ) : null}

      <div className="flex flex-col gap-3">
        <Button asChild size="lg" block>
          <a
            href={botUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={channel(GOALS.channelTelegram)}
          >
            <Send size={20} strokeWidth={1.5} aria-hidden="true" />
            <span className="flex flex-col items-start leading-tight">
              <span>{t.telegram}</span>
              <span className="text-small font-normal opacity-80">{t.telegramHint}</span>
            </span>
          </a>
        </Button>

        <div className="grid gap-3 sm:grid-cols-3">
          <Button asChild variant="ghost" block>
            <a
              href={settings.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              onClick={channel(GOALS.channelWhatsapp)}
            >
              <MessageCircle size={20} strokeWidth={1.5} aria-hidden="true" />
              {t.whatsapp}
            </a>
          </Button>
          <Button asChild variant="ghost" block>
            <a href={settings.phoneHref} onClick={channel(GOALS.channelPhone)}>
              <Phone size={20} strokeWidth={1.5} aria-hidden="true" />
              {t.phone}
            </a>
          </Button>
          <Button asChild variant="ghost" block>
            <a
              href={settings.vk}
              target="_blank"
              rel="noopener noreferrer"
              onClick={channel(GOALS.channelVk)}
            >
              <Users size={20} strokeWidth={1.5} aria-hidden="true" />
              {t.vk}
            </a>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
