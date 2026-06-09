/* Shared types for Quote Cloud (React + Pretext refactor) */

/** A single quote, with author and the body text. */
export interface Quote {
  author: string;
  text: string;
  /** 1 = light, 2 = medium, 3 = heavy. Defaults to 2 if unset. */
  weight?: 1 | 2 | 3;
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
  lines: string[];       // text per line for rendering
  color: string;
  className: 'w1' | 'w2' | 'w3';
  quote: Quote;
}

export type PaperKey = 'A4' | 'A3' | 'Letter';
export type Orientation = 'portrait' | 'landscape';

export interface PaperSize {
  w: number;
  h: number;
}
