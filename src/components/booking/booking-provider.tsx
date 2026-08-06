'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { GOALS } from '@/lib/analytics/goals';
import { track } from '@/lib/analytics/track';
import type { BookingSubject } from '@/lib/content/types';

/** Откуда открыли попап — нужно, чтобы понять, какой CTA реально работает. */
export type BookingPlacement =
  'header' | 'hero' | 'cabin' | 'service' | 'contacts' | 'mobile-bar' | 'mobile-nav';

type BookingContextValue = {
  open: (subject?: BookingSubject, placement?: BookingPlacement) => void;
  close: () => void;
  isOpen: boolean;
  subject?: BookingSubject;
  placement?: BookingPlacement;
};

const BookingContext = createContext<BookingContextValue | null>(null);

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [subject, setSubject] = useState<BookingSubject | undefined>(undefined);
  const [placement, setPlacement] = useState<BookingPlacement | undefined>(undefined);

  const open = useCallback((next?: BookingSubject, from?: BookingPlacement) => {
    setSubject(next);
    setPlacement(from);
    setIsOpen(true);
    track(GOALS.bookingOpen, {
      ...(next ? { subject: next.code } : {}),
      ...(from ? { placement: from } : {}),
    });
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo(
    () => ({ open, close, isOpen, subject, placement }),
    [open, close, isOpen, subject, placement],
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBooking must be used inside BookingProvider');
  return ctx;
}
