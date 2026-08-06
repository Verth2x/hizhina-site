import { cn } from '@/lib/utils/cn';

export function Card({ className, ...props }: React.ComponentProps<'article'>) {
  return (
    <article
      className={cn(
        'border-border bg-surface-raised flex h-full flex-col overflow-hidden rounded-lg border',
        className,
      )}
      {...props}
    />
  );
}

export function CardBody({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex flex-1 flex-col p-6', className)} {...props} />;
}

export function CardTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="font-display text-h3 text-text-primary">{children}</h3>;
}

export function CardMeta({ children }: { children: React.ReactNode }) {
  return <p className="text-small text-text-muted mt-1">{children}</p>;
}

export function CardPrice({
  amount,
  unit,
  locale,
  note,
}: {
  amount: number;
  unit: string;
  locale: string;
  note?: string;
}) {
  const formatted = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(amount);

  return (
    <div className="mt-4">
      <p className="font-display text-price tabular text-text-primary">
        {formatted}
        <span className="font-sans text-small text-text-secondary font-normal"> / {unit}</span>
      </p>
      {note ? <p className="text-small text-text-muted mt-1">{note}</p> : null}
    </div>
  );
}

export function CardActions({ children }: { children: React.ReactNode }) {
  return <div className="mt-6 flex flex-col gap-2">{children}</div>;
}
