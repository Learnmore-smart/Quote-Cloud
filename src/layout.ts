import { calculateLayout, type QuoteNode } from './layoutCore';
import {
  LINE_HEIGHT_RATIO,
  maxWidthForWeight,
  measureAuthorLine,
  measureQuoteText,
  prepareQuotes,
} from './measure';
import type { PlacedQuote, Quote } from './types';

/* =============================================================================
 * Responsive, math-driven layout engine
 * -----------------------------------------------------------------------------
 * Goal: distribute N quotes across the ENTIRE canvas (any paper / orientation),
 * scaling type UP when there are few quotes and DOWN when there are many, with
 * zero overlaps and nothing bleeding past the page borders.
 *
 * Pipeline per layout:
 *   1. Reserve an inner margin so nothing touches the paper edge.
 *   2. Pick a starting font size from an area-coverage heuristic.
 *   3. Grow / shrink the font until the collision-packed cluster is the
 *      largest one that still fits inside the available area (aspect-matched
 *      spiral so the cluster naturally elongates for landscape vs portrait).
 *   4. Expand the placed positions outward (independently on X and Y) so the
 *      content snaps edge-to-edge. Pushing non-overlapping boxes apart can
 *      never create new overlaps, so this stays collision-free.
 * ========================================================================== */

const MARGIN_RATIO = 0.05;        // inner page margin, fraction of short side
const REFERENCE_FONT = 24;        // font used for the initial area estimate
const TARGET_COVERAGE = 0.55;     // rough ink coverage target for the estimate
const MIN_FONT = 7;
const MAX_FONT = 480;
const GROW_FACTOR = 1.1;
const SHRINK_FACTOR = 0.9;
const MAX_STEPS = 16;
const MAX_POSITION_EXPAND = 2.2;  // cap how far boxes are pushed apart to fill
const PADDING_RATIO = 0.5;        // gap between boxes, relative to base font

export interface IterativeFitOptions {
  showAuthor?: boolean;
  padding?: number;
}

interface MeasuredQuote {
  quote: Quote;
  width: number;
  height: number;
  fontSize: number;
  lineHeight: number;
  fontWeight: number;
  maxWidth: number;
  lines: string[];
  authorText?: string;
  authorFontSize?: number;
  authorLineHeight?: number;
  authorMarginTop?: number;
}

interface FitResult {
  placed: PlacedQuote[];
  bounds: Bounds;
  fits: boolean;
}

interface Bounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;
}

export function iterativeFitLayout(
  quotes: Quote[],
  canvasW: number,
  canvasH: number,
  options: IterativeFitOptions = {},
): PlacedQuote[] {
  if (quotes.length === 0) return [];

  const normalized: Quote[] = quotes.map((quote) => ({
    ...quote,
    weight: quote.weight ?? 2,
  }));
  const showAuthor = options.showAuthor ?? false;

  // 1. Available area inside the page margins.
  const margin = Math.round(Math.min(canvasW, canvasH) * MARGIN_RATIO);
  const availW = Math.max(40, canvasW - margin * 2);
  const availH = Math.max(40, canvasH - margin * 2);
  const aspect = availW / availH;

  const run = (base: number): FitResult =>
    layoutOnce(normalized, base, availW, availH, aspect, showAuthor);

  // 2. Seed font size from an area-coverage estimate so we start near the
  //    answer (the grow/shrink loop then nails the largest size that fits).
  const seedMeasured = measureQuotes(
    normalized,
    REFERENCE_FONT,
    availW,
    showAuthor,
  );
  const seedArea = seedMeasured.reduce((sum, m) => sum + m.width * m.height, 0);
  const fontScale = seedArea > 0
    ? Math.sqrt((TARGET_COVERAGE * availW * availH) / seedArea)
    : 1;
  let base = clamp(REFERENCE_FONT * fontScale, MIN_FONT, MAX_FONT);

  // 3. Grow while it fits, otherwise shrink until it fits. Keep the largest
  //    feasible layout we have seen.
  let current = run(base);
  let best: FitResult | null = current.fits ? current : null;

  if (current.fits) {
    for (let i = 0; i < MAX_STEPS; i += 1) {
      const next = clamp(base * GROW_FACTOR, MIN_FONT, MAX_FONT);
      if (next === base) break;
      const result = run(next);
      if (!result.fits) break;
      base = next;
      best = result;
    }
  } else {
    for (let i = 0; i < MAX_STEPS; i += 1) {
      base = clamp(base * SHRINK_FACTOR, MIN_FONT, MAX_FONT);
      current = run(base);
      if (current.fits || base <= MIN_FONT) {
        best = current;
        break;
      }
    }
  }

  const chosen = best ?? current;

  // 4. Push the cluster outward so it fills the page edge to edge.
  return expandToFill(chosen.placed, availW, availH);
}

