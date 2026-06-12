import { useMemo } from 'react';
import type { CSSProperties } from 'react';
import { AutoFitQuote } from './AutoFitQuote';
import { Loader } from './Loader';
import { Flashlight, Camera } from 'lucide-react';
import { packRows } from '../scatter';
import type { ScatterItem } from '../scatter';
import type { PosterTheme, Orientation } from '../types';
import { ThemeColors, THEME_CONFIGS, DEFAULT_CUSTOM_COLORS } from '../themeConfig';

interface PaperCanvasProps {
  canvasSize: { w: number; h: number };
  previewScale: number;
  items: ScatterItem[];
  showAuthor: boolean;
  loading: boolean;
  theme: PosterTheme;
  themeMode: 'dark' | 'light';
  customColors: ThemeColors;
  customFont: string;
  composingText: string;
  signatureText: string;
  maskType: 'none' | 'dark' | 'light' | 'gradient-dark' | 'gradient-light' | 'vignette' | 'vignette-light';
  maskOpacity: number;
  showPreviewOverlay: boolean;
  orientation: Orientation;
  currentLang: 'en' | 'zh';
  showGrid: boolean;
  userThemes?: any[];
  fontOverride?: string | null;
  colorContrast?: boolean;
  italicAuthor?: boolean;
}

/* =============================================================================
 * Bento Box Mosaic Canvas
 * -----------------------------------------------------------------------------
 * The paper is a rigid, hole-free mosaic. `packRows` tiles the quotes into rows
 * (random vertical flex) and cells (random horizontal flex) that together cover
 * 100% of the page. There is NO global font search anymore — each cell renders
 * an `<AutoFitQuote>` that grows its own text like a gas until it hits the walls
 * of its bounding box.
 * ========================================================================== */

