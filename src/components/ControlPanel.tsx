import type { PaperKey, Orientation } from '../types';

interface ControlPanelProps {
  paper: PaperKey;
  orientation: Orientation;
  showAuthor: boolean;
  onPaperChange: (paper: PaperKey) => void;
  onOrientationChange: (orient: Orientation) => void;
  onShowAuthorChange: (show: boolean) => void;
  onManageQuotes: () => void;
  onPrint: () => void;
}

const PAPER_OPTIONS: Array<{ value: PaperKey; label: string; dims: string }> = [
  { value: 'A3', label: 'A3', dims: '297 × 420 mm' },
  { value: 'A4', label: 'A4', dims: '210 × 297 mm' },
  { value: 'A5', label: 'A5', dims: '148 × 210 mm' },
  { value: 'Letter', label: 'Letter', dims: '8.5 × 11 in' },
  { value: 'Legal', label: 'Legal', dims: '8.5 × 14 in' },
];

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
      {children}
    </span>
  );
}

export function ControlPanel({
  paper,
  orientation,
  showAuthor,
  onPaperChange,
  onOrientationChange,
  onShowAuthorChange,
  onManageQuotes,
  onPrint,
}: ControlPanelProps) {
  return (
    <aside
      id="controls"
      className="controls fixed right-5 top-5 z-50 w-72 select-none rounded-2xl border border-white/60 bg-white/75 p-5 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.35)] ring-1 ring-black/5 backdrop-blur-xl opacity-20 hover:opacity-100 transition-opacity duration-300 ease-in-out [font-family:Inter,ui-sans-serif,system-ui,sans-serif]"
    >
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900 text-sm font-bold text-white shadow-sm">
          QC
        </div>
        <div className="leading-tight">
          <h1 className="m-0 text-base font-bold tracking-tight text-neutral-900">
            Quote Cloud
          </h1>
          <p className="m-0 text-xs font-medium text-neutral-400">
            AI Layout Studio
          </p>
        </div>
      </div>

      {/* Paper */}
      <div className="mb-4 flex flex-col gap-2">
        <FieldLabel>Paper</FieldLabel>
        <div className="relative">
          <select
            value={paper}
            onChange={(e) => onPaperChange(e.target.value as PaperKey)}
            className="w-full cursor-pointer appearance-none rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm font-medium text-neutral-800 shadow-sm outline-none transition hover:border-neutral-300 hover:bg-neutral-50 focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10"
          >
            {PAPER_OPTIONS.map(({ value, label, dims }) => (
              <option key={value} value={value}>
                {label} · {dims}
              </option>
            ))}
          </select>
          <svg
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path d="M6 8l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Orientation segmented control */}
      <div className="mb-4 flex flex-col gap-2">
        <FieldLabel>Orientation</FieldLabel>
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-neutral-100 p-1">
          {(['portrait', 'landscape'] as Orientation[]).map((value) => {
            const active = orientation === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => onOrientationChange(value)}
                className={[
                  'flex cursor-pointer items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold capitalize transition',
                  active
                    ? 'bg-white text-neutral-900 shadow-sm hover:bg-neutral-50'
                    : 'text-neutral-500 hover:bg-white/60 hover:text-neutral-800',
                ].join(' ')}
              >
                <span
                  className={[
                    'inline-block rounded-[3px] border-[1.5px] border-current',
                    value === 'portrait' ? 'h-3.5 w-2.5' : 'h-2.5 w-3.5',
                  ].join(' ')}
                />
                {value}
              </button>
            );
          })}
        </div>
      </div>

      {/* Show author toggle */}
      <div className="mb-5 flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 shadow-sm">
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-neutral-800">
            Show Author
          </span>
          <span className="text-[11px] text-neutral-400">
            Attribution under each quote
          </span>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={showAuthor}
          onClick={() => onShowAuthorChange(!showAuthor)}
          className={[
            'relative inline-flex h-6 w-11 flex-none cursor-pointer items-center rounded-full transition-colors duration-200',
            showAuthor ? 'bg-neutral-900 hover:bg-neutral-800' : 'bg-neutral-300 hover:bg-neutral-400',
          ].join(' ')}
        >
          <span
            className={[
              'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200',
              showAuthor ? 'translate-x-[22px]' : 'translate-x-0.5',
            ].join(' ')}
          />
        </button>
      </div>

      {/* Manage Quotes */}
      <button
        type="button"
        onClick={onManageQuotes}
        className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white py-2.5 text-sm font-semibold text-neutral-800 shadow-sm transition hover:border-neutral-300 hover:bg-neutral-50 active:scale-[0.98]"
      >
        <svg
          className="h-4 w-4 text-neutral-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 6h16M4 12h16M4 18h10" />
        </svg>
        Manage Quotes
      </button>

      {/* Print */}
      <button
        type="button"
        onClick={onPrint}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 py-3 text-sm font-bold text-white shadow-md transition hover:bg-neutral-800 active:scale-[0.98]"
      >
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 9V2h12v7" />
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
          <path d="M6 14h12v8H6z" />
        </svg>
        Print Poster
      </button>
    </aside>
  );
}
