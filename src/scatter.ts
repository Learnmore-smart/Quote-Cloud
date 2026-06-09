import type { Quote } from './types';

/* =============================================================================
 * Bento Box Mosaic — "Gas Expansion / Fit-to-Box" strategy
 * -----------------------------------------------------------------------------
 * The page is tiled into a rigid grid of CLOSED boxes that cover 100% of the
 * area with zero gaps/holes:
 *
 *   - The paper is a vertical flex column. Each ROW gets a random vertical
 *     `flex` weight (1, 1.5, 2…) so the rows divide the height unevenly but
 *     COMPLETELY.
 *   - Each row is a horizontal flex line. Each CELL gets a random horizontal
 *     `flex` weight so the cells divide the width unevenly but COMPLETELY.
 *   - The Hero (index 0) is planted in the MIDDLE row with a big vertical
 *     weight and a solo (full-width) cell, so it always commands a huge box.
 *
 * The font size is NO LONGER decided here. Each cell renders an `<AutoFitQuote>`
 * that runs its OWN binary search to grow the text like a gas until it perfectly
 * hits the walls of its bounding box. So this module only decides GEOMETRY
 * (which quotes share a row, how big each box is) and per-quote STYLE flavor
 * (alignment, weight, line-height, casing).
 *
 * Everything is deterministic per index so the layout stays stable across
 * re-renders.
 * ========================================================================== */

export interface ScatterItem {
  quote: Quote;
  /** The one giant manifesto quote (index 0). */
  isHero: boolean;
  /** Text alignment inside the quote block. */
  align: 'left' | 'center' | 'right' | 'justify';
  /** Volume = weight: louder quotes are heavier. */
  fontWeight: number;
  /** Tight for loud headlines, looser for whispers. */
  lineHeight: number;
  /** Force UPPERCASE rendering (used by the Hero manifesto row). */
  uppercase: boolean;
}

/** A single closed box in the mosaic. */
export interface QuoteCell {
  item: ScatterItem;
  /** Horizontal flex-grow weight inside its row. */
  flex: number;
}

/** A horizontal row of boxes that fills 100% of the cloud width. */
export interface QuoteRow {
  cells: QuoteCell[];
  /** Vertical flex-grow weight of this row inside the column. */
  flex: number;
}

/** Deterministic PRNG so the poster stays stable across re-renders. */
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

/** Volume map: importance (weight) → loudness (font weight + line height). */
const VOLUME: Record<1 | 2 | 3, { fontWeight: number; lineHeight: number }> = {
  3: { fontWeight: 800, lineHeight: 1.05 }, // LOUD
  2: { fontWeight: 500, lineHeight: 1.15 }, // medium
  1: { fontWeight: 400, lineHeight: 1.25 }, // whisper
};

/** Random vertical row weights — the rows divide the page height unevenly. */
const ROW_FLEXES = [1, 1.4, 1.8, 2.2] as const;
/** Random horizontal cell weights — the cells divide a row width unevenly. */
const CELL_FLEXES = [1, 1.5, 2, 2.5] as const;

const ALIGNS = ['left', 'center', 'right', 'justify'] as const;

/**
 * Turn raw quotes into styled cloud items. Index 0 is always the Hero
 * manifesto; everyone else gets a deterministic style flavor derived from
 * their AI weight. The actual font SIZE is decided later, per cell, by the
 * `<AutoFitQuote>` gas-expansion search.
 */
export function assignScatter(quotes: Quote[]): ScatterItem[] {
  if (quotes.length === 0) return [];

  // The manifesto Hero is the "Yu He Wang" quote; fall back to index 0 so the
  // mosaic always has exactly one dominant headline even if the data shifts.
  const heroIdx = (() => {
    const byAuthor = quotes.findIndex((q) => q.author === 'Yu He Wang');
    return byAuthor >= 0 ? byAuthor : 0;
  })();

  return quotes.map((quote, index) => {
    // --- Hero: the loud, full-width manifesto headline -------------------
    if (index === heroIdx) {
      return {
        quote,
        isHero: true,
        align: 'center',
        fontWeight: 900,
        lineHeight: 0.95,
        uppercase: true,
      };
    }

    // --- Everyone else: a deterministic style flavor ---------------------
    const rnd = mulberry32(index * 2654435761 + 11);
    const weight = (quote.weight ?? 2) as 1 | 2 | 3;
    const vol = VOLUME[weight];

    return {
      quote,
      isHero: false,
      // Pick a varied alignment so the mosaic reads loose, never a stacked poem.
      align: ALIGNS[Math.floor(rnd() * ALIGNS.length)],
      fontWeight: vol.fontWeight,
      lineHeight: vol.lineHeight,
      uppercase: false,
    };
  });
}

/**
 * Build ONE mosaic row out of a group of 1–3 quotes, assigning each cell an
 * uneven horizontal flex weight so no two boxes share a width.
 */
function buildRow(group: ScatterItem[], seed: number): QuoteRow {
  const rnd = mulberry32(seed * 2654435761 + 17);

  const cells: QuoteCell[] = group.map((item) => ({
    item,
    flex: CELL_FLEXES[Math.floor(rnd() * CELL_FLEXES.length)],
  }));

  return {
    cells,
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
 *   3. Give each row a random vertical flex weight and each cell a random
 *      horizontal flex weight (see `buildRow`).
 *   4. `splice` the Hero (a tall, full-width solo row) into the MIDDLE.
 *
 * Because every row flex-grows to share the height and every cell flex-grows to
 * share the width, the page is mathematically guaranteed to be tiled with zero
 * holes.
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
  //    It gets the single largest vertical share of the page so the "Yu He Wang"
  //    manifesto always commands the biggest box in the mosaic.
  const heroRow: QuoteRow = {
    flex: 3.2, // dominant vertical share — the largest of any row
    cells: [
      {
        item: {
          ...hero,
          isHero: true,
          align: 'center',
          fontWeight: 900,
          lineHeight: 0.95,
          uppercase: true,
        },
        flex: 1,
      },
    ],
  };
  const middle = Math.floor(rows.length / 2);
  rows.splice(middle, 0, heroRow);

  return rows;
}
