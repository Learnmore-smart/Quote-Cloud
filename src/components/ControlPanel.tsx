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
  t: any;
  currentLang: 'en' | 'zh';
  onLanguageChange: (lang: 'en' | 'zh') => void;
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
  t,
  currentLang,
  onLanguageChange,
}: ControlPanelProps) {
  return (
    <aside
      id="controls"
      className="controls fixed right-5 top-5 z-50 w-72 select-none rounded-2xl border border-white/60 bg-white/75 p-5 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.35)] ring-1 ring-black/5 backdrop-blur-xl opacity-20 hover:opacity-100 transition-opacity duration-300 ease-in-out [font-family:Inter,ui-sans-serif,system-ui,sans-serif]"
    >
      {/* Portfolio Links */}
      <div className="mb-4 flex items-center justify-between border-b border-neutral-200/50 pb-3">
        <a
          href="https://www.rateministere.com"
          className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          {t.controlPanel.home}
        </a>
        <a
          href="https://github.com/Learnmore-smart/Quote-Cloud"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
          </svg>
          {t.controlPanel.github}
        </a>
      </div>

      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900 text-sm font-bold text-white shadow-sm">
          QC
        </div>
        <div className="leading-tight">
          <h1 className="m-0 text-base font-bold tracking-tight text-neutral-900">
            {t.controlPanel.title}
          </h1>
          <p className="m-0 text-xs font-medium text-neutral-400">
            {t.controlPanel.subtitle}
          </p>
        </div>
      </div>

      {/* Paper */}
      <div className="mb-4 flex flex-col gap-2">
        <FieldLabel>{t.controlPanel.paper}</FieldLabel>
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
        <FieldLabel>{t.controlPanel.orientation}</FieldLabel>
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
                {t.controlPanel.orientations[value] || value}
              </button>
            );
          })}
        </div>
      </div>

      {/* Language segmented control */}
      <div className="mb-4 flex flex-col gap-2">
        <FieldLabel>{t.controlPanel.language}</FieldLabel>
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-neutral-100 p-1">
          {(['en', 'zh'] as const).map((langCode) => {
            const active = currentLang === langCode;
            return (
              <button
                key={langCode}
                type="button"
                onClick={() => onLanguageChange(langCode)}
                className={[
                  'flex cursor-pointer items-center justify-center rounded-lg py-2 text-xs font-semibold transition',
                  active
                    ? 'bg-white text-neutral-900 shadow-sm hover:bg-neutral-50'
                    : 'text-neutral-500 hover:bg-white/60 hover:text-neutral-800',
                ].join(' ')}
              >
                {langCode === 'en' ? 'EN' : '中文'}
              </button>
            );
          })}
        </div>
      </div>

      {/* Show author toggle */}
      <div className="mb-5 flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 shadow-sm">
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-neutral-800">
            {t.controlPanel.showAuthor}
          </span>
          <span className="text-[11px] text-neutral-400">
            {t.controlPanel.showAuthorDesc}
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
        {t.controlPanel.manageQuotes}
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
        {t.controlPanel.printPoster}
      </button>
    </aside>
  );
}
