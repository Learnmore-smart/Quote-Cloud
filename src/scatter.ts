import type { Quote } from './types';

/* =============================================================================
 * Semantic Emotion Cloud — Explicit Row-Packing strategy
 * -----------------------------------------------------------------------------
 * The old "flat flex-wrap + random widths" approach left gigantic horizontal
 * holes at the end of every wrap line, and crushed the smaller quotes into
 * microscopic dust once the Auto-Fit engine scaled the cloud down to fit the
 * Hero. We fix both problems by forcing quotes into EXPLICIT full-width rows:
 *
 *   - Row 0 contains ONLY the Hero (quotes[0]).
 *   - Every other row holds 1 or 2 quotes, and the items inside it flex-grow to
 *     fill 100% of the width — so there can never be a hole on the right edge.
 *   - A readability FLOOR (>= 1.2em) keeps the small quotes legible.
 *
 * Everything is deterministic per index so the binary-search Auto-Fit engine
 * (in PaperCanvas) can scale the whole poster via `--base` without the layout
 * shifting under it (which would otherwise cause an infinite measure loop).
 * ========================================================================== */

export interface ScatterItem {
  quote: Quote;
  /** The one giant manifesto quote (index 0). */
  isHero: boolean;
  /** Text alignment inside the quote block. */
  align: 'left' | 'center' | 'right' | 'justify';
  /** Font size multiplier relative to the field `--base` font (never < 1.2). */
  fontEm: number;
  /** Volume = weight: louder quotes are heavier. */
  fontWeight: number;
  /** Tight for loud headlines, looser for whispers. */
  lineHeight: number;
}

/** A horizontal row of 1 or 2 quotes that fills 100% of the cloud width. */
export interface QuoteRow {
  /** Each cell carries its quote and the flex-grow weight it occupies. */
  cells: Array<{ item: ScatterItem; flex: number }>;
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

/** Readability floor + the three allowed "normal" sizes. NOTHING below 1.2em. */
const NORMAL_SIZES = [1.2, 1.5, 1.8] as const;

/** Volume map: importance (weight) → loudness (font weight + line height). */
const VOLUME: Record<1 | 2 | 3, { fontWeight: number; lineHeight: number }> = {
  3: { fontWeight: 800, lineHeight: 1.05 }, // LOUD
  2: { fontWeight: 500, lineHeight: 1.2 }, // medium
  1: { fontWeight: 400, lineHeight: 1.3 }, // whisper
};

/**
 * Turn raw quotes into styled cloud items. Index 0 is always the Hero
 * manifesto; everyone else gets a deterministic, readable size derived from
 * their AI weight. Row geometry is decided later, in `packRows`.
 */
export function assignScatter(quotes: Quote[]): ScatterItem[] {
  if (quotes.length === 0) return [];

  return quotes.map((quote, index) => {
    // --- Hero: the loud, full-width manifesto headline -------------------
    if (index === 0) {
      return {
        quote,
        isHero: true,
        align: 'center',
        fontEm: 2.5,
        fontWeight: 900,
        lineHeight: 0.95,
      };
    }

    // --- Everyone else: readable size, biased by AI weight ---------------
    const rnd = mulberry32(index * 2654435761 + 11);
    const weight = (quote.weight ?? 2) as 1 | 2 | 3;
    const vol = VOLUME[weight];

    // Bias the size pick by importance, but always stay >= 1.2em.
    let sizeIdx: number;
    if (weight === 3) {
      sizeIdx = 1 + Math.floor(rnd() * 2); // 1.5 or 1.8
    } else if (weight === 1) {
      sizeIdx = Math.floor(rnd() * 2); // 1.2 or 1.5
    } else {
      sizeIdx = Math.floor(rnd() * NORMAL_SIZES.length); // any of the three
    }

    return {
      quote,
      isHero: false,
      align: 'left',
      fontEm: NORMAL_SIZES[sizeIdx],
      fontWeight: vol.fontWeight,
      lineHeight: vol.lineHeight,
    };
  });
}

/**
 * Pack the flat item list into explicit full-width rows.
 *
 *   - Row 0 is the Hero, alone, spanning the full width.
 *   - The rest are grouped into rows of 1 or 2 quotes.
 *   - A single-quote row takes `flex: 1` (100% width) and justifies its text so
 *     it visually balances across the row instead of leaving a hole.
 *   - A two-quote row gives its cells UNEVEN flex weights (2 / 3) for contrast
 *     while still filling 100% of the width — zero horizontal holes.
 */
export function packRows(items: ScatterItem[]): QuoteRow[] {
  if (items.length === 0) return [];

  const rows: QuoteRow[] = [];

  // Row 0 — Hero alone, full width.
  rows.push({ cells: [{ item: items[0], flex: 1 }] });

  let i = 1;
  while (i < items.length) {
    const remaining = items.length - i;
    const pairRoll = mulberry32(i * 2654435761 + 7)();

    if (remaining >= 2 && pairRoll > 0.4) {
      // Two-quote row with uneven flex for contrast (no holes either way).
      const swap = mulberry32(i * 40503 + 3)() > 0.5;
      const a = { ...items[i], align: 'left' as const };
      const b = { ...items[i + 1], align: 'left' as const };
      rows.push({
        cells: [
          { item: a, flex: swap ? 3 : 2 },
          { item: b, flex: swap ? 2 : 3 },
        ],
      });
      i += 2;
    } else {
      // Single-quote row: full width, justified so it spans edge to edge.
      const solo = { ...items[i], align: 'justify' as const };
      rows.push({ cells: [{ item: solo, flex: 1 }] });
      i += 1;
    }
  }

  return rows;
}
