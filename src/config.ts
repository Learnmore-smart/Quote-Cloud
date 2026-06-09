import type { PaperKey, PaperSize } from './types';

const CSS_PX_PER_MM = 96 / 25.4;

/* =============================================================
 * Paper sizes (mm, ISO)
 * ============================================================= */
export const PAPER_SIZES: Record<PaperKey, PaperSize> = {
  A3:     { w: 297,   h: 420   },
  A4:     { w: 210,   h: 297   },
  A5:     { w: 148,   h: 210   },
  Letter: { w: 215.9, h: 279.4 }, // 8.5 × 11 in
  Legal:  { w: 215.9, h: 355.6 }, // 8.5 × 14 in
};

// CSS @page size strings
export const PAPER_PAGE: Record<PaperKey, string> = {
  A3:     'A3',
  A4:     'A4',
  A5:     'A5',
  Letter: 'letter',
  Legal:  'legal',
};

/* =============================================================
 * OpenRouter API key (read from Vite env at build time)
 * ============================================================= */
export const OPENROUTER_API_KEY: string =
  (import.meta.env.VITE_OPENROUTER_API_KEY as string | undefined) ?? '';

export function getPaperCanvasSize(
  paper: PaperKey,
  orientation: 'portrait' | 'landscape',
): PaperSize {
  const size = PAPER_SIZES[paper];
  const widthMm = orientation === 'landscape' ? size.h : size.w;
  const heightMm = orientation === 'landscape' ? size.w : size.h;

  return {
    w: Math.round(widthMm * CSS_PX_PER_MM),
    h: Math.round(heightMm * CSS_PX_PER_MM),
  };
}
