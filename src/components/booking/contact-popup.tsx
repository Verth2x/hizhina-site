'use client';

import { MessageCircle, Phone, Send, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import type { Messages } from '@/i18n/config';
import { GOALS, type Goal } from '@/lib/analytics/goals';
import { track } from '@/lib/analytics/track';
import { telegramAppUrl, telegramBookingUrl } from '@/lib/booking/telegram';
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

  // Адрес бота проходит проверку схемы при маппинге и может её не пережить,
  // если в CMS записали что-то постороннее. Тогда кнопки Telegram просто нет:
  // мёртвая главная кнопка в попапе брони хуже, чем три оставшихся канала.
  const botUrl = settings.telegramBot
    ? telegramBookingUrl(settings.telegramBot, subject)
    : undefined;
  const botAppUrl = settings.telegramBot ? telegramAppUrl(settings.telegramBot, subject) : null;

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
        {botUrl ? (
        <Button asChild size="lg" block>
          <a
            href={botUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(event) => {
              channel(GOALS.channelTelegram)();
              // https-ссылка открывает чат, но Start приходится жать руками.
              // tg:// установленный клиент перехватывает и запускает бота сам.
              // Пробуем схему первой; если приложения нет, ничего не произойдёт,
              // и через 400 мс сработает обычный переход по href.
              if (!botAppUrl) return;
              event.preventDefault();
              const fallback = window.setTimeout(() => {
                window.open(botUrl, '_blank', 'noopener,noreferrer');
              }, 400);
              // Уход со страницы означает, что клиент перехватил ссылку —
              // запасной переход тогда не нужен.
              const cancel = () => window.clearTimeout(fallback);
              window.addEventListener('pagehide', cancel, { once: true });
              window.addEventListener('blur', cancel, { once: true });
              window.location.href = botAppUrl;
            }}
          >
            <Send size={20} strokeWidth={1.5} aria-hidden="true" />
            <span className="flex flex-col items-start leading-tight">
              <span>{t.telegram}</span>
              <span className="text-small font-normal opacity-80">{t.telegramHint}</span>
            </span>
          </a>
        </Button>
        ) : null}

        {/*
          Колонок ровно столько, сколько каналов уцелело после проверки схем:
          жёсткий grid-cols-3 оставлял бы дыру на месте отброшенной ссылки.
        */}
        <div className="grid auto-cols-fr gap-3 sm:grid-flow-col">
          {settings.whatsapp ? (
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
          ) : null}
          {settings.phoneHref ? (
            <Button asChild variant="ghost" block>
              <a href={settings.phoneHref} onClick={channel(GOALS.channelPhone)}>
                <Phone size={20} strokeWidth={1.5} aria-hidden="true" />
                {t.phone}
              </a>
            </Button>
          ) : null}
          {settings.vk ? (
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
          ) : null}
        </div>
      </div>
    </Modal>
  );
}
