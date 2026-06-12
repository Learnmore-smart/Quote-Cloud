import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { PaperCanvas } from './components/PaperCanvas';
import { QuoteManager } from './components/QuoteManager';
import { ThemeModal } from './components/ThemeModal';
import { ExportModal } from './components/ExportModal';
import { assignScatter, shuffleQuotes } from './scatter';
import { injectPrintRule } from './print';
import { SEED_QUOTES, FAMOUS_QUOTES, SEED_QUOTES_ZH, FAMOUS_QUOTES_ZH } from './seed';
import { getPaperCanvasSize } from './config';
import type { PaperKey, Orientation, Quote, PosterTheme } from './types';
import { Eye, Sliders, Download } from 'lucide-react';
import {
  ThemeColors,
  THEME_CONFIGS,
  loadCustomColors,
  saveCustomColors,
  loadCustomFont,
  saveCustomFont,
  UserTheme,
} from './themeConfig';

import en from './locales/en.json';
import zh from './locales/zh.json';

import './styles.css';
import './theme.css';






function hexToRgb(hex: string): string {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '16, 185, 129';
}



const translations = { en, zh };

/** localStorage key for the persisted deck. */
const STORAGE_KEY = 'quote-cloud-data';

/** localStorage key for the persisted "show author" toggle. */
const SHOW_AUTHOR_KEY = 'quote-cloud-show-author';

/** localStorage key for the persisted "italic author" toggle. */
const ITALIC_AUTHOR_KEY = 'quote-cloud-italic-author';

/** localStorage key for the persisted "show grid" toggle. */
const SHOW_GRID_KEY = 'quote-cloud-show-grid';

/** localStorage key for the persisted "color contrast" toggle. */
const COLOR_CONTRAST_KEY = 'quote-cloud-color-contrast';

/** localStorage key for the cached language. */
const LANGUAGE_KEY = 'quote-cloud-lang';

/** localStorage key for the persisted theme. */
const THEME_KEY = 'quote-cloud-theme';

/** localStorage key for the workspace mode (light/dark). */
const WORKSPACE_MODE_KEY = 'quote-cloud-workspace-mode';

const THEME_MODE_KEY = 'quote-cloud-theme-mode';

/** Load the saved theme from localStorage (defaults to 'editorial'). */
function loadTheme(): string {
  if (typeof localStorage === 'undefined') return 'editorial';
  try {
    const cached = localStorage.getItem(THEME_KEY);
    if (cached) return cached;
  } catch {
    /* fallback */
  }
  return 'editorial';
}

/** Load saved user custom themes from localStorage. */
function loadUserThemes(): UserTheme[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const cached = localStorage.getItem('quote-cloud-user-themes');
    return cached ? JSON.parse(cached) : [];
  } catch {
    return [];
  }
}

/** Load saved font override from localStorage. */
function loadFontOverride(): string | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    return localStorage.getItem('quote-cloud-font-override');
  } catch {
    return null;
  }
}

/** Load the saved workspace mode (dark/light). Legacy fallback. */
function loadWorkspaceMode(): 'dark' | 'light' {
  if (typeof localStorage === 'undefined') return 'dark';
  try {
    const cached = localStorage.getItem(WORKSPACE_MODE_KEY);
    if (cached === 'dark' || cached === 'light') return cached;
  } catch {}
  return 'dark';
}

/** Load the poster theme mode (dark/light). Defaults to workspace mode or dark. */
function loadThemeMode(): 'dark' | 'light' {
  if (typeof localStorage === 'undefined') return 'dark';
  try {
    const cached = localStorage.getItem(THEME_MODE_KEY);
    if (cached === 'dark' || cached === 'light') return cached;
  } catch {}
  return loadWorkspaceMode();
}

/** Load the saved "show author" toggle from localStorage (defaults to false). */
function loadShowAuthor(): boolean {
  if (typeof localStorage === 'undefined') return false;
  try {
    return localStorage.getItem(SHOW_AUTHOR_KEY) === 'true';
  } catch {
    return false;
  }
}

