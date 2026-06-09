import type { PaperKey, PaperSize } from './types';

/* =============================================================
 * Paper sizes (mm, ISO)
 * ============================================================= */
export const PAPER_SIZES: Record<PaperKey, PaperSize> = {
  A4:     { w: 210,  h: 297  },
  A3:     { w: 297,  h: 420  },
  Letter: { w: 215.9, h: 279.4 },
};

// CSS @page size strings
export const PAPER_PAGE: Record<PaperKey, string> = {
  A4:     'A4',
  A3:     'A3',
  Letter: 'letter',
};

/* =============================================================
 * OpenRouter API key (read from Vite env at build time)
 * ============================================================= */
export const OPENROUTER_API_KEY: string =
  (import.meta.env.VITE_OPENROUTER_API_KEY as string | undefined) ?? '';
