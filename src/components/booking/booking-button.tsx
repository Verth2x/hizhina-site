'use client';

import { Button } from '@/components/ui/button';
import type { BookingSubject } from '@/lib/content/types';
import { useBooking, type BookingPlacement } from './booking-provider';

type Props = React.ComponentProps<typeof Button> & {
  subject?: BookingSubject;
  placement?: BookingPlacement;
};

export function BookingButton({ subject, placement, children, onClick, ...props }: Props) {
  const { open } = useBooking();

  // onClick вынесен из ...props намеренно: при спреде он затирал бы
  // внутренний обработчик и кнопка переставала открывать попап.
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    open(subject, placement);
  };

  return (
    <Button type="button" onClick={handleClick} {...props}>
      {children}
    </Button>
  );
}
