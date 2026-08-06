'use client';

import { useState } from 'react';
import { BookingButton } from '@/components/booking/booking-button';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import type { Messages } from '@/i18n/config';
import type { Cabin } from '@/lib/content/types';

/**
 * Кнопка «Подробнее» и модалка с условиями проживания.
 *
 * В референсе это отдельный экран с планировкой и двумя списками. Здесь —
 * только то, для чего есть данные: условия. Придумывать планировку домика,
 * которого я не видел, было бы хуже, чем её отсутствие.
 */
export function CabinDetails({
  cabin,
  messages,
  priceLabel,
}: {
  cabin: Cabin;
  messages: Messages;
  priceLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const rules = cabin.rules ?? [];

  if (rules.length === 0) return null;

  return (
    <>
      <Button type="button" variant="ghost" onClick={() => setOpen(true)}>
        {messages.actions.details}
      </Button>

      <Modal
        open={open}
        onOpenChange={setOpen}
        title={cabin.name}
        description={cabin.meta}
        closeLabel={messages.actions.close}
      >
        <p className="text-text-secondary font-light">{cabin.description}</p>

        <h3 className="text-meta text-text-muted mt-8 uppercase">
          {messages.sections.cabinRulesTitle}
        </h3>
        <ul className="mt-4 grid gap-2.5">
          {rules.map((rule) => (
            <li key={rule} className="text-small relative pl-[18px] font-light">
              <span
                aria-hidden="true"
                className="bg-accent absolute top-[9px] left-0 size-[5px] rounded-full"
              />
              {rule}
            </li>
          ))}
        </ul>

        <div className="border-border mt-8 flex flex-wrap items-end justify-between gap-4 border-t pt-6">
          <p className="font-display text-h3 tabular text-text-primary">{priceLabel}</p>
          <BookingButton
            placement="cabin"
            subject={{ code: cabin.id, label: cabin.name }}
            onClick={() => setOpen(false)}
          >
            {messages.actions.bookCabin}
          </BookingButton>
        </div>
      </Modal>
    </>
  );
}
