/* Shared types for Quote Cloud (React + Pretext refactor) */

/** A single quote, with author and the body text. */
export interface Quote {
  author: string;
  text: string;
  /**
   * Optional manual styling override.
   *   - 'hero'  → the one exclusive massive, heavy, centered headline.
   *   - 'bold'  → black weight, claims a larger box.
   *   - 'light' → light weight, claims a smaller box.
   *   - 'auto' / undefined → fall back to the 2D checkerboard contrast logic.
   */
  weight?: 'auto' | 'bold' | 'light' | 'hero';
}

/** A quote that has been positioned on the paper.
 *  `x` and `y` are CENTER coordinates (offset from the paper center). */
export interface PlacedQuote {
  x: number;
  y: number;
  w: number;
  h: number;
  fontSize: number;
  lineHeight: number;
  fontWeight: number;
  maxWidth: number;
  lines: string[];
  authorText?: string;
  authorFontSize?: number;
  authorLineHeight?: number;
  authorMarginTop?: number;
  color: string;
  className: 'w1' | 'w2' | 'w3';
  quote: Quote;
}

export type PaperKey = 'A3' | 'A4' | 'A5' | 'Letter' | 'Legal';
export type Orientation = 'portrait' | 'landscape';
export type PosterTheme = string;

export interface PaperSize {
  w: number;
  h: number;
}

