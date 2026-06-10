import type { PosterTheme } from './types';

export interface ThemeColors {
  paperBg: string;
  paperBorder: string;
  w3Color: string;
  w2Color: string;
  w1Color: string;
  authorInk: string;
}

export interface UserTheme {
  id: string;
  name: string;
  fontFamily: string;
  light: ThemeColors;
  dark: ThemeColors;
}

export interface ThemeConfig {
  id: PosterTheme;
  nameEn: string;
  nameZh: string;
  fontFamily: string;
  light: ThemeColors;
  dark: ThemeColors;
}

export const THEME_CONFIGS: Record<Exclude<PosterTheme, 'custom'>, ThemeConfig> = {
  editorial: {
    id: 'editorial',
    nameEn: 'Cream Editorial',
    nameZh: '暖雅人文',
    fontFamily: '"Noto Serif SC", "Source Han Serif SC", Georgia, serif',
    light: {
      paperBg: '#fffef9',
      paperBorder: '#e3decb',
      w3Color: '#161513',
      w2Color: '#2b2926',
      w1Color: '#59544c',
      authorInk: '#7a6e5e',
    },
    dark: {
      paperBg: '#181715',
      paperBorder: '#2d2b27',
      w3Color: '#fffef9',
      w2Color: '#e3decb',
      w1Color: '#a19b8f',
      authorInk: '#c7beaf',
    },
  },
  midnight: {
    id: 'midnight',
    nameEn: 'Midnight Gallery',
    nameZh: '暗夜画廊',
    fontFamily: '"Cormorant Garamond", "Noto Serif SC", "Source Han Serif SC", serif',
    light: {
      paperBg: '#f5f5f8',
      paperBorder: '#dcdce2',
      w3Color: '#1a1a24',
      w2Color: '#b45309',
      w1Color: '#4f4f66',
      authorInk: '#6e6e85',
    },
    dark: {
      paperBg: '#111111',
      paperBorder: '#222222',
      w3Color: '#ffffff',
      w2Color: '#d4af37',
      w1Color: '#a3a3a3',
      authorInk: '#737373',
    },
  },
  swiss: {
    id: 'swiss',
    nameEn: 'Swiss Grotesk',
    nameZh: '瑞士极简',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    light: {
      paperBg: '#ffffff',
      paperBorder: '#111111',
      w3Color: '#000000',
      w2Color: '#171717',
      w1Color: '#525252',
      authorInk: '#e11d48',
    },
    dark: {
      paperBg: '#0f0f0f',
      paperBorder: '#e5e5e5',
      w3Color: '#ffffff',
      w2Color: '#e5e5e5',
      w1Color: '#a3a3a3',
      authorInk: '#f43f5e',
    },
  },
  mono: {
    id: 'mono',
    nameEn: 'Terminal Mono',
    nameZh: '极客终端',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    light: {
      paperBg: '#f0fdf4',
      paperBorder: '#86efac',
      w3Color: '#166534',
      w2Color: '#15803d',
      w1Color: '#16a34a',
      authorInk: '#c2410c',
    },
    dark: {
      paperBg: '#0b0f17',
      paperBorder: '#10b981',
      w3Color: '#10b981',
      w2Color: '#34d399',
      w1Color: '#059669',
      authorInk: '#f59e0b',
    },
  },
  vintage: {
    id: 'vintage',
    nameEn: 'Vintage Journal',
    nameZh: '复古书页',
    fontFamily: '"Cormorant Garamond", "Noto Serif SC", serif',
    light: {
      paperBg: '#f2e9dc',
      paperBorder: '#c8bba6',
      w3Color: '#0f172a',
      w2Color: '#1e293b',
      w1Color: '#475569',
      authorInk: '#7c2d12',
    },
    dark: {
      paperBg: '#2c221a',
      paperBorder: '#4a3c30',
      w3Color: '#f5ebe0',
      w2Color: '#e3d5ca',
      w1Color: '#b5a492',
      authorInk: '#ea580c',
    },
  },
  nordic: {
    id: 'nordic',
    nameEn: 'Nordic Calm',
    nameZh: '北欧清冷',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    light: {
      paperBg: '#f8fafc',
      paperBorder: '#e2e8f0',
      w3Color: '#0f172a',
      w2Color: '#1e293b',
      w1Color: '#475569',
      authorInk: '#0284c7',
    },
    dark: {
      paperBg: '#0f172a',
      paperBorder: '#1e293b',
      w3Color: '#f8fafc',
      w2Color: '#e2e8f0',
      w1Color: '#94a3b8',
      authorInk: '#38bdf8',
    },
  },
  forest: {
    id: 'forest',
    nameEn: 'Forest Moss',
    nameZh: '森林绿意',
    fontFamily: '"Noto Serif SC", "Source Han Serif SC", serif',
    light: {
      paperBg: '#f4f6f0',
      paperBorder: '#d2dcd0',
      w3Color: '#1a2e1a',
      w2Color: '#2d4a2d',
      w1Color: '#4a6b5d',
      authorInk: '#b45309',
    },
    dark: {
      paperBg: '#121a13',
      paperBorder: '#1c2e20',
      w3Color: '#ecfdf5',
      w2Color: '#a7f3d0',
      w1Color: '#529b76',
      authorInk: '#f59e0b',
    },
  },
  lavender: {
    id: 'lavender',
    nameEn: 'Lavender Mist',
    nameZh: '薰衣草梦',
    fontFamily: '"Cormorant Garamond", "Noto Serif SC", serif',
    light: {
      paperBg: '#faf9ff',
      paperBorder: '#e8e5f5',
      w3Color: '#2e1065',
      w2Color: '#4c1d95',
      w1Color: '#6d28d9',
      authorInk: '#db2777',
    },
    dark: {
      paperBg: '#1b1931',
      paperBorder: '#2a264a',
      w3Color: '#faf9ff',
      w2Color: '#c084fc',
      w1Color: '#a5b4fc',
      authorInk: '#f472b6',
    },
  },
  cyberpunk: {
    id: 'cyberpunk',
    nameEn: 'Cyber Punk',
    nameZh: '赛博朋克',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    light: {
      paperBg: '#fef08a',
      paperBorder: '#000000',
      w3Color: '#000000',
      w2Color: '#0f172a',
      w1Color: '#334155',
      authorInk: '#0a0a0a',
    },
    dark: {
      paperBg: '#09090b',
      paperBorder: '#fef08a',
      w3Color: '#fef08a',
      w2Color: '#22d3ee',
      w1Color: '#f472b6',
      authorInk: '#fef08a',
    },
  },
  oceanic: {
    id: 'oceanic',
    nameEn: 'Oceanic Breeze',
    nameZh: '深海微风',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    light: {
      paperBg: '#f0fdfa',
      paperBorder: '#ccfbf1',
      w3Color: '#115e59',
      w2Color: '#0f766e',
      w1Color: '#0d9488',
      authorInk: '#0284c7',
    },
    dark: {
      paperBg: '#042f2e',
      paperBorder: '#115e59',
      w3Color: '#ccfbf1',
      w2Color: '#2dd4bf',
      w1Color: '#38bdf8',
      authorInk: '#fb7185',
    },
  },
};

