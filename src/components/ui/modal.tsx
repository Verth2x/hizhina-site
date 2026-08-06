'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from './button';

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  closeLabel,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  closeLabel: string;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-overlay z-overlay data-[state=open]:animate-fade-in fixed inset-0" />
        <Dialog.Content
          className={cn(
            'z-modal shadow-modal bg-surface-raised fixed flex flex-col overflow-hidden',
            'inset-x-0 bottom-0 max-h-[92dvh] rounded-t-xl',
            'md:inset-x-auto md:top-1/2 md:bottom-auto md:left-1/2',
            'md:max-h-[86dvh] md:w-[min(720px,92vw)] md:rounded-xl',
            'md:-translate-x-1/2 md:-translate-y-1/2',
            'data-[state=open]:animate-slide-up md:data-[state=open]:animate-fade-in',
          )}
        >
          <header className="border-border flex items-start justify-between gap-4 border-b p-6">
            <div>
              <Dialog.Title className="font-display text-h2 text-text-primary">
                {title}
              </Dialog.Title>
              {description ? (
                <Dialog.Description className="text-body text-text-secondary mt-2">
                  {description}
                </Dialog.Description>
              ) : (
                <Dialog.Description className="sr-only">{title}</Dialog.Description>
              )}
            </div>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" aria-label={closeLabel}>
                <X size={20} strokeWidth={1.5} aria-hidden="true" />
              </Button>
            </Dialog.Close>
          </header>
          <div className="overflow-y-auto overscroll-contain p-6">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