function layoutOnce(
  quotes: Quote[],
  baseFontSize: number,
  availW: number,
  availH: number,
  aspect: number,
  showAuthor: boolean,
): FitResult {
  const measured = measureQuotes(quotes, baseFontSize, availW, showAuthor);

  const nodes: QuoteNode[] = measured.map((m) => ({
    text: m.quote.text,
    author: m.quote.author,
    weight: m.quote.weight ?? 2,
    width: m.width,
    height: m.height,
  }));
  const measuredByNode = new Map<QuoteNode, MeasuredQuote>();
  nodes.forEach((node, index) => measuredByNode.set(node, measured[index]));

  const padding = Math.max(6, baseFontSize * PADDING_RATIO);
  const placedNodes = calculateLayout(nodes, padding, aspect).filter(
    (node) => typeof node.x === 'number' && typeof node.y === 'number',
  );

  const placed: PlacedQuote[] = placedNodes.map((node) => {
    const m = measuredByNode.get(node);
    if (!m) throw new Error('Missing measured quote for placed node.');
    const weight = m.quote.weight ?? 2;

    return {
      x: node.x as number,
      y: node.y as number,
      w: node.width,
      h: node.height,
      fontSize: m.fontSize,
      lineHeight: m.lineHeight,
      fontWeight: m.fontWeight,
      maxWidth: m.maxWidth,
      lines: m.lines,
      authorText: m.authorText,
      authorFontSize: m.authorFontSize,
      authorLineHeight: m.authorLineHeight,
      authorMarginTop: m.authorMarginTop,
      color: weight === 3
        ? 'var(--w3-color)'
        : weight === 2
          ? 'var(--w2-color)'
          : 'var(--w1-color)',
      className: weight === 3 ? 'w3' : weight === 2 ? 'w2' : 'w1',
      quote: m.quote,
    };
  });

  const centered = centerContent(placed);
  const bounds = getBounds(centered);

  return {
    placed: centered,
    bounds,
    // small tolerance for floating point
    fits: bounds.width <= availW + 0.5 && bounds.height <= availH + 0.5,
  };
}

function measureQuotes(
  quotes: Quote[],
  baseFontSize: number,
  availW: number,
  showAuthor: boolean,
): MeasuredQuote[] {
  const prepared = prepareQuotes(quotes, baseFontSize);

  return prepared.map((preparedQuote): MeasuredQuote => {
    const weight = preparedQuote.quote.weight ?? 2;
    // Cap wrap width so a single quote can never span more than ~70% of the
    // page, which keeps long quotes inside the borders.
    const maxWidth = Math.min(
      maxWidthForWeight(baseFontSize, weight),
      availW * 0.7,
    );
    const lineHeight = Math.round(preparedQuote.fontSize * LINE_HEIGHT_RATIO);
    const textMeasure = measureQuoteText(
      preparedQuote.prepared,
      maxWidth,
      lineHeight,
    );
    const authorMeasure = showAuthor
      ? measureAuthorLine(preparedQuote.quote.author, preparedQuote.fontSize)
      : null;
    const authorHeight = authorMeasure
      ? authorMeasure.marginTop + authorMeasure.lineHeight
      : 0;

    return {
      quote: preparedQuote.quote,
      width: Math.max(textMeasure.width, authorMeasure?.width ?? 0),
      height: textMeasure.height + authorHeight,
      fontSize: preparedQuote.fontSize,
      lineHeight,
      fontWeight: preparedQuote.fontWeight,
      maxWidth,
      lines: textMeasure.lines,
      authorText: authorMeasure?.text,
      authorFontSize: authorMeasure?.fontSize,
      authorLineHeight: authorMeasure?.lineHeight,
      authorMarginTop: authorMeasure?.marginTop,
    };
  });
}

/**
 * Spread the (already centered) cluster outward so the extreme boxes touch the
 * page margins. X and Y are scaled independently, which is what produces the
 * edge-to-edge fill when the orientation changes. Because every box only moves
 * further from the centroid, no new collisions can be introduced.
 */
function expandToFill(
  placed: PlacedQuote[],
  availW: number,
  availH: number,
): PlacedQuote[] {
  if (placed.length === 0) return placed;

  const halfW = availW / 2;
  const halfH = availH / 2;
  let sx = MAX_POSITION_EXPAND;
  let sy = MAX_POSITION_EXPAND;

  for (const p of placed) {
    if (Math.abs(p.x) > 1) {
      const limit = (halfW - p.w / 2) / Math.abs(p.x);
      if (limit < sx) sx = limit;
    }
    if (Math.abs(p.y) > 1) {
      const limit = (halfH - p.h / 2) / Math.abs(p.y);
      if (limit < sy) sy = limit;
    }
  }

  const scaleX = clamp(sx, 1, MAX_POSITION_EXPAND);
  const scaleY = clamp(sy, 1, MAX_POSITION_EXPAND);

  if (scaleX === 1 && scaleY === 1) return placed;

  return placed.map((p) => ({ ...p, x: p.x * scaleX, y: p.y * scaleY }));
}

function getBounds(placed: PlacedQuote[]): Bounds {
  if (placed.length === 0) {
    return { minX: 0, maxX: 0, minY: 0, maxY: 0, width: 0, height: 0 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const p of placed) {
    const left = p.x - p.w / 2;
    const right = p.x + p.w / 2;
    const top = p.y - p.h / 2;
    const bottom = p.y + p.h / 2;
    if (left < minX) minX = left;
    if (right > maxX) maxX = right;
    if (top < minY) minY = top;
    if (bottom > maxY) maxY = bottom;
  }

  return { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY };
}

function centerContent(placed: PlacedQuote[]): PlacedQuote[] {
  const bounds = getBounds(placed);
  const centerX = (bounds.minX + bounds.maxX) / 2;
  const centerY = (bounds.minY + bounds.maxY) / 2;

  return placed.map((p) => ({ ...p, x: p.x - centerX, y: p.y - centerY }));
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
