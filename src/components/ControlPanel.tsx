import type { PaperKey, Orientation, PosterTheme } from '../types';
import { CustomSelect } from './CustomSelect';
import { THEME_CONFIGS } from '../themeConfig';
import { RefreshCw } from 'lucide-react';

interface ControlPanelProps {
  paper: PaperKey;
  orientation: Orientation;
  showAuthor: boolean;
  colorContrast: boolean;
  italicAuthor: boolean;
  theme: PosterTheme;
  onPaperChange: (paper: PaperKey) => void;
  onOrientationChange: (orient: Orientation) => void;
  onShowAuthorChange: (show: boolean) => void;
  onColorContrastChange: (show: boolean) => void;
  onItalicAuthorChange: (show: boolean) => void;
  onManageQuotes: () => void;
  onOpenThemeModal: () => void;
  onOpenExportModal: () => void;
  t: any;
  currentLang: 'en' | 'zh';
  maskType: 'none' | 'dark' | 'light' | 'gradient-dark' | 'gradient-light' | 'vignette' | 'vignette-light';
  maskOpacity: number;
  showPreviewOverlay: boolean;
  onMaskTypeChange: (type: 'none' | 'dark' | 'light' | 'gradient-dark' | 'gradient-light' | 'vignette' | 'vignette-light') => void;
  onMaskOpacityChange: (opacity: number) => void;
  onShowPreviewOverlayChange: (show: boolean) => void;
  customThemeName?: string;
  onShuffle: () => void;
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
    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-400">
      {children}
    </span>
  );
}