export const DEFAULT_CUSTOM_COLORS_LIGHT: ThemeColors = {
  paperBg: '#ffffff',
  paperBorder: '#cbd5e1',
  w3Color: '#0f172a',
  w2Color: '#334155',
  w1Color: '#64748b',
  authorInk: '#10b981',
};

export const DEFAULT_CUSTOM_COLORS_DARK: ThemeColors = {
  paperBg: '#121212',
  paperBorder: '#27272a',
  w3Color: '#f4f4f5',
  w2Color: '#e4e4e7',
  w1Color: '#a1a1aa',
  authorInk: '#10b981',
};

export const DEFAULT_CUSTOM_COLORS = DEFAULT_CUSTOM_COLORS_LIGHT;

const CUSTOM_COLORS_LIGHT_KEY = 'quote-cloud-custom-theme-colors-light';
const CUSTOM_COLORS_DARK_KEY = 'quote-cloud-custom-theme-colors-dark';
const CUSTOM_COLORS_KEY = 'quote-cloud-custom-theme-colors';
const CUSTOM_FONT_KEY = 'quote-cloud-custom-theme-font';

export function loadCustomColors(mode: 'light' | 'dark' = 'light'): ThemeColors {
  if (typeof localStorage === 'undefined') {
    return mode === 'dark' ? DEFAULT_CUSTOM_COLORS_DARK : DEFAULT_CUSTOM_COLORS_LIGHT;
  }
  try {
    const key = mode === 'dark' ? CUSTOM_COLORS_DARK_KEY : CUSTOM_COLORS_LIGHT_KEY;
    const cached = localStorage.getItem(key);
    if (cached) {
      const parsed = JSON.parse(cached);
      return {
        ...(mode === 'dark' ? DEFAULT_CUSTOM_COLORS_DARK : DEFAULT_CUSTOM_COLORS_LIGHT),
        ...parsed,
      };
    } else if (mode === 'light') {
      const oldCached = localStorage.getItem(CUSTOM_COLORS_KEY);
      if (oldCached) {
        const parsed = JSON.parse(oldCached);
        return {
          ...DEFAULT_CUSTOM_COLORS_LIGHT,
          ...parsed,
        };
      }
    }
  } catch {}
  return mode === 'dark' ? DEFAULT_CUSTOM_COLORS_DARK : DEFAULT_CUSTOM_COLORS_LIGHT;
}

export function saveCustomColors(colors: ThemeColors, mode: 'light' | 'dark' = 'light') {
  try {
    const key = mode === 'dark' ? CUSTOM_COLORS_DARK_KEY : CUSTOM_COLORS_LIGHT_KEY;
    localStorage.setItem(key, JSON.stringify(colors));
  } catch {}
}

export function loadCustomFont(): string {
  if (typeof localStorage === 'undefined') return '"Inter", sans-serif';
  try {
    return localStorage.getItem(CUSTOM_FONT_KEY) || '"Inter", sans-serif';
  } catch {}
  return '"Inter", sans-serif';
}

export function saveCustomFont(font: string) {
  try {
    localStorage.setItem(CUSTOM_FONT_KEY, font);
  } catch {}
}