/** Load the saved "italic author" toggle from localStorage (defaults to true). */
function loadItalicAuthor(): boolean {
  if (typeof localStorage === 'undefined') return true;
  try {
    return localStorage.getItem(ITALIC_AUTHOR_KEY) !== 'false';
  } catch {
    return true;
  }
}

/** Load the saved custom theme name from localStorage. */
function loadCustomThemeName(): string {
  if (typeof localStorage === 'undefined') return '';
  try {
    return localStorage.getItem('quote-cloud-custom-theme-name') || '';
  } catch {
    return '';
  }
}

/** Load the saved "show grid" toggle from localStorage (defaults to true). */
function loadShowGrid(): boolean {
  if (typeof localStorage === 'undefined') return true;
  try {
    return localStorage.getItem(SHOW_GRID_KEY) !== 'false';
  } catch {
    return true;
  }
}

/** Load the saved "color contrast" toggle from localStorage (defaults to true). */
function loadColorContrast(): boolean {
  if (typeof localStorage === 'undefined') return true;
  try {
    return localStorage.getItem(COLOR_CONTRAST_KEY) !== 'false';
  } catch {
    return true;
  }
}


function loadMaskType(): 'none' | 'dark' | 'light' | 'gradient-dark' | 'gradient-light' | 'vignette' | 'vignette-light' {
  if (typeof localStorage === 'undefined') return 'none';
  try {
    const cached = localStorage.getItem('quote-cloud-mask-type');
    if (
      cached === 'none' ||
      cached === 'dark' ||
      cached === 'light' ||
      cached === 'gradient-dark' ||
      cached === 'gradient-light' ||
      cached === 'vignette' ||
      cached === 'vignette-light'
    ) {
      return cached as any;
    }
  } catch {}
  return 'none';
}

function loadMaskOpacity(): number {
  if (typeof localStorage === 'undefined') return 40;
  try {
    const cached = localStorage.getItem('quote-cloud-mask-opacity');
    if (cached) {
      const val = parseInt(cached, 10);
      if (!isNaN(val)) return val;
    }
  } catch {}
  return 40;
}

function loadShowPreviewOverlay(): boolean {
  if (typeof localStorage === 'undefined') return false;
  try {
    return localStorage.getItem('quote-cloud-show-preview-overlay') === 'true';
  } catch {}
  return false;
}

/** Load the cached language or auto-detect browser language. */
function loadLanguage(): 'en' | 'zh' {
  if (typeof localStorage !== 'undefined') {
    const cached = localStorage.getItem(LANGUAGE_KEY);
    if (cached === 'en' || cached === 'zh') return cached as 'en' | 'zh';
  }
  return 'zh';
}

/** A fresh random seed — used to reshuffle the deck on demand. */
function randomSeed(): number {
  return Math.floor(Math.random() * 0x7fffffff);
}

/** A value is a usable quote if it at least carries text + author strings. */
function isQuote(value: unknown): value is Quote {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Quote).text === 'string' &&
    typeof (value as Quote).author === 'string'
  );
}

/** Load the saved deck from localStorage, falling back to the seed dataset. */
function loadQuotes(lang: 'en' | 'zh'): Quote[] {
  if (typeof localStorage === 'undefined') return lang === 'zh' ? SEED_QUOTES_ZH : SEED_QUOTES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return lang === 'zh' ? SEED_QUOTES_ZH : SEED_QUOTES;
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every(isQuote)) {
      return parsed as Quote[];
    }
  } catch {
    /* corrupt payload — fall through to the seed dataset */
  }
  return lang === 'zh' ? SEED_QUOTES_ZH : SEED_QUOTES;
}

function computePreviewScale(
  canvasW: number,
  canvasH: number,
  viewportW: number,
  viewportH: number,
  isMobile: boolean,
): number {
  const horizontalPadding = isMobile ? 32 : 64;
  const verticalPadding = isMobile ? 120 : 144;
  const availW = Math.max(200, viewportW - horizontalPadding);
  const availH = Math.max(200, viewportH - verticalPadding);
  return Math.min(1, availW / canvasW, availH / canvasH);
}

