import { prepareQuotes, measureQuote, getQuoteLines, maxWidthForWeight, LINE_HEIGHT_RATIO } from './measure';
import type { PlacedQuote, Quote } from './types';

/* =============================================================
 * Exact layout engine from spec — Archimedean spiral + AABB
 * ============================================================= */

interface Rectangle {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

/** Internal node passed to the spiral algorithm.
 *  `x` and `y` are CENTER coordinates relative to the spiral origin. */
interface QuoteNode {
  text: string;
  author: string;
  weight: number;
  width: number;
  height: number;
  x?: number;
  y?: number;
}

const COLLISION_PADDING = 12;
const MAX_ITERATIONS = 10;
const FILL_THRESHOLD = 0.80;
const SHRINK_FACTOR = 0.9;
const GROW_FACTOR = 1.1;
const MAX_R = 5000;
const THETA_STEP = 0.05;
const SPIRAL_FACTOR = 1.2;

/* 1. Exact AABB Overlap Check (from spec) */
function intersect(r1: Rectangle, r2: Rectangle): boolean {
  return !(r2.left > r1.right ||
           r2.right < r1.left ||
           r2.top > r1.bottom ||
           r2.bottom < r1.top);
}

/* 2. Archimedean Spiral Placement Loop (from spec — use this exact code) */
function calculateLayout(quotes: QuoteNode[], padding: number = COLLISION_PADDING): QuoteNode[] {
  const placed: { box: Rectangle; node: QuoteNode }[] = [];

  // Sort by weight descending so largest quotes occupy the center first
  const sorted = [...quotes].sort((a, b) => b.weight - a.weight);

  for (const node of sorted) {
    let theta = 0;
    let r = 0;
    let found = false;
    const step = THETA_STEP;          // tiny theta step for high-precision placement
    const spiralFactor = SPIRAL_FACTOR; // distance between spiral arms

    // Try to place the node along the spiral
    while (!found && r < MAX_R) {
      const x = Math.cos(theta) * r;
      const y = Math.sin(theta) * r;

      // Define the bounding box for the current position, centered on (x,y)
      const currentBox: Rectangle = {
        left: x - node.width / 2 - padding,
        right: x + node.width / 2 + padding,
        top: y - node.height / 2 - padding,
        bottom: y + node.height / 2 + padding,
      };

      // Check collision against all already placed nodes
      let collision = false;
      for (const p of placed) {
        if (intersect(currentBox, p.box)) {
          collision = true;
          break;
        }
      }

      if (!collision) {
        node.x = x;
        node.y = y;
        placed.push({ box: currentBox, node });
        found = true;
      }

      theta += step;
      r = spiralFactor * theta;
    }

    // Defensive fallback: if no spot was found, anchor the node at the
    // final spiral position so it is at least visible (may overlap).
    if (!found) {
      node.x = Math.cos(theta) * r;
      node.y = Math.sin(theta) * r;
    }
  }
  return sorted;
}

/* =============================================================
 * Iterative font-size fitting
 * ============================================================= */

/**
 * Run the spiral layout with the current font size, then adjust
 * baseFontSize until the packed cloud fits the paper with >= 80% fill.
 *
 * Output `PlacedQuote.x` / `.y` are CENTER coordinates relative to
 * the paper center, ready for `left: calc(50% + x - w/2)px` rendering.
 */
export function iterativeFitLayout(
  quotes: Quote[],
  canvasW: number,
  canvasH: number,
): PlacedQuote[] {
  const normalized: Quote[] = quotes.map((q) => ({
    ...q,
    weight: q.weight ?? 2,
  }));

  // Sort by weight descending (heaviest first → center)
  const sorted = normalized
    .slice()
    .sort((a, b) => (b.weight ?? 2) - (a.weight ?? 2));

  let baseFontSize = 20;
  let lastPlaced: PlacedQuote[] = [];
  // Track the best fitting result seen so far (no overflow, highest fill).
  // The shrink/grow oscillation may never produce a perfect fit in 10
  // iterations, so we fall back to whatever came closest to fitting.
  let bestPlaced: PlacedQuote[] | null = null;
  let bestFill = -Infinity;

  for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
    const result = layoutOnce(sorted, baseFontSize, canvasW, canvasH);
    lastPlaced = result.placed;

    if (!result.overflows && result.fillRatio > bestFill) {
      bestPlaced = result.placed;
      bestFill = result.fillRatio;
    }

    if (!result.overflows && result.fillRatio >= FILL_THRESHOLD) {
      return centerContent(result.placed, canvasW, canvasH);
    }

    if (result.overflows) {
      baseFontSize *= SHRINK_FACTOR;
    } else {
      baseFontSize *= GROW_FACTOR;
    }
  }

