import {
  layout,
  materializeLineRange,
  prepareWithSegments as prepare,
  walkLineRanges,
} from '@chenglou/pretext';
import type { PreparedTextWithSegments } from '@chenglou/pretext';
import type { Quote } from './types';

export const FONT_FAMILY = '"Noto Serif SC", "Source Han Serif SC", Georgia, serif';
export const LINE_HEIGHT_RATIO = 1.18;
export const AUTHOR_FONT_SIZE_RATIO = 0.55;
export const AUTHOR_LINE_HEIGHT_RATIO = 1.15;
export const AUTHOR_MARGIN_RATIO = 0.35;

function fontWeightForWeight(w: number): number {
  switch (w) {
    case 3:
      return 700;
    case 2:
      return 500;
    default:
      return 400;
  }
}

function fontString(
  fontSize: number,
  fontWeight: number,
  fontStyle = 'normal',
): string {
  return `${fontStyle} ${fontWeight} ${fontSize}px ${FONT_FAMILY}`;
}

export interface PreparedQuote {
  quote: Quote;
  prepared: PreparedTextWithSegments;
  fontSize: number;
  fontWeight: number;
}

export interface MeasuredText {
  width: number;
  height: number;
  lineCount: number;
  lines: string[];
}

export interface MeasuredAuthorLine {
  text: string;
  width: number;
  fontSize: number;
  lineHeight: number;
  marginTop: number;
}

export function prepareQuotes(
  quotes: Quote[],
  baseFontSize: number,
): PreparedQuote[] {
  return quotes.map((q) => {
    const weight = q.weight ?? 2;
    const fontSize = fontSizeForWeight(baseFontSize, weight);
    const fontWeight = fontWeightForWeight(weight);
    const prepared = prepare(q.text, fontString(fontSize, fontWeight), {
      letterSpacing: 0,
    });

    return { quote: q, prepared, fontSize, fontWeight };
  });
}

export function fontSizeForWeight(baseFontSize: number, weight: number): number {
  switch (weight) {
    case 3:
      return baseFontSize * 1.5;
    case 2:
      return baseFontSize;
    default:
      return baseFontSize * 0.7;
  }
}

export function maxWidthForWeight(baseFontSize: number, weight: number): number {
  const fontSize = fontSizeForWeight(baseFontSize, weight);
  return Math.max(30, fontSize * 7);
}

export function measureQuoteText(
  prepared: PreparedTextWithSegments,
  maxWidth: number,
  lineHeight: number,
): MeasuredText {
  const result = layout(prepared, maxWidth, lineHeight);
  let maxLineWidth = 0;
  const lines: string[] = [];

  walkLineRanges(prepared, maxWidth, (line) => {
    if (line.width > maxLineWidth) {
      maxLineWidth = line.width;
    }
    lines.push(materializeLineRange(prepared, line).text);
  });

  return {
    width: maxLineWidth,
    height: result.height,
    lineCount: result.lineCount,
    lines,
  };
}

export function measureAuthorLine(
  author: string,
  quoteFontSize: number,
): MeasuredAuthorLine | null {
  if (!author) {
    return null;
  }

  const fontSize = quoteFontSize * AUTHOR_FONT_SIZE_RATIO;
  const lineHeight = Math.round(fontSize * AUTHOR_LINE_HEIGHT_RATIO);
  const marginTop = quoteFontSize * AUTHOR_MARGIN_RATIO;
  const text = `- ${author}`;
  const prepared = prepare(text, fontString(fontSize, 500, 'italic'), {
    letterSpacing: 0,
  });
  let width = 0;

  walkLineRanges(prepared, 10000, (line) => {
    if (line.width > width) {
      width = line.width;
    }
  });

  return {
    text,
    width,
    fontSize,
    lineHeight,
    marginTop,
  };
}