/**
 * Wait until the document fonts are fully loaded so Pretext
 * measures text with the final glyph widths.
 */
async function waitForFonts(): Promise<void> {
  if (typeof document === 'undefined' || !document.fonts) return;
  try {
    await document.fonts.ready;
  } catch {
    /* ignore — fall back to whatever fonts are available */
  }
}

export default function App() {
  const [paper, setPaper] = useState<PaperKey>('A4');
  const [orientation, setOrientation] = useState<Orientation>('portrait');
  const [showAuthor, setShowAuthor] = useState(() => loadShowAuthor());
  const [italicAuthor, setItalicAuthor] = useState(() => loadItalicAuthor());
  const [showGrid, setShowGrid] = useState(() => loadShowGrid());
  const [colorContrast, setColorContrast] = useState(() => loadColorContrast());
  const [customThemeName, setCustomThemeName] = useState<string>(() => loadCustomThemeName());
  const [lang, setLang] = useState<'en' | 'zh'>(() => loadLanguage());
  const [theme, setTheme] = useState<PosterTheme>(() => loadTheme());
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>(() => loadThemeMode());
  const [customColorsLight, setCustomColorsLight] = useState<ThemeColors>(() => loadCustomColors('light'));
  const [customColorsDark, setCustomColorsDark] = useState<ThemeColors>(() => loadCustomColors('dark'));
  const [customFont, setCustomFont] = useState<string>(() => loadCustomFont());
  const [fontOverride, setFontOverride] = useState<string | null>(() => loadFontOverride());
  const [userThemes, setUserThemes] = useState<UserTheme[]>(() => loadUserThemes());
  const [themeModalOpen, setThemeModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [maskType, setMaskType] = useState<'none' | 'dark' | 'light' | 'gradient-dark' | 'gradient-light' | 'vignette' | 'vignette-light'>(() => loadMaskType());
  const [maskOpacity, setMaskOpacity] = useState<number>(() => loadMaskOpacity());
  const [showPreviewOverlay, setShowPreviewOverlay] = useState<boolean>(() => loadShowPreviewOverlay());

  // Open-source ready: the deck lives in state, hydrated from localStorage so
  // user edits persist across reloads.
  const [quotes, setQuotes] = useState<Quote[]>(() => loadQuotes(loadLanguage()));
  // A per-mount random seed makes the layout look different on every refresh.
  const [shuffleSeed, setShuffleSeed] = useState<number>(() => randomSeed());
  const [manageOpen, setManageOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewportSize, setViewportSize] = useState({
    w: typeof window !== 'undefined' ? window.innerWidth : 1280,
    h: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  const isMobile = useMemo(() => viewportSize.w <= 768, [viewportSize.w]);

  // Mobile pager state
  const [activeTab, setActiveTab] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Touch gesture tracking refs
  const touchStartRef = useRef({ x: 0, y: 0 });
  const swipeDirectionRef = useRef<'horizontal' | 'vertical' | null>(null);
  const latestStateRef = useRef({ activeTab, isDragging, dragOffset });

  useEffect(() => {
    latestStateRef.current = { activeTab, isDragging, dragOffset };
  }, [activeTab, isDragging, dragOffset]);

  const pagerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = pagerRef.current;
    if (!element) return;

    const handleStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
      setIsDragging(true);
      setDragOffset(0);
      swipeDirectionRef.current = null;
    };

    const handleMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const diffX = currentX - touchStartRef.current.x;
      const diffY = currentY - touchStartRef.current.y;

      const absX = Math.abs(diffX);
      const absY = Math.abs(diffY);

      if (swipeDirectionRef.current === null) {
        if (absX > 8 || absY > 8) {
          if (absX > absY) {
            swipeDirectionRef.current = 'horizontal';
          } else {
            swipeDirectionRef.current = 'vertical';
          }
        }
      }

      if (swipeDirectionRef.current === 'horizontal') {
        if (e.cancelable) {
          e.preventDefault();
        }
        const currentActiveTab = latestStateRef.current.activeTab;
        let offset = diffX;
        if (currentActiveTab === 0 && diffX > 0) {
          offset = diffX * 0.25;
        } else if (currentActiveTab === 1 && diffX < 0) {
          offset = diffX * 0.25;
        }
        setDragOffset(offset);
      }
    };

    const handleEnd = () => {
      const currentActiveTab = latestStateRef.current.activeTab;
      const currentDragOffset = latestStateRef.current.dragOffset;

      setIsDragging(false);

      if (swipeDirectionRef.current === 'horizontal') {
        const threshold = window.innerWidth * 0.35;
        if (currentDragOffset < -threshold && currentActiveTab === 0) {
          setActiveTab(1);
        } else if (currentDragOffset > threshold && currentActiveTab === 1) {
          setActiveTab(0);
        }
      }
      setDragOffset(0);
      swipeDirectionRef.current = null;
    };

    element.addEventListener('touchstart', handleStart, { passive: true });
    element.addEventListener('touchmove', handleMove, { passive: false });
    element.addEventListener('touchend', handleEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleStart);
      element.removeEventListener('touchmove', handleMove);
      element.removeEventListener('touchend', handleEnd);
    };
  }, [isMobile]);

  const pagerTrackStyle = useMemo(() => {
    return {
      transform: `translate3d(calc(-${activeTab * 50}% + ${dragOffset}px), 0, 0)`,
      transition: isDragging ? 'none' : 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
      display: 'flex',
      width: '200%',
      height: '100%',
    } as React.CSSProperties;
  }, [activeTab, dragOffset, isDragging]);

  // Track viewport size
  useEffect(() => {
    const handleResize = () => {
      setViewportSize({ w: window.innerWidth, h: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Use fixed virtual paper pixels for layout; scale only the preview.
  const canvasSize = useMemo(
    () => getPaperCanvasSize(paper, orientation),
    [paper, orientation],
  );
  const previewScale = useMemo(
    () => computePreviewScale(
      canvasSize.w,
      canvasSize.h,
      viewportSize.w,
      viewportSize.h,
      isMobile,
    ),
    [canvasSize.h, canvasSize.w, viewportSize.h, viewportSize.w, isMobile],
  );

  // Wait for fonts before the first auto-fit pass so the binary search measures
  // final glyph widths. (Weighting is now manual via `quote.weight` + the 2D
  // checkerboard, so there's no async ranking step anymore.)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await waitForFonts();
      if (cancelled) return;
      // Tiny breathing room so the loading state is visible.
      await new Promise((r) => setTimeout(r, 250));
      if (cancelled) return;
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Reshuffle whenever the deck or the seed changes (stable for one seed).
  const shuffledQuotes = useMemo(
    () => shuffleQuotes(quotes, shuffleSeed),
    [quotes, shuffleSeed],
  );

  // Assign semantic cloud styles. The Hero is surgically re-centred by
  // `packRows` after the shuffle; per-cell bold/light is resolved at render.
  const items = useMemo(() => assignScatter(shuffledQuotes), [shuffledQuotes]);

  // Persist the deck to localStorage whenever it changes.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
    } catch {
      /* storage full or unavailable — keep running with in-memory state */
    }
  }, [quotes]);

  // Persist the "show author" toggle so it survives a page refresh.
  useEffect(() => {
    try {
      localStorage.setItem(SHOW_AUTHOR_KEY, String(showAuthor));
    } catch {
      /* storage full or unavailable — keep running with in-memory state */
    }
  }, [showAuthor]);

  // Persist the "italic author" toggle so it survives a page refresh.
  useEffect(() => {
    try {
      localStorage.setItem(ITALIC_AUTHOR_KEY, String(italicAuthor));
    } catch {}
  }, [italicAuthor]);

  // Persist the "show grid" toggle so it survives a page refresh.
  useEffect(() => {
    try {
      localStorage.setItem(SHOW_GRID_KEY, String(showGrid));
    } catch {}
  }, [showGrid]);

  // Persist the "color contrast" toggle so it survives a page refresh.
  useEffect(() => {
    try {
      localStorage.setItem(COLOR_CONTRAST_KEY, String(colorContrast));
    } catch {}
  }, [colorContrast]);

  // Persist language key to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LANGUAGE_KEY, lang);
    } catch {
      /* storage full or unavailable */
    }
  }, [lang]);

  // Persist theme to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* storage full or unavailable */
    }
  }, [theme]);



  // Persist themeMode to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(THEME_MODE_KEY, themeMode);
    } catch {
      /* storage full or unavailable */
    }
  }, [themeMode]);

  // Persist custom theme colors
  useEffect(() => {
    saveCustomColors(customColorsLight, 'light');
  }, [customColorsLight]);

  useEffect(() => {
    saveCustomColors(customColorsDark, 'dark');
  }, [customColorsDark]);

  // Persist custom theme font
  useEffect(() => {
    saveCustomFont(customFont);
  }, [customFont]);

  // Persist font override
  useEffect(() => {
    try {
      if (fontOverride) {
        localStorage.setItem('quote-cloud-font-override', fontOverride);
      } else {
        localStorage.removeItem('quote-cloud-font-override');
      }
    } catch {}
  }, [fontOverride]);

  // Persist user custom themes
  useEffect(() => {
    try {
      localStorage.setItem('quote-cloud-user-themes', JSON.stringify(userThemes));
    } catch {}
  }, [userThemes]);

  // Persist custom theme name
  useEffect(() => {
    try {
      localStorage.setItem('quote-cloud-custom-theme-name', customThemeName);
    } catch {}
  }, [customThemeName]);

  // Persist wallpaper/mask configurations
  useEffect(() => {
    try {
      localStorage.setItem('quote-cloud-mask-type', maskType);
    } catch {}
  }, [maskType]);

  useEffect(() => {
    try {
      localStorage.setItem('quote-cloud-mask-opacity', String(maskOpacity));
    } catch {}
  }, [maskOpacity]);

  useEffect(() => {
    try {
      localStorage.setItem('quote-cloud-show-preview-overlay', String(showPreviewOverlay));
    } catch {}
  }, [showPreviewOverlay]);

  // Language translation selector
  const t = useMemo(() => translations[lang], [lang]);

  // Language switcher that updates seed quotes if the user hasn't customized the deck
  const handleLanguageChange = useCallback((newLang: 'en' | 'zh') => {
    setLang(newLang);
    try {
      const hasCustomData = localStorage.getItem(STORAGE_KEY);
      if (!hasCustomData) {
        setQuotes(newLang === 'zh' ? SEED_QUOTES_ZH : SEED_QUOTES);
      }
    } catch {
      // fallback
    }
  }, []);

  // "I Feel Lucky" — swap in a fresh deck of famous quotes, reshuffle, close.
  const handleFeelLucky = useCallback(() => {
    setQuotes(lang === 'zh' ? FAMOUS_QUOTES_ZH : FAMOUS_QUOTES);
    setShuffleSeed(randomSeed());
    setManageOpen(false);
  }, [lang]);

  // Load a preset deck of quotes
  const handleLoadPreset = useCallback((presetQuotes: Quote[]) => {
    setQuotes(presetQuotes);
    setShuffleSeed(randomSeed());
  }, []);

  // Append a new quote to the deck.
  const handleAddQuote = useCallback((quote: Quote) => {
    setQuotes((prev) => [...prev, quote]);
  }, []);

  // Remove a quote by its index in the current deck.
  const handleDeleteQuote = useCallback((index: number) => {
    setQuotes((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Update a quote by its index in the current deck.
  const handleUpdateQuote = useCallback((index: number, updatedQuote: Quote) => {
    setQuotes((prev) => prev.map((q, i) => i === index ? updatedQuote : q));
  }, []);

  // Clear all quotes in the deck.
  const handleClearAllQuotes = useCallback(() => {
    setQuotes([]);
  }, []);

  // Inject print rule on paper/orientation change
  useEffect(() => {
    injectPrintRule(paper, orientation);
  }, [paper, orientation]);

  const handlePrint = useCallback(() => {
    injectPrintRule(paper, orientation);
    setTimeout(() => window.print(), 80);
  }, [paper, orientation]);

  // Handle theme changes and reset font overrides for presets
  const handleThemeChange = useCallback((newTheme: PosterTheme) => {
    setTheme(newTheme);
    if (newTheme !== 'custom') {
      setFontOverride(null);
    }
  }, []);

  const handleAddUserTheme = useCallback(() => {
    let lightColors = { ...customColorsLight };
    let darkColors = { ...customColorsDark };
    let font = customFont;
    let baseName = lang === 'zh' ? '自定义主题' : 'Custom Theme';

    if (theme !== 'custom') {
      const userTheme = userThemes.find(ut => ut.id === theme);
      if (userTheme) {
        lightColors = { ...userTheme.light };
        darkColors = { ...userTheme.dark };
        font = userTheme.fontFamily;
        baseName = userTheme.name;
      } else {
        const cfg = THEME_CONFIGS[theme as Exclude<PosterTheme, 'custom'>];
        if (cfg) {
          lightColors = { ...cfg.light };
          darkColors = { ...cfg.dark };
          font = cfg.fontFamily;
          baseName = lang === 'zh' ? cfg.nameZh : cfg.nameEn;
        }
      }
    }

    // Apply font override if active
    const finalFont = fontOverride || font;

    // Generate unique name suffix
    const cleanBaseName = baseName.replace(/\s*\(.*?\)\s*$/, '').replace(/-\d+$/, '');
    const count = userThemes.filter(ut => ut.name.startsWith(cleanBaseName)).length;
    const nameSuffix = count > 0 ? `-${count + 1}` : '-1';
    const newName = `${cleanBaseName}${nameSuffix}`;

    const newTheme: UserTheme = {
      id: `user-theme-${Date.now()}`,
      name: newName,
      fontFamily: finalFont,
      light: lightColors,
      dark: darkColors,
    };

    setUserThemes(prev => [...prev, newTheme]);
    setTheme(newTheme.id);
    setFontOverride(null); // Clear override as it is now baked into the theme
  }, [theme, lang, customColorsLight, customColorsDark, customFont, fontOverride, userThemes]);

  const handleDeleteUserTheme = useCallback((themeId: string) => {
    setUserThemes(prev => prev.filter(ut => ut.id !== themeId));
    if (theme === themeId) {
      setTheme('editorial');
      setFontOverride(null);
    }
  }, [theme]);

  const activeColors = useMemo(() => {
    if (theme === 'custom') {
      return themeMode === 'dark' ? customColorsDark : customColorsLight;
    }
    const userTheme = userThemes.find(ut => ut.id === theme);
    if (userTheme) {
      return themeMode === 'dark' ? userTheme.dark : userTheme.light;
    }
    const cfg = THEME_CONFIGS[theme as Exclude<PosterTheme, 'custom'>];
    if (!cfg) return themeMode === 'dark' ? customColorsDark : customColorsLight;
    return themeMode === 'dark' ? cfg.dark : cfg.light;
  }, [theme, themeMode, customColorsDark, customColorsLight, userThemes]);

  const workspaceStyle = useMemo(() => {
    const accentHex = activeColors.authorInk;
    const accentRgb = hexToRgb(accentHex);
    return {
      '--accent-color': accentHex,
      '--accent-color-rgb': accentRgb,
      '--theme-paper-bg': activeColors.paperBg,
      '--theme-w2-color': activeColors.w2Color,
      '--theme-w3-color': activeColors.w3Color,
    } as React.CSSProperties;
  }, [activeColors]);

  return (
    <div className={`workspace mode-${themeMode} theme-${theme}`} style={workspaceStyle}>
      <div className="workspace-grid" />
      <header className="workspace-header">
        <div className="flex items-center gap-6">
          <div className={`header-lang-switcher lang-${lang}`}>
            <div className="slider" />
            {(['zh', 'en'] as const).map((langCode) => {
              const active = lang === langCode;
              return (
                <button
                  key={langCode}
                  type="button"
                  onClick={() => handleLanguageChange(langCode)}
                  className={`header-switcher-btn ${active ? 'active' : ''}`}
                >
                  {langCode === 'en' ? 'EN' : '中文'}
                </button>
              );
            })}
          </div>
          <div className="logo">
            {lang === 'zh' ? '语录云图' : 'QUOTE CLOUD'}
            <span className="logo-sub">v3.0</span>
          </div>
        </div>
      </header>
      
      {isMobile ? (
        <>
          <main className={`app-main orientation-${orientation}`}>
            <div
              ref={pagerRef}
              className="mobile-pager"
            >
              <div className="mobile-pager-track" style={pagerTrackStyle}>
                {/* Page 1: Poster Canvas */}
                <div className="mobile-page-slide">
                  <div className="mobile-canvas-container">
                    <PaperCanvas
                      canvasSize={canvasSize}
                      previewScale={previewScale}
                      items={items}
                      showAuthor={showAuthor}
                      loading={loading}
                      theme={theme}
                      themeMode={themeMode}
                      customColors={themeMode === 'dark' ? customColorsDark : customColorsLight}
                      customFont={customFont}
                      composingText={t.loader.composing}
                      signatureText={t.loader.signature}
                      maskType={maskType}
                      maskOpacity={maskOpacity}
                      showPreviewOverlay={showPreviewOverlay}
                      orientation={orientation}
                      currentLang={lang}
                      showGrid={showGrid}
                      userThemes={userThemes}
                      fontOverride={fontOverride}
                      colorContrast={colorContrast}
                      italicAuthor={italicAuthor}
                    />
                  </div>
                </div>

                {/* Page 2: Control Panel */}
                <div className="mobile-page-slide mobile-controls-slide">
                  <ControlPanel
                    paper={paper}
                    orientation={orientation}
                    showAuthor={showAuthor}
                    colorContrast={colorContrast}
                    italicAuthor={italicAuthor}
                    theme={theme}
                    onPaperChange={setPaper}
                    onOrientationChange={setOrientation}
                    onShowAuthorChange={setShowAuthor}
                    onColorContrastChange={setColorContrast}
                    onItalicAuthorChange={setItalicAuthor}
                    onManageQuotes={() => setManageOpen(true)}
                    onOpenThemeModal={() => setThemeModalOpen(true)}
                    onOpenExportModal={() => setExportModalOpen(true)}
                    t={t}
                    currentLang={lang}
                    maskType={maskType}
                    maskOpacity={maskOpacity}
                    showPreviewOverlay={showPreviewOverlay}
                    onMaskTypeChange={setMaskType}
                    onMaskOpacityChange={setMaskOpacity}
                    onShowPreviewOverlayChange={setShowPreviewOverlay}
                    customThemeName={customThemeName}
                    onShuffle={() => setShuffleSeed(randomSeed())}
                    isMobile={isMobile}
                  />
                </div>
              </div>
            </div>
          </main>

          {/* Bottom mobile navbar */}
          <div className="mobile-navbar">
            <button
              type="button"
              className={`nav-item ${activeTab === 0 ? 'active' : ''}`}
              onClick={() => setActiveTab(0)}
            >
              <Eye />
              <span>{lang === 'zh' ? '海报预览' : 'Preview'}</span>
            </button>
            <button
              type="button"
              className={`nav-item ${activeTab === 1 ? 'active' : ''}`}
              onClick={() => setActiveTab(1)}
            >
              <Sliders />
              <span>{lang === 'zh' ? '个性排版' : 'Design'}</span>
            </button>
            <button
              type="button"
              className="nav-item export-btn"
              onClick={() => setExportModalOpen(true)}
            >
              <Download />
              <span>{lang === 'zh' ? '导出海报' : 'Export'}</span>
            </button>
          </div>
        </>
      ) : (
        <>
          <main className={`app-main orientation-${orientation}`}>
            <PaperCanvas
              canvasSize={canvasSize}
              previewScale={previewScale}
              items={items}
              showAuthor={showAuthor}
              loading={loading}
              theme={theme}
              themeMode={themeMode}
              customColors={themeMode === 'dark' ? customColorsDark : customColorsLight}
              customFont={customFont}
              composingText={t.loader.composing}
              signatureText={t.loader.signature}
              maskType={maskType}
              maskOpacity={maskOpacity}
              showPreviewOverlay={showPreviewOverlay}
              orientation={orientation}
              currentLang={lang}
              showGrid={showGrid}
              userThemes={userThemes}
              fontOverride={fontOverride}
              colorContrast={colorContrast}
              italicAuthor={italicAuthor}
            />
          </main>

          <ControlPanel
            paper={paper}
            orientation={orientation}
            showAuthor={showAuthor}
            colorContrast={colorContrast}
            italicAuthor={italicAuthor}
            theme={theme}
            onPaperChange={setPaper}
            onOrientationChange={setOrientation}
            onShowAuthorChange={setShowAuthor}
            onColorContrastChange={setColorContrast}
            onItalicAuthorChange={setItalicAuthor}
            onManageQuotes={() => setManageOpen(true)}
            onOpenThemeModal={() => setThemeModalOpen(true)}
            onOpenExportModal={() => setExportModalOpen(true)}
            t={t}
            currentLang={lang}
            maskType={maskType}
            maskOpacity={maskOpacity}
            showPreviewOverlay={showPreviewOverlay}
            onMaskTypeChange={setMaskType}
            onMaskOpacityChange={setMaskOpacity}
            onShowPreviewOverlayChange={setShowPreviewOverlay}
            customThemeName={customThemeName}
            onShuffle={() => setShuffleSeed(randomSeed())}
            isMobile={isMobile}
          />
        </>
      )}

      <QuoteManager
        open={manageOpen}
        quotes={quotes}
        onClose={() => setManageOpen(false)}
        onAdd={handleAddQuote}
        onDelete={handleDeleteQuote}
        onUpdate={handleUpdateQuote}
        onClearAll={handleClearAllQuotes}
        onFeelLucky={handleFeelLucky}
        onLoadPreset={handleLoadPreset}
        t={t}
        currentLang={lang}
      />

      <ThemeModal
        open={themeModalOpen}
        onClose={() => setThemeModalOpen(false)}
        theme={theme}
        onThemeChange={handleThemeChange}
        themeMode={themeMode}
        onThemeModeChange={setThemeMode}
        customColors={themeMode === 'dark' ? customColorsDark : customColorsLight}
        onCustomColorsChange={themeMode === 'dark' ? setCustomColorsDark : setCustomColorsLight}
        customFont={customFont}
        onCustomFontChange={setCustomFont}
        currentLang={lang}
        customThemeName={customThemeName}
        onCustomThemeNameChange={setCustomThemeName}
        showGrid={showGrid}
        onShowGridChange={setShowGrid}
        fontOverride={fontOverride}
        onFontOverrideChange={setFontOverride}
        userThemes={userThemes}
        onAddUserTheme={handleAddUserTheme}
        onDeleteUserTheme={handleDeleteUserTheme}
        previewItems={items}
        colorContrast={colorContrast}
        italicAuthor={italicAuthor}
      />

      <ExportModal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        canvasSize={canvasSize}
        orientation={orientation}
        paper={paper}
        themeMode={themeMode}
        currentLang={lang}
        t={t}
        onPrint={handlePrint}
      />

      <footer className="workspace-footer">
        <div className="footer-info">
          <span>{paper} ({orientation === 'portrait' ? (lang === 'zh' ? '纵向' : 'Portrait') : (lang === 'zh' ? '横向' : 'Landscape')})</span>
          <span className="separator">•</span>
          <span>{canvasSize.w} × {canvasSize.h} px</span>
        </div>
      </footer>
    </div>
  );
}
