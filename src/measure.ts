import { prepareWithSegments, layout, layoutWithLines } from '@chenglou/pretext';
import type { PreparedTextWithSegments } from '@chenglou/pretext';
import type { Quote } from './types';

const FONT_FAMILY = '"Noto Serif SC", "Cormorant Garamond", "Inter", Georgia, serif';

/** Weight → font weight number */
function fontWeightForWeight(w: number): number {
  switch (w) {
    case 3: return 700;
    case 2: return 500;
    default: return 400;
  }
}

/** Build CSS font string for Pretext prepare */
function fontString(fontSize: number, fontWeight: number): string {
  return `${fontWeight} ${fontSize}px ${FONT_FAMILY}`;
}

export interface PreparedQuote {
  quote: Quote;
  prepared: PreparedTextWithSegments;
  fontSize: number;
  fontWeight: number;
}

/**
 * Prepare all quotes with Pretext for a given baseFontSize.
 * This must be called whenever baseFontSize changes because
 * the font string includes the font size.
 */
export function prepareQuotes(
  quotes: Quote[],
  baseFontSize: number,
): PreparedQuote[] {
  return quotes.map((q) => {
    const w = q.weight ?? 2;
    const fontSize = fontSizeForWeight(baseFontSize, w);
    const fontWeight = fontWeightForWeight(w);
    const prepared = prepareWithSegments(q.text, fontString(fontSize, fontWeight));
    return { quote: q, prepared, fontSize, fontWeight };
  });
}

/** Map weight to actual font size based on baseFontSize */
export function fontSizeForWeight(baseFontSize: number, weight: number): number {
  switch (weight) {
    case 3: return baseFontSize * 1.5;
    case 2: return baseFontSize * 1.0;
    default: return baseFontSize * 0.7;
  }
}

/**
 * Map weight to maxWidth (proportional to baseFontSize so the
 * spiral packing can actually fit on the paper).
 *
 * The floor of 30 px prevents pathological one-character-per-line
 * wrapping when baseFontSize shrinks to a few pixels during
 * iterative fitting.
 */
export function maxWidthForWeight(baseFontSize: number, weight: number): number {
  const fs = fontSizeForWeight(baseFontSize, weight);
  return Math.max(30, fs * 7);
}

/** Measure a single prepared quote: returns { width, height, lineCount } */
export function measureQuote(
  prepared: PreparedTextWithSegments,
  maxWidth: number,
  lineHeight: number,
): { width: number; height: number; lineCount: number } {
  const result = layout(prepared, maxWidth, lineHeight);
  // Get actual max line width via layoutWithLines
  const withLines = layoutWithLines(prepared, maxWidth, lineHeight);
  let maxLineWidth = 0;
  for (const line of withLines.lines) {
    if (line.width > maxLineWidth) maxLineWidth = line.width;
  }
  return { width: maxLineWidth, height: result.height, lineCount: result.lineCount };
}

/** Get the text content of each line for rendering */
export function getQuoteLines(
  prepared: PreparedTextWithSegments,
  maxWidth: number,
): string[] {
  const result = layoutWithLines(prepared, maxWidth, 0);
  return result.lines.map((l) => l.text);
}

/** Line height multiplier */
export const LINE_HEIGHT_RATIO = 1.18;