export function PaperCanvas({
  canvasSize,
  previewScale,
  items,
  showAuthor,
  loading,
  theme,
  themeMode,
  customColors,
  customFont,
  composingText,
  signatureText,
  maskType,
  maskOpacity,
  showPreviewOverlay,
  orientation,
  currentLang,
  showGrid,
  userThemes = [],
  fontOverride = null,
  colorContrast = true,
  italicAuthor = true,
}: PaperCanvasProps) {
  // Tile the flat quote list into the rigid full-bleed mosaic.
  const rows = useMemo(() => packRows(items), [items]);

  const totalFlex = useMemo(() => rows.reduce((sum, r) => sum + r.flex, 0), [rows]);

  const activeColors = useMemo(() => {
    if (theme === 'custom') {
      return customColors;
    }
    const userTheme = userThemes.find(ut => ut.id === theme);
    if (userTheme) {
      return themeMode === 'dark' ? userTheme.dark : userTheme.light;
    }
    const cfg = THEME_CONFIGS[theme as Exclude<PosterTheme, 'custom'>];
    if (!cfg) return DEFAULT_CUSTOM_COLORS;
    return themeMode === 'dark' ? cfg.dark : cfg.light;
  }, [theme, themeMode, customColors, userThemes]);

  const activeFontFamily = useMemo(() => {
    if (fontOverride) {
      return fontOverride;
    }
    if (theme === 'custom') {
      return customFont;
    }
    const userTheme = userThemes.find(ut => ut.id === theme);
    if (userTheme) {
      return userTheme.fontFamily;
    }
    const cfg = THEME_CONFIGS[theme as Exclude<PosterTheme, 'custom'>];
    return cfg ? cfg.fontFamily : 'inherit';
  }, [theme, customFont, fontOverride, userThemes]);

  const canvasStyle: CSSProperties = {
    width: `${canvasSize.w}px`,
    height: `${canvasSize.h}px`,
    transform: `scale(${previewScale})`,
    fontFamily: activeFontFamily,
    '--paper-bg': activeColors.paperBg,
    '--paper-border': activeColors.paperBorder,
    '--w3-color': activeColors.w3Color,
    '--w2-color': activeColors.w2Color,
    '--w1-color': activeColors.w1Color,
    '--author-ink': activeColors.authorInk,
  } as CSSProperties;

  return (
    <div className="paper-stage">
      <div
        className="paper-frame"
        style={{
          width: `${canvasSize.w * previewScale}px`,
          height: `${canvasSize.h * previewScale}px`,
        }}
      >
        <div
          className={`paper-canvas theme-${theme} mode-${themeMode} ${showGrid ? '' : 'hide-grid'}`}
          id="paperCanvas"
          style={canvasStyle}
        >
          {/* Wallpaper Mask */}
          {maskType !== 'none' && (
            <div
              className={`wallpaper-mask mask-${maskType}`}
              style={{
                opacity: (maskOpacity ?? 40) / 100,
              }}
            />
          )}

          {/* Wallpaper Preview Overlay */}
          {showPreviewOverlay && (
            <div className="wallpaper-preview-overlay print:hidden">
              {orientation === 'portrait' ? (
                <div className="phone-preview">
                  {/* Notch / Dynamic Island */}
                  <div className="phone-dynamic-island" />
                  
                  {/* Status Bar */}
                  <div className="phone-status-bar">
                    <div className="phone-time">09:41</div>
                    <div className="phone-icons">
                      {/* Signal */}
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 20h.01M7 20v-4M12 20v-8M17 20V8M22 20V4" />
                      </svg>
                      {/* Wifi */}
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" />
                      </svg>
                      {/* Battery */}
                      <svg className="w-5 h-3" viewBox="0 0 24 12" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="1" y="1" width="18" height="10" rx="2" />
                        <path d="M21 4v4" strokeLinecap="round" />
                        <rect x="3" y="3" width="10" height="6" fill="currentColor" stroke="none" />
                      </svg>
                    </div>
                  </div>

                  {/* Lock Screen Clock & Date */}
                  <div className="phone-lock-header">
                    <div className="phone-date">
                      {currentLang === 'zh' ? '6月10日 星期三' : 'Wednesday, June 10'}
                    </div>
                    <div className="phone-clock">09:41</div>
                  </div>

                  {/* Bottom shortcuts */}
                  <div className="phone-lock-footer">
                    <button className="phone-footer-btn" type="button" aria-label="Flashlight">
                      <Flashlight strokeWidth={2} />
                    </button>
                    <button className="phone-footer-btn" type="button" aria-label="Camera">
                      <Camera strokeWidth={2} />
                    </button>
                  </div>

                  {/* Swipe Bar */}
                  <div className="phone-swipe-bar" />
                </div>
              ) : (
                <div className="desktop-preview">
                  {/* Top Menu Bar */}
                  <div className="desktop-menu-bar">
                    <div className="desktop-menu-left">
                      <span className="desktop-apple-logo"></span>
                      <span className="desktop-menu-item font-bold">File</span>
                      <span className="desktop-menu-item">Edit</span>
                      <span className="desktop-menu-item">View</span>
                      <span className="desktop-menu-item">Go</span>
                      <span className="desktop-menu-item">Window</span>
                      <span className="desktop-menu-item">Help</span>
                    </div>
                    <div className="desktop-menu-right">
                      <span className="desktop-menu-item">Wed Jun 10</span>
                      <span className="desktop-menu-item font-bold">09:41 AM</span>
                    </div>
                  </div>

                  {/* macOS Dock */}
                  <div className="desktop-dock-container">
                    <div className="desktop-dock">
                      <div className="dock-app finder" />
                      <div className="dock-app safari" />
                      <div className="dock-app messages" />
                      <div className="dock-app maps" />
                      <div className="dock-app photos" />
                      <div className="dock-app music" />
                      <div className="dock-app settings" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="scatter-field">
            {rows.map((row, rowIndex) => {
              const pct = totalFlex > 0 ? (row.flex / totalFlex) * 100 : 0;
              return (
                <div
                  className="quote-row"
                  key={`row-${rowIndex}`}
                  style={{
                    flexGrow: row.flex,
                    flexShrink: 1,
                    flexBasis: `${pct}%`,
                    height: `${pct}%`,
                  }}
                >
                  {row.cells.map((cell, cellIndex) => {
                    // --- 2D checkerboard contrast --------------------------
                    // Bold must ONLY ever touch light, both horizontally and
                    // vertically. A manual `quote.weight` ('bold' | 'light')
                    // wins; otherwise parity of (rowIndex + cellIndex) decides.
                    // The Hero ignores all of this and keeps its exclusive look.
                    const { item } = cell;
                    const manual = item.quote.weight;
                    const isBold = item.isHero
                      ? true
                      : manual === 'bold' || manual === 'hero'
                        ? true
                        : manual === 'light'
                          ? false
                          : (rowIndex + cellIndex) % 2 === 0;

                    // A bold box claims 2× the width of a light box; since the
                    // text auto-fits its box, the bold quote renders far larger.
                    const flex = item.isHero ? 1 : isBold ? 2 : 1;

                    // Elastic line-height: line-height is the vertical spring
                    // that lets blocks of wildly different size/weight sit flush.
                    // A bold box compresses to a dense brick (0.95); a light box
                    // expands airily (1.6) so its small text stretches to fill
                    // the cell height of its heavy neighbours.
                    const resolvedItem: ScatterItem = item.isHero
                      ? item
                      : {
                          ...item,
                          fontWeight: isBold ? 900 : 300,
                          lineHeight: isBold ? 0.95 : 1.6,
                        };

                    return (
                      <AutoFitQuote
                        key={`${item.quote.author}-${rowIndex}-${cellIndex}`}
                        item={resolvedItem}
                        flex={flex}
                        showAuthor={showAuthor}
                        loading={loading}
                        theme={theme}
                        fontFamily={activeFontFamily}
                        colorContrast={colorContrast}
                        italicAuthor={italicAuthor}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
          <Loader
            loading={loading}
            composingText={composingText}
            signatureText={signatureText}
          />
        </div>
      </div>
    </div>
  );
}
