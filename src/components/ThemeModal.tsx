import { useEffect, useRef, useMemo, useState } from 'react';
import type { PosterTheme } from '../types';
import { ThemeColors, THEME_CONFIGS, DEFAULT_CUSTOM_COLORS_LIGHT, DEFAULT_CUSTOM_COLORS_DARK } from '../themeConfig';
import { CustomSelect } from './CustomSelect';
import { ColorPicker } from './ColorPicker';
import { PaperCanvas } from './PaperCanvas';
import type { ScatterItem } from '../scatter';

interface ThemeModalProps {
  open: boolean;
  onClose: () => void;
  theme: PosterTheme;
  onThemeChange: (theme: PosterTheme) => void;
  themeMode: 'dark' | 'light';
  onThemeModeChange: (mode: 'dark' | 'light') => void;
  customColors: ThemeColors;
  onCustomColorsChange: (colors: ThemeColors) => void;
  customFont: string;
  onCustomFontChange: (font: string) => void;
  currentLang: 'en' | 'zh';
  customThemeName: string;
  onCustomThemeNameChange: (name: string) => void;
  showGrid: boolean;
  onShowGridChange: (show: boolean) => void;
  fontOverride: string | null;
  onFontOverrideChange: (font: string | null) => void;
  userThemes: any[];
  onAddUserTheme: () => void;
  onDeleteUserTheme: (themeId: string) => void;
  previewItems: ScatterItem[];
}