  // Reached the iteration cap — return the best non-overflowing layout
  // if we ever had one, otherwise fall back to the last placed result.
  return centerContent(bestPlaced ?? lastPlaced, canvasW, canvasH);
}

interface LayoutRun {
  placed: PlacedQuote[];
  overflows: boolean;
  fillRatio: number;
}

function layoutOnce(
  sorted: Quote[],
  baseFontSize: number,
  canvasW: number,
  canvasH: number,
): LayoutRun {
  const prepared = prepareQuotes(sorted, baseFontSize);

  // Measure every quote at the current font size
  const measured = prepared.map((pq) => {
    const w = pq.quote.weight ?? 2;
    const maxWidth = maxWidthForWeight(baseFontSize, w);
    const lineHeight = Math.round(pq.fontSize * LINE_HEIGHT_RATIO);
    const m = measureQuote(pq.prepared, maxWidth, lineHeight);
    const lines = getQuoteLines(pq.prepared, maxWidth);
    return { pq, maxWidth, lineHeight, lines, w: m.width, h: m.height };
  });

  // Build plain QuoteNode list for the spiral algorithm
  const nodes: QuoteNode[] = measured.map((m) => ({
    text: m.pq.quote.text,
    author: m.pq.quote.author,
    weight: m.pq.quote.weight ?? 2,
    width: m.w,
    height: m.h,
  }));

  const placedNodes = calculateLayout(nodes, COLLISION_PADDING);

  // Build PlacedQuote[] — node.x / .y are center coords
  const placed: PlacedQuote[] = placedNodes.map((node, i) => {
    const m = measured[i];
    const w = m.pq.quote.weight ?? 2;
    const color =
      w === 3 ? 'var(--w3-color)' : w === 2 ? 'var(--w2-color)' : 'var(--w1-color)';
    const className: PlacedQuote['className'] =
      w === 3 ? 'w3' : w === 2 ? 'w2' : 'w1';
    return {
      x: node.x ?? 0,
      y: node.y ?? 0,
      w: node.width,
      h: node.height,
      fontSize: m.pq.fontSize,
      lineHeight: m.lineHeight,
      fontWeight: m.pq.fontWeight,
      maxWidth: m.maxWidth,
      lines: m.lines,
      color,
      className,
      quote: m.pq.quote,
    };
  });

  // Compute bounding box (top-left / bottom-right in canvas coords,
  // assuming the spiral origin (0,0) will become the paper center).
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of placed) {
    const left = p.x - p.w / 2;
    const right = p.x + p.w / 2;
    const top = p.y - p.h / 2;
    const bottom = p.y + p.h / 2;
    if (left < minX) minX = left;
    if (top < minY) minY = top;
    if (right > maxX) maxX = right;
    if (bottom > maxY) maxY = bottom;
  }

  const contentW = Math.max(0, maxX - minX);
  const contentH = Math.max(0, maxY - minY);
  const contentArea = contentW * contentH;
  const paperArea = canvasW * canvasH;

  // After centering, the content occupies contentW × contentH. The paper is
  // canvasW × canvasH, so the cloud overflows when its dimensions exceed
  // the paper dimensions.
  const overflows = contentW > canvasW || contentH > canvasH;
  const fillRatio = paperArea > 0 ? contentArea / paperArea : 0;

  return { placed, overflows, fillRatio };
}

/**
 * Shift all nodes so that the cloud is centered at the spiral origin.
 *
 * The renderer anchors each quote with `left: calc(50% + x - w/2)px`,
 * which already places x=0 at the paper center. Therefore the cloud's
 * bounding-box midpoint must end up at (0, 0) — NOT at the paper center.
 * The shift is simply `(-cx, -cy)` where (cx, cy) is the bbox midpoint
 * produced by the spiral.
 */
function centerContent(
  placed: PlacedQuote[],
  _canvasW: number,
  _canvasH: number,
): PlacedQuote[] {
  if (placed.length === 0) return placed;

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of placed) {
    const left = p.x - p.w / 2;
    const right = p.x + p.w / 2;
    const top = p.y - p.h / 2;
    const bottom = p.y + p.h / 2;
    if (left < minX) minX = left;
    if (top < minY) minY = top;
    if (right > maxX) maxX = right;
    if (bottom > maxY) maxY = bottom;
  }

  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  // Negate only — the renderer's `calc(50% + x)` adds the paper
  // half-size for us, so we must not double-count it.
  const shiftX = -cx;
  const shiftY = -cy;

  return placed.map((p) => ({
    ...p,
    x: p.x + shiftX,
    y: p.y + shiftY,
  }));
}