export function ControlPanel({
  paper,
  orientation,
  showAuthor,
  colorContrast,
  italicAuthor,
  theme,
  onPaperChange,
  onOrientationChange,
  onShowAuthorChange,
  onColorContrastChange,
  onItalicAuthorChange,
  onManageQuotes,
  onOpenThemeModal,
  onOpenExportModal,
  t,
  currentLang,
  maskType,
  maskOpacity,
  showPreviewOverlay,
  onMaskTypeChange,
  onMaskOpacityChange,
  onShowPreviewOverlayChange,
  customThemeName,
  onShuffle,
}: ControlPanelProps) {
  return (
    <aside
      id="controls"
      className="controls fixed right-6 top-6 z-50 w-80 max-h-[calc(100vh-48px)] overflow-y-auto custom-scrollbar select-none rounded-3xl border p-6 transition-all duration-300 [font-family:Inter,ui-sans-serif,system-ui,sans-serif]"
    >
      {/* Portfolio Links */}
      <div className="mb-5 flex items-center justify-between border-b border-white/5 pb-4">
        <a
          href="https://www.rateministere.com"
          className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 hover:text-white transition-colors"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          {t.controlPanel.home}
        </a>
        <a
          href="https://github.com/Learnmore-smart/Quote-Cloud"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 hover:text-white transition-colors"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
          </svg>
          {t.controlPanel.github}
        </a>
      </div>

      {/* Manage Quotes + Shuffle */}
      <div className="mb-5 flex gap-2">
        <button
          type="button"
          onClick={onManageQuotes}
          style={{
            background: `linear-gradient(135deg, var(--accent-color), color-mix(in srgb, var(--accent-color) 80%, #000))`,
            color: `var(--theme-paper-bg)`,
            boxShadow: `0 8px 24px -4px rgba(var(--accent-color-rgb), 0.35)`,
          }}
          className="controls-cta-btn flex flex-1 items-center justify-center gap-2.5 rounded-2xl py-3.5 text-sm font-extrabold shadow-lg hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          {t.controlPanel.manageQuotes}
        </button>
        <button
          type="button"
          onClick={onShuffle}
          title={currentLang === 'zh' ? '刷新布局' : 'Shuffle Layout'}
          className="flex items-center justify-center w-12 rounded-2xl border shadow-inner transition-all duration-200 hover:scale-[1.05] active:scale-[0.95] cursor-pointer controls-row-wrapper hover:brightness-110"
        >
          <RefreshCw className="h-[18px] w-[18px]" strokeWidth={2.5} />
        </button>
      </div>

      {/* Paper Settings Group */}
      <div className="mb-4 flex flex-col gap-2">
        <FieldLabel>{t.controlPanel.paper}</FieldLabel>
        <CustomSelect
          options={PAPER_OPTIONS.map((opt) => ({
            value: opt.value,
            label: opt.label,
            subLabel: opt.dims,
          }))}
          value={paper}
          onChange={(val) => onPaperChange(val as PaperKey)}
        />
      </div>

      {/* Orientation segmented control */}
      <div className="mb-4 flex flex-col gap-2">
        <FieldLabel>{t.controlPanel.orientation}</FieldLabel>
        <div className={`slider-switcher ${orientation === 'landscape' ? 'active-right' : ''}`}>
          <div className="slider-indicator" />
          {(['portrait', 'landscape'] as Orientation[]).map((value) => {
            const active = orientation === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => onOrientationChange(value)}
                className={`slider-btn ${active ? 'active' : ''}`}
              >
                <span
                  className={[
                    'inline-block rounded-[3px] border-[1.5px] border-current transition-all duration-200',
                    value === 'portrait' ? 'h-3.5 w-2.5' : 'h-2.5 w-3.5',
                  ].join(' ')}
                />
                {t.controlPanel.orientations[value] || value}
              </button>
            );
          })}
        </div>
      </div>

      {/* Theme Settings Trigger Button */}
      <div className="mb-4 flex flex-col gap-2 animate-fadeIn">
        <FieldLabel>{t.controlPanel.theme}</FieldLabel>
        <button
          type="button"
          onClick={onOpenThemeModal}
          className="flex items-center gap-3 w-full rounded-xl border p-3 text-left text-xs font-semibold transition cursor-pointer group controls-theme-btn"
        >
          {/* Theme customizer icon */}
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border shadow-inner theme-icon-wrapper">
            <svg className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" style={{ color: 'var(--accent-color)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 14.7255 3.09032 17.1962 4.85857 19C5.03345 19.1749 5.0999 19.4294 5.02402 19.6644L4.5 21.2889C4.37527 21.6749 4.73663 22.0298 5.12065 21.8978L6.8203 21.3138C7.03714 21.2393 7.27581 21.2917 7.44238 21.447C8.7997 21.8021 10.354 22 12 22Z" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="7.5" cy="10.5" r="1.5" fill="currentColor" />
              <circle cx="11.5" cy="7.5" r="1.5" fill="currentColor" />
              <circle cx="16.5" cy="9.5" r="1.5" fill="currentColor" />
              <circle cx="15.5" cy="14.5" r="1.5" fill="currentColor" />
            </svg>
          </div>
          
          <div className="flex-1 min-w-0">
            <span className="block font-bold leading-tight truncate">
              {theme === 'custom'
                ? (customThemeName || (currentLang === 'zh' ? '自定义配色' : 'Custom Theme'))
                : (THEME_CONFIGS[theme as Exclude<PosterTheme, 'custom'>]
                  ? (currentLang === 'zh'
                    ? THEME_CONFIGS[theme as Exclude<PosterTheme, 'custom'>].nameZh
                    : THEME_CONFIGS[theme as Exclude<PosterTheme, 'custom'>].nameEn)
                  : theme)}
            </span>
            <span className="block text-[10px] mt-0.5 font-medium sub-desc">
              {currentLang === 'zh' ? '点击配置主题与配色' : 'Click to customize colors & fonts'}
            </span>
          </div>

          <svg className="h-4 w-4 text-neutral-400 group-hover:text-white transition-colors" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Wallpaper & Mask Settings */}
      <div className="mb-4 border-t border-white/5 pt-4 flex flex-col gap-3">
        <FieldLabel>{t.controlPanel.wallpaperSection}</FieldLabel>
        
        {/* Mask Selector */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-neutral-300">{t.controlPanel.maskTypeLabel}</span>
            <CustomSelect
              options={Object.keys(t.controlPanel.masks).map((key) => ({
                value: key,
                label: t.controlPanel.masks[key],
              }))}
              value={maskType}
              onChange={(val) => onMaskTypeChange?.(val as any)}
              triggerClassName="py-2 text-xs"
            />
        </div>

        {/* Opacity slider - visible only when mask is not 'none' */}
        {maskType !== 'none' && (
          <div className="flex flex-col gap-1.5 animate-fadeIn">
            <div className="flex justify-between items-center text-xs font-medium text-neutral-300">
              <span>{t.controlPanel.maskOpacityLabel}</span>
              <span className="text-[10px] font-bold" style={{ color: 'var(--accent-color)' }}>{maskOpacity}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={maskOpacity}
              onChange={(e) => onMaskOpacityChange?.(parseInt(e.target.value, 10))}
              style={{ accentColor: 'var(--accent-color)' }}
              className="w-full h-1.5 rounded-lg border appearance-none cursor-pointer controls-slider"
            />
          </div>
        )}

        {/* Device preview switch */}
        <div className="flex items-center justify-between rounded-xl border px-3 py-2.5 shadow-inner controls-row-wrapper">
          <div className="flex flex-col">
            <span className="text-xs font-bold">
              {t.controlPanel.previewOverlayLabel}
            </span>
            <span className="text-[9px] mt-0.5 leading-tight sub-desc">
              {t.controlPanel.previewOverlayDesc}
            </span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={showPreviewOverlay}
            onClick={() => onShowPreviewOverlayChange?.(!showPreviewOverlay)}
            style={{ backgroundColor: showPreviewOverlay ? 'var(--accent-color)' : undefined }}
            className={[
              'relative inline-flex h-5 w-9 flex-none cursor-pointer items-center rounded-full transition-colors duration-200',
              showPreviewOverlay ? '' : 'bg-neutral-700',
            ].join(' ')}
          >
            <span
              className={[
                'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200',
                showPreviewOverlay ? 'translate-x-[18px]' : 'translate-x-0.5',
              ].join(' ')}
            />
          </button>
        </div>
      </div>

      {/* Show author toggle */}
      <div className="mb-4 flex items-center justify-between rounded-xl border px-3.5 py-3 shadow-inner controls-row-wrapper">
        <div className="flex flex-col">
          <span className="text-xs font-bold">
            {t.controlPanel.showAuthor}
          </span>
          <span className="text-[10px] mt-0.5 sub-desc">
            {t.controlPanel.showAuthorDesc}
          </span>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={showAuthor}
          onClick={() => onShowAuthorChange(!showAuthor)}
          style={{ backgroundColor: showAuthor ? 'var(--accent-color)' : undefined }}
          className={[
            'relative inline-flex h-6 w-11 flex-none cursor-pointer items-center rounded-full transition-colors duration-200',
            showAuthor ? '' : 'bg-neutral-700',
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

      {/* Italic Author toggle */}
      {showAuthor && (
        <div className="mb-4 flex items-center justify-between rounded-xl border px-3.5 py-3 shadow-inner controls-row-wrapper animate-fadeIn">
          <div className="flex flex-col">
            <span className="text-xs font-bold">
              {t.controlPanel.italicAuthor}
            </span>
            <span className="text-[10px] mt-0.5 sub-desc">
              {t.controlPanel.italicAuthorDesc}
            </span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={italicAuthor}
            onClick={() => onItalicAuthorChange(!italicAuthor)}
            style={{ backgroundColor: italicAuthor ? 'var(--accent-color)' : undefined }}
            className={[
              'relative inline-flex h-6 w-11 flex-none cursor-pointer items-center rounded-full transition-colors duration-200',
              italicAuthor ? '' : 'bg-neutral-700',
            ].join(' ')}
          >
            <span
              className={[
                'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200',
                italicAuthor ? 'translate-x-[22px]' : 'translate-x-0.5',
              ].join(' ')}
            />
          </button>
        </div>
      )}

      {/* Color contrast toggle */}
      <div className="mb-4 flex items-center justify-between rounded-xl border px-3.5 py-3 shadow-inner controls-row-wrapper animate-fadeIn">
        <div className="flex flex-col">
          <span className="text-xs font-bold">
            {t.controlPanel.colorContrast}
          </span>
          <span className="text-[10px] mt-0.5 sub-desc">
            {t.controlPanel.colorContrastDesc}
          </span>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={colorContrast}
          onClick={() => onColorContrastChange(!colorContrast)}
          style={{ backgroundColor: colorContrast ? 'var(--accent-color)' : undefined }}
          className={[
            'relative inline-flex h-6 w-11 flex-none cursor-pointer items-center rounded-full transition-colors duration-200',
            colorContrast ? '' : 'bg-neutral-700',
          ].join(' ')}
        >
          <span
            className={[
              'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200',
              colorContrast ? 'translate-x-[22px]' : 'translate-x-0.5',
            ].join(' ')}
          />
        </button>
      </div>



      {/* Action Buttons */}
      <div className="flex flex-col gap-2">

        {/* Export & Print */}
        <button
          type="button"
          onClick={onOpenExportModal}
          style={{
            backgroundColor: `var(--accent-color)`,
            color: `var(--theme-paper-bg)`,
            boxShadow: `0 10px 25px -5px rgba(var(--accent-color-rgb), 0.3)`,
          }}
          className="controls-cta-btn flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold shadow-lg hover:brightness-110 active:scale-[0.98] transition cursor-pointer"
        >
          <svg
            className="h-4.5 w-4.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          {t.controlPanel.exportPoster}
        </button>
      </div>
    </aside>
  );
}