export function ThemeModal({
  open,
  onClose,
  theme,
  onThemeChange,
  themeMode,
  onThemeModeChange,
  customColors,
  onCustomColorsChange,
  customFont,
  onCustomFontChange,
  currentLang,
  customThemeName,
  onCustomThemeNameChange,
  showGrid,
  onShowGridChange,
  fontOverride,
  onFontOverrideChange,
  userThemes,
  onAddUserTheme,
  onDeleteUserTheme,
  previewItems,
}: ThemeModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [previewWidth, setPreviewWidth] = useState(250);

  useEffect(() => {
    if (!previewContainerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setPreviewWidth(entry.contentRect.width);
      }
    });
    observer.observe(previewContainerRef.current);
    return () => observer.disconnect();
  }, [open]);


  const mockCanvasSize = { w: 2480, h: 3508 };
  const previewScale = previewWidth / mockCanvasSize.w;

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, onClose]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  // Available font families
  const FONT_OPTIONS = useMemo(
    () => [
      {
        value: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
        label: currentLang === 'zh' ? '现代无衬线体 (Sans-serif)' : 'Stark Sans-serif',
      },
      {
        value: '"Noto Serif SC", "Source Han Serif SC", Georgia, serif',
        label: currentLang === 'zh' ? '古典雅致宋体 (Serif)' : 'Elegant Serif',
      },
      {
        value: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        label: currentLang === 'zh' ? '数字极客等宽 (Monospace)' : 'Digital Monospace',
      },
      {
        value: '"Cormorant Garamond", "Noto Serif SC", serif',
        label: currentLang === 'zh' ? '奢华经典衬线 (Luxury Serif)' : 'Luxury Garamond',
      },
    ],
    [currentLang]
  );

  // Handle color change for custom theme
  const handleColorChange = (key: keyof ThemeColors, value: string) => {
    let newColors = { ...customColors };
    if (theme !== 'custom') {
      const userTheme = userThemes.find(ut => ut.id === theme);
      if (userTheme) {
        newColors = { ...(themeMode === 'dark' ? userTheme.dark : userTheme.light) };
        onCustomThemeNameChange(`${userTheme.name}-1`);
      } else {
        const cfg = THEME_CONFIGS[theme as Exclude<PosterTheme, 'custom'>];
        if (cfg) {
          newColors = { ...(themeMode === 'dark' ? cfg.dark : cfg.light) };
          const baseName = currentLang === 'zh' ? cfg.nameZh : cfg.nameEn;
          const cleanName = baseName.replace(/\s*\(.*?\)\s*$/, '');
          onCustomThemeNameChange(`${cleanName}-1`);
        }
      }
      
      // If there is an active font override, bake it into customFont
      if (fontOverride) {
        onCustomFontChange(fontOverride);
        onFontOverrideChange(null);
      } else {
        // Otherwise, copy the theme's active font to customFont
        if (userTheme) {
          onCustomFontChange(userTheme.fontFamily);
        } else {
          const cfg = THEME_CONFIGS[theme as Exclude<PosterTheme, 'custom'>];
          if (cfg) {
            onCustomFontChange(cfg.fontFamily);
          }
        }
      }
      
      onThemeChange('custom');
    }
    newColors[key] = value;
    onCustomColorsChange(newColors);
  };

  // Handle font change
  const handleFontChange = (font: string) => {
    if (theme === 'custom') {
      onCustomFontChange(font);
    } else {
      onFontOverrideChange(font);
    }
  };

  // Reset custom theme colors to default
  const handleResetCustom = () => {
    onCustomColorsChange(themeMode === 'dark' ? DEFAULT_CUSTOM_COLORS_DARK : DEFAULT_CUSTOM_COLORS_LIGHT);
    onCustomFontChange('"Inter", -apple-system, BlinkMacSystemFont, sans-serif');
    onCustomThemeNameChange('');
    onThemeChange('custom');
  };

  // Get active colors for preview
  const activeColors = useMemo(() => {
    if (theme === 'custom') return customColors;
    const userTheme = userThemes.find(ut => ut.id === theme);
    if (userTheme) {
      return themeMode === 'dark' ? userTheme.dark : userTheme.light;
    }
    const cfg = THEME_CONFIGS[theme as Exclude<PosterTheme, 'custom'>];
    if (!cfg) return themeMode === 'dark' ? DEFAULT_CUSTOM_COLORS_DARK : DEFAULT_CUSTOM_COLORS_LIGHT;
    return themeMode === 'dark' ? cfg.dark : cfg.light;
  }, [theme, themeMode, customColors, userThemes]);

  const activeFontFamily = useMemo(() => {
    if (fontOverride) {
      return fontOverride;
    }
    if (theme === 'custom') return customFont;
    const userTheme = userThemes.find(ut => ut.id === theme);
    if (userTheme) {
      return userTheme.fontFamily;
    }
    const cfg = THEME_CONFIGS[theme as Exclude<PosterTheme, 'custom'>];
    return cfg ? cfg.fontFamily : 'inherit';
  }, [theme, customFont, fontOverride, userThemes]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 select-none animate-fadeIn">
      <div
        ref={modalRef}
        className={`relative flex h-[90vh] max-h-[680px] w-full max-w-[840px] flex-col overflow-hidden rounded-3xl border shadow-2xl backdrop-blur-2xl md:flex-row [font-family:Inter,sans-serif] modal-theme-${themeMode} theme-modal-window`}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-50 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border transition-colors theme-modal-close-btn"
          aria-label="Close"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Left Side: Theme Presets Grid */}
        <div className="flex flex-1 flex-col p-6 md:w-3/5 overflow-y-auto theme-modal-left-panel theme-modal-scrollbar">
          <div className="mb-4">
            <h2 className="text-lg font-bold tracking-tight theme-modal-text-title">
              {currentLang === 'zh' ? '主题中心' : 'Theme Center'}
            </h2>
            <p className="text-xs mt-1 theme-modal-text-muted">
              {currentLang === 'zh' ? '选择精心设计的排版配色预设' : 'Choose a hand-crafted layout color preset'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {Object.values(THEME_CONFIGS).map((cfg) => {
              const active = theme === cfg.id;
              const preview = themeMode === 'dark' ? cfg.dark : cfg.light;

              return (
                <button
                  key={cfg.id}
                  type="button"
                  onClick={() => onThemeChange(cfg.id)}
                  className={`flex flex-col gap-2 rounded-2xl border p-3.5 text-left transition-all cursor-pointer theme-modal-card ${
                    active ? 'active' : ''
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold truncate">
                      {currentLang === 'zh' ? cfg.nameZh : cfg.nameEn}
                    </span>
                    {active && (
                      <span className="flex h-1.5 w-1.5 rounded-full" style={{ backgroundColor: 'var(--accent-color)' }} />
                    )}
                  </div>

                  {/* Color Palette Pill Preview */}
                  <div
                    className="flex h-6 w-full items-center gap-1 rounded-lg px-2 border theme-modal-preview-pill-border"
                    style={{ backgroundColor: preview.paperBg }}
                  >
                    <div className="h-2 w-2 rounded-full border shrink-0 theme-modal-preview-inner-border" style={{ backgroundColor: preview.paperBorder }} />
                    <div className="h-2.5 w-4 rounded-sm shrink-0" style={{ backgroundColor: preview.w3Color }} />
                    <div className="h-2 w-6 rounded-sm shrink-0" style={{ backgroundColor: preview.w2Color }} />
                    <div className="h-2 w-3 rounded-sm shrink-0" style={{ backgroundColor: preview.w1Color }} />
                    <div className="h-2 w-2 rounded-full shrink-0 ml-auto" style={{ backgroundColor: preview.authorInk }} />
                  </div>
                </button>
              );
            })}

            {/* User-created Custom Themes */}
            {userThemes.map((ut) => {
              const active = theme === ut.id;
              const preview = themeMode === 'dark' ? ut.dark : ut.light;

              return (
                <div key={ut.id} className="relative group/card w-full">
                  <button
                    type="button"
                    onClick={() => onThemeChange(ut.id)}
                    className={`flex flex-col gap-2 rounded-2xl border p-3.5 text-left transition-all cursor-pointer w-full theme-modal-card ${
                      active ? 'active' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-bold truncate pr-4">
                        🎨 {ut.name}
                      </span>
                      {active && (
                        <span className="flex h-1.5 w-1.5 rounded-full" style={{ backgroundColor: 'var(--accent-color)' }} />
                      )}
                    </div>

                    {/* Color Palette Pill Preview */}
                    <div
                      className="flex h-6 w-full items-center gap-1 rounded-lg px-2 border theme-modal-preview-pill-border"
                      style={{ backgroundColor: preview.paperBg }}
                    >
                      <div className="h-2 w-2 rounded-full border shrink-0 theme-modal-preview-inner-border" style={{ backgroundColor: preview.paperBorder }} />
                      <div className="h-2.5 w-4 rounded-sm shrink-0" style={{ backgroundColor: preview.w3Color }} />
                      <div className="h-2 w-6 rounded-sm shrink-0" style={{ backgroundColor: preview.w2Color }} />
                      <div className="h-2 w-3 rounded-sm shrink-0" style={{ backgroundColor: preview.w1Color }} />
                      <div className="h-2 w-2 rounded-full shrink-0 ml-auto" style={{ backgroundColor: preview.authorInk }} />
                    </div>
                  </button>

                  {/* Delete Button for User Theme */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteUserTheme(ut.id);
                    }}
                    className="absolute right-2 top-2 z-10 hidden group-hover/card:flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-red-500 text-white shadow-md hover:bg-red-600 transition-colors"
                    title={currentLang === 'zh' ? '删除主题' : 'Delete Theme'}
                  >
                    <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              );
            })}

            {/* Custom Theme Card */}
            <button
              type="button"
              onClick={() => onThemeChange('custom')}
              className={`flex flex-col gap-2 rounded-2xl border p-3.5 text-left transition-all cursor-pointer theme-modal-card ${
                theme === 'custom' ? 'active' : ''
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-bold truncate">
                  🎨 {customThemeName || (currentLang === 'zh' ? '自定义主题' : 'Custom Theme')}
                </span>
                {theme === 'custom' && (
                  <span className="flex h-1.5 w-1.5 rounded-full" style={{ backgroundColor: 'var(--accent-color)' }} />
                )}
              </div>

              {/* Color Palette Pill Preview */}
              <div
                className="flex h-6 w-full items-center gap-1 rounded-lg px-2 border theme-modal-preview-pill-border"
                style={{ backgroundColor: customColors.paperBg }}
              >
                <div className="h-2 w-2 rounded-full border shrink-0 theme-modal-preview-inner-border" style={{ backgroundColor: customColors.paperBorder }} />
                <div className="h-2.5 w-4 rounded-sm shrink-0" style={{ backgroundColor: customColors.w3Color }} />
                <div className="h-2 w-6 rounded-sm shrink-0" style={{ backgroundColor: customColors.w2Color }} />
                <div className="h-2 w-3 rounded-sm shrink-0" style={{ backgroundColor: customColors.w1Color }} />
                <div className="h-2 w-2 rounded-full shrink-0 ml-auto" style={{ backgroundColor: customColors.authorInk }} />
              </div>
            </button>
          </div>
        </div>

        {/* Right Side: Theme Mode & Details Customizer */}
        <div className="flex flex-1 flex-col p-6 md:w-2/5 overflow-y-auto theme-modal-right-panel theme-modal-scrollbar">
          
          {/* Effect Preview — Realistic Mini A4 Paper */}
          <div className="mb-5 flex flex-col gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest theme-modal-text-section">
              {currentLang === 'zh' ? '效果预览' : 'Preview'}
            </span>
            <div
              ref={previewContainerRef}
              className="relative w-full flex items-center justify-center transition-all duration-300 pointer-events-none"
            >
              {previewWidth > 0 && (
                <PaperCanvas
                  canvasSize={mockCanvasSize}
                  previewScale={previewScale}
                  items={previewItems}
                  showAuthor={true}
                  loading={false}
                  theme={theme}
                  themeMode={themeMode}
                  customColors={activeColors}
                  customFont={activeFontFamily}
                  composingText=""
                  signatureText=""
                  maskType="none"
                  maskOpacity={0}
                  showPreviewOverlay={false}
                  orientation="portrait"
                  currentLang={currentLang}
                  showGrid={showGrid}
                  userThemes={userThemes}
                  fontOverride={fontOverride}
                />
              )}
            </div>
          </div>

          <div className="mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider theme-modal-text-section">
              {currentLang === 'zh' ? '外观调节' : 'Appearance'}
            </h3>
          </div>

          {/* Theme Mode Toggle (Light/Dark) */}
          <div className="mb-5 flex flex-col gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest theme-modal-text-section">
              {currentLang === 'zh' ? '主题模式' : 'Theme Mode'}
            </span>
            <div className={`slider-switcher ${themeMode === 'dark' ? 'active-right' : ''}`}>
              <div className="slider-indicator" />
              {(['light', 'dark'] as const).map((mode) => {
                const active = themeMode === mode;
                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => onThemeModeChange(mode)}
                    className={`slider-btn ${active ? 'active' : ''}`}
                  >
                    {mode === 'dark' ? (
                      <>
                        <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                        </svg>
                        {currentLang === 'zh' ? '深色' : 'Dark'}
                      </>
                    ) : (
                      <>
                        <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 100 2h1z" clipRule="evenodd" />
                        </svg>
                        {currentLang === 'zh' ? '浅色' : 'Light'}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Font Family */}
          <div className="mb-4 flex flex-col gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest theme-modal-text-section">
              {currentLang === 'zh' ? '艺术字体' : 'Font Family'}
            </span>
            <CustomSelect
              options={FONT_OPTIONS}
              value={activeFontFamily}
              onChange={handleFontChange}
            />
          </div>

          {/* Custom Theme Name Input (only if custom is active) */}
          {theme === 'custom' && (
            <div className="mb-5 flex flex-col gap-2 animate-fadeIn">
              <span className="text-[10px] font-bold uppercase tracking-widest theme-modal-text-section">
                {currentLang === 'zh' ? '主题名称' : 'Theme Name'}
              </span>
              <input
                type="text"
                value={customThemeName}
                onChange={(e) => onCustomThemeNameChange(e.target.value)}
                className="w-full rounded-xl border px-3.5 py-2.5 text-xs font-semibold outline-none transition-all theme-modal-select"
                placeholder={currentLang === 'zh' ? '例如：暖雅人文-1' : 'e.g. Cream Editorial-1'}
              />
            </div>
          )}

          {/* Custom Color Settings */}
          <div className="mb-5 flex flex-col gap-3">
            <span className="text-[10px] font-bold uppercase tracking-widest theme-modal-text-section">
              {currentLang === 'zh' ? '颜色配置' : 'Custom Colors'}
            </span>

            <div className="flex flex-col gap-2">
              {/* Paper Background */}
              <div className="flex items-center justify-between rounded-xl px-3 py-2.5 border theme-modal-row-wrapper">
                <span className="text-xs font-medium theme-modal-row-label">
                  {currentLang === 'zh' ? '纸张背景' : 'Paper Background'}
                </span>
                <ColorPicker
                  value={activeColors.paperBg}
                  onChange={(val) => handleColorChange('paperBg', val)}
                />
              </div>

              {/* Paper Border / Grid Toggle & Picker */}
              <div className="flex items-center justify-between rounded-xl px-3 py-2.5 border theme-modal-row-wrapper">
                <span className="text-xs font-medium theme-modal-row-label">
                  {currentLang === 'zh' ? '边框网格' : 'Border / Grid'}
                </span>
                <div className="flex items-center gap-3">
                  {/* Slide Toggle Switch */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={showGrid}
                    onClick={() => onShowGridChange(!showGrid)}
                    style={{ backgroundColor: showGrid ? 'var(--accent-color)' : undefined }}
                    className={`relative inline-flex h-5 w-9 flex-none cursor-pointer items-center rounded-full transition-colors duration-200 ${
                      showGrid ? '' : 'bg-neutral-200 dark:bg-neutral-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                        showGrid ? 'translate-x-[18px]' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                  {showGrid && (
                    <ColorPicker
                      value={activeColors.paperBorder}
                      onChange={(val) => handleColorChange('paperBorder', val)}
                    />
                  )}
                </div>
              </div>

              {/* Hero Emphasis Text (W3) */}
              <div className="flex items-center justify-between rounded-xl px-3 py-2.5 border theme-modal-row-wrapper">
                <span className="text-xs font-medium theme-modal-row-label">
                  {currentLang === 'zh' ? '焦点文字 (W3)' : 'Hero Text (W3)'}
                </span>
                <ColorPicker
                  value={activeColors.w3Color}
                  onChange={(val) => handleColorChange('w3Color', val)}
                />
              </div>

              {/* Primary Text (W2) */}
              <div className="flex items-center justify-between rounded-xl px-3 py-2.5 border theme-modal-row-wrapper">
                <span className="text-xs font-medium theme-modal-row-label">
                  {currentLang === 'zh' ? '主要文字 (W2)' : 'Primary Text (W2)'}
                </span>
                <ColorPicker
                  value={activeColors.w2Color}
                  onChange={(val) => handleColorChange('w2Color', val)}
                />
              </div>

              {/* Secondary Text (W1) */}
              <div className="flex items-center justify-between rounded-xl px-3 py-2.5 border theme-modal-row-wrapper">
                <span className="text-xs font-medium theme-modal-row-label">
                  {currentLang === 'zh' ? '次要文字 (W1)' : 'Secondary Text (W1)'}
                </span>
                <ColorPicker
                  value={activeColors.w1Color}
                  onChange={(val) => handleColorChange('w1Color', val)}
                />
              </div>

              {/* Author ink */}
              <div className="flex items-center justify-between rounded-xl px-3 py-2.5 border theme-modal-row-wrapper">
                <span className="text-xs font-medium theme-modal-row-label">
                  {currentLang === 'zh' ? '作者署名' : 'Author Attribution'}
                </span>
                <ColorPicker
                  value={activeColors.authorInk}
                  onChange={(val) => handleColorChange('authorInk', val)}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons: Add Theme & Reset custom theme */}
          <div className="mt-auto flex flex-col gap-2 pt-4 border-t theme-modal-border-light">
            <button
              type="button"
              onClick={onAddUserTheme}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl text-white py-2.5 text-xs font-bold transition-all active:scale-[0.98] cursor-pointer shadow-md"
              style={{
                backgroundColor: 'var(--accent-color, #8b5cf6)',
                boxShadow: '0 4px 12px rgba(var(--accent-color-rgb, 139, 92, 246), 0.25)',
              }}
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {currentLang === 'zh' ? '添加主题' : 'Add Theme'}
            </button>

            {theme === 'custom' && (
              <button
                type="button"
                onClick={handleResetCustom}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-bold transition-all cursor-pointer theme-modal-reset-btn"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M16 3h5v5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8 21H3v-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {currentLang === 'zh' ? '重置为默认' : 'Reset Defaults'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
