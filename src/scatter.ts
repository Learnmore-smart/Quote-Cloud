import type { Quote } from './types';

/* =============================================================================
 * Bento Box Mosaic — "Gas Expansion / Fit-to-Box" strategy
 * -----------------------------------------------------------------------------
 * The page is tiled into a rigid grid of CLOSED boxes that cover 100% of the
 * area with zero gaps/holes:
 *
 *   - The paper is a vertical flex column. Each ROW gets a random vertical
 *     `flex` weight so the rows divide the height unevenly but COMPLETELY.
 *   - Each row is a horizontal flex line. The per-cell horizontal `flex` (and
 *     the bold/light styling) is decided at RENDER time by a 2D checkerboard so
 *     no two adjacent boxes — horizontally OR vertically — ever clash.
 *   - The Hero is planted in the MIDDLE row with a big vertical weight and a
 *     solo (full-width) cell, so it always commands a huge box.
 *
 * The font size is NOT decided here. Each cell renders an `<AutoFitQuote>` that
 * runs its OWN binary search to grow the text like a gas until it perfectly
 * hits the walls of its bounding box. So this module only decides GEOMETRY
 * (which quotes share a row, the hero placement) and the per-quote casing.
 * ========================================================================== */

export interface ScatterItem {
  quote: Quote;
  /** The one giant manifesto quote. */
  isHero: boolean;
  /** Base font weight. Overridden per-cell by the checkerboard at render. */
  fontWeight: number;
  /** Base line-height. Overridden per-cell by the checkerboard at render. */
  lineHeight: number;
  /** Force UPPERCASE rendering (used by the Hero manifesto row). */
  uppercase: boolean;
}

/** A single closed box in the mosaic. */
export interface QuoteCell {
  item: ScatterItem;
}

/** A horizontal row of boxes that fills 100% of the cloud width. */
export interface QuoteRow {
  cells: QuoteCell[];
  /** Vertical flex-grow weight of this row inside the column. */
  flex: number;
}

/** Deterministic PRNG so a given seed always yields the same poster. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Random vertical row weights — the rows divide the page height unevenly. */
const ROW_FLEXES = [1, 1.4, 1.8, 2.2] as const;

/**
 * Seeded Fisher–Yates shuffle. A fresh `seed` (random per mount, or bumped by
 * the "I Feel Lucky" button) reshuffles the deck so the poster looks different
 * every time it loads, while staying stable across re-renders for one seed.
 */
export function shuffleQuotes(quotes: Quote[], seed: number): Quote[] {
  const rnd = mulberry32(seed * 2654435761 + 101);
  const out = [...quotes];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rnd() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Turn raw quotes into styled cloud items. Exactly one quote becomes the Hero:
 * the first with `weight: 'hero'`, else the "Yu He Wang" manifesto, else the
 * first quote. Everyone else is left at neutral defaults — their bold/light
 * styling is resolved per-cell at render time by the 2D checkerboard.
 */
export function assignScatter(quotes: Quote[]): ScatterItem[] {
  if (quotes.length === 0) return [];

  const heroIdx = (() => {
    const byWeight = quotes.findIndex((q) => q.weight === 'hero');
    if (byWeight >= 0) return byWeight;
    const byAuthor = quotes.findIndex((q) => q.author === 'Yu He Wang');
    return byAuthor >= 0 ? byAuthor : 0;
  })();

  return quotes.map((quote, index) => {
    // --- Hero: the loud, full-width manifesto headline -------------------
    if (index === heroIdx) {
      return {
        quote,
        isHero: true,
        fontWeight: 900,
        lineHeight: 0.9,
        uppercase: true,
      };
    }

    // --- Everyone else: neutral defaults; the checkerboard owns the look.
    return {
      quote,
      isHero: false,
      fontWeight: 400,
      lineHeight: 1.1,
      uppercase: false,
    };
  });
}

/** Build ONE mosaic row out of a group of 1–3 quotes. */
function buildRow(group: ScatterItem[], seed: number): QuoteRow {
  const rnd = mulberry32(seed * 2654435761 + 17);
  return {
    cells: group.map((item) => ({ item })),
    flex: ROW_FLEXES[Math.floor(rnd() * ROW_FLEXES.length)],
  };
}

/**
 * Pack the flat item list into explicit full-width / full-height mosaic rows
 * with the Hero planted dead-center.
 *
 *   1. Pull the Hero out of the stream entirely.
 *   2. Chunk every OTHER quote into rows of 2 or 3 (we only ever emit a
 *      1-quote row when it's mathematically forced at the very end).
 *   3. Give each row a random vertical flex weight (see `buildRow`).
 *   4. `splice` the Hero (a tall, full-width solo row) into the MIDDLE.
 *
 * Because every row flex-grows to share the height and every cell flex-grows to
 * share the width, the page is guaranteed to be tiled with zero holes.
 */
export function packRows(items: ScatterItem[]): QuoteRow[] {
  if (items.length === 0) return [];

  // 1. Extract the Hero; everyone else flows into the mosaic.
  const heroIndex = items.findIndex((it) => it.isHero);
  const heroSourceIndex = heroIndex >= 0 ? heroIndex : 0;
  const hero = items[heroSourceIndex];
  const rest = items.filter((_, idx) => idx !== heroSourceIndex);

  const rows: QuoteRow[] = [];

  // 2 + 3. Chunk the non-hero quotes into rows of 2 or 3.
  let i = 0;
  let chunk = 0;
  while (i < rest.length) {
    const remaining = rest.length - i;
    let groupSize: number;

    if (remaining === 1) {
      groupSize = 1; // forced leftover — the ONLY way a 1-row appears
    } else if (remaining === 2) {
      groupSize = 2;
    } else if (remaining === 3) {
      groupSize = 3; // taking 2 would orphan a lonely 1
    } else if (remaining === 4) {
      groupSize = 2; // 2 + 2 beats 3 + 1 (no orphan)
    } else {
      // 5+ remaining: free to roll 2 or 3 — both leave a safe remainder.
      groupSize = mulberry32(chunk * 2654435761 + 7)() > 0.5 ? 3 : 2;
    }

    rows.push(buildRow(rest.slice(i, i + groupSize), chunk));
    i += groupSize;
    chunk += 1;
  }

  // 4. Drop the Hero into the exact middle as a tall, full-width solo row.
  const heroRow: QuoteRow = {
    flex: 3.2, // dominant vertical share — the largest of any row
    cells: [
      {
        item: {
          ...hero,
          isHero: true,
          fontWeight: 900,
          lineHeight: 0.9,
          uppercase: true,
        },
      },
    ],
  };
  const middle = Math.floor(rows.length / 2);
  rows.splice(middle, 0, heroRow);

  return rows;
}
