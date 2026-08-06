/**
 * Скелет на время стриминга. Повторяет ритм первого экрана, чтобы переход
 * не выглядел скачком: надкатегория, заголовок в две строки, лид, два CTA.
 */
export default function Loading() {
  return (
    <div className="bg-surface-soft" aria-busy="true" aria-live="polite">
      <div className="max-w-main gutter mx-auto flex min-h-[78svh] flex-col justify-end pt-32 pb-16">
        <div className="bg-border h-3 w-40 animate-pulse rounded-sm" />
        <div className="mt-6 space-y-4">
          <div className="bg-border h-14 w-[min(680px,90%)] animate-pulse rounded-sm" />
          <div className="bg-border h-14 w-[min(420px,70%)] animate-pulse rounded-sm" />
        </div>
        <div className="bg-border mt-6 h-5 w-[min(360px,80%)] animate-pulse rounded-sm" />
        <div className="mt-9 flex gap-3">
          <div className="bg-border h-14 w-56 animate-pulse rounded-md" />
          <div className="bg-border h-14 w-44 animate-pulse rounded-md" />
        </div>
      </div>
    </div>
  );
}
