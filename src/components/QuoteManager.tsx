import { useEffect, useState } from 'react';
import type { Quote } from '../types';

interface QuoteManagerProps {
  open: boolean;
  quotes: Quote[];
  onClose: () => void;
  onAdd: (quote: Quote) => void;
  onDelete: (index: number) => void;
  onFeelLucky: () => void;
  t: any;
}

type WeightChoice = NonNullable<Quote['weight']>;

const WEIGHT_BADGE: Record<WeightChoice, string> = {
  auto: 'bg-neutral-100 text-neutral-500',
  hero: 'bg-amber-100 text-amber-700',
  bold: 'bg-neutral-900 text-white',
  light: 'bg-neutral-100 text-neutral-400',
};

/* =============================================================================
 * <QuoteManager> — sleek glassmorphism slide-out drawer
 * -----------------------------------------------------------------------------
 * Lets the user curate the deck live in the browser: roll a famous set with
 * "I Feel Lucky", append new quotes (text / author / weight), and delete any
 * entry. All edits flow up to <App>, which persists them to localStorage.
 * ========================================================================== */
export function QuoteManager({
  open,
  quotes,
  onClose,
  onAdd,
  onDelete,
  onFeelLucky,
  t,
}: QuoteManagerProps) {
  const [text, setText] = useState('');
  const [author, setAuthor] = useState('');
  const [weight, setWeight] = useState<WeightChoice>('auto');

  // Close on Escape while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onAdd({
      text: trimmed,
      author: author.trim() || 'Unknown',
      weight,
    });
    setText('');
    setAuthor('');
    setWeight('auto');
  };

  const weightOptions = [
    { value: 'auto' as const, label: t.quoteManager.weightOptions.auto },
    { value: 'hero' as const, label: t.quoteManager.weightOptions.hero },
    { value: 'bold' as const, label: t.quoteManager.weightOptions.bold },
    { value: 'light' as const, label: t.quoteManager.weightOptions.light },
  ];

  return (
    <div
      className={[
        'fixed inset-0 z-[60] print:hidden [font-family:Inter,ui-sans-serif,system-ui,sans-serif]',
        open ? '' : 'pointer-events-none',
      ].join(' ')}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={[
          'absolute inset-0 bg-neutral-900/30 backdrop-blur-sm transition-opacity duration-300',
          open ? 'opacity-100' : 'opacity-0',
        ].join(' ')}
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={t.quoteManager.title}
        className={[
          'absolute right-0 top-0 flex h-full w-full max-w-md flex-col',
          'border-l border-white/60 bg-white/80 shadow-[-12px_0_40px_-12px_rgba(0,0,0,0.35)] ring-1 ring-black/5 backdrop-blur-2xl',
          'transition-transform duration-300 ease-out',
          open ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/5 px-6 py-5">
          <div className="leading-tight">
            <h2 className="m-0 text-lg font-bold tracking-tight text-neutral-900">
              {t.quoteManager.title}
            </h2>
            <p className="m-0 text-xs font-medium text-neutral-400">
              {quotes.length === 1
                ? t.quoteManager.subtitleSingular.replace('{count}', String(quotes.length))
                : t.quoteManager.subtitlePlural.replace('{count}', String(quotes.length))}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-neutral-500 transition hover:bg-neutral-900/5 hover:text-neutral-900"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* I Feel Lucky */}
          <button
            type="button"
            onClick={onFeelLucky}
            className="mb-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 py-3 text-sm font-bold text-white shadow-md transition hover:from-amber-500 hover:to-amber-600 active:scale-[0.98]"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3l2.09 4.26L19 8l-3.5 3.4.83 4.85L12 14l-4.33 2.25L8.5 11.4 5 8l4.91-.74z" />
            </svg>
            {t.quoteManager.feelLucky}
          </button>

          {/* Add form */}
          <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
              {t.quoteManager.addQuoteLabel}
            </span>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t.quoteManager.quotePlaceholder}
              rows={3}
              className="w-full resize-none rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-800 shadow-sm outline-none transition placeholder:text-neutral-400 hover:border-neutral-300 focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10"
            />
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder={t.quoteManager.authorPlaceholder}
              className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-800 shadow-sm outline-none transition placeholder:text-neutral-400 hover:border-neutral-300 focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10"
            />
            <div className="relative">
              <select
                value={weight}
                onChange={(e) => setWeight(e.target.value as WeightChoice)}
                className="w-full cursor-pointer appearance-none rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm font-medium text-neutral-800 shadow-sm outline-none transition hover:border-neutral-300 focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10"
              >
                {weightOptions.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <path d="M6 8l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <button
              type="submit"
              disabled={!text.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-neutral-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              {t.quoteManager.addQuoteBtn}
            </button>
          </form>

          {/* Quote list */}
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
            {t.quoteManager.currentDeckLabel}
          </span>
          <ul className="mt-3 flex flex-col gap-2">
            {quotes.length === 0 && (
              <li className="rounded-xl border border-dashed border-neutral-300 px-3.5 py-6 text-center text-sm text-neutral-400">
                {t.quoteManager.emptyState}
              </li>
            )}
            {quotes.map((q, index) => {
              const badge = WEIGHT_BADGE[q.weight ?? 'auto'];
              return (
                <li
                  key={`${q.author}-${index}`}
                  className="group flex items-start gap-3 rounded-xl border border-neutral-200 bg-white/70 px-3.5 py-3 shadow-sm transition hover:border-neutral-300"
                >
                  <div className="min-w-0 flex-1">
                    <p className="m-0 line-clamp-2 text-sm text-neutral-800">{q.text}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="truncate text-xs font-medium text-neutral-400">
                        {q.author}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${badge}`}>
                        {t.quoteManager.weightOptions[q.weight ?? 'auto']}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDelete(index)}
                    aria-label="Delete quote"
                    className="flex h-8 w-8 flex-none items-center justify-center rounded-lg text-neutral-400 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18M19 6l-.84 12.06A2 2 0 0 1 16.16 20H7.84a2 2 0 0 1-2-1.94L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v5M14 11v5" />
                    </svg>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>
    </div>
  );
}
