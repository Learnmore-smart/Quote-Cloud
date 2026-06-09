import type { Quote } from './types';

/* =============================================================================
 * Organic Scatter Cloud — "center-gravity, ragged-edge" strategy
 * -----------------------------------------------------------------------------
 * This is NOT a rigid mosaic. There are no rows, no boxes, no forced
 * justification. Instead we emit a FLAT list of quotes with wildly contrasting,
 * asymmetric styles and let them flow into a `flex-wrap` arena that is pulled to
 * the vertical center of the paper. Negative space and ragged right/left edges
 * are FEATURES — they give the piece its airy "cloud" feeling.
 *
 *   - Sizes are expressed in `em`, relative to a single container base font.
 *     One global auto-fit pass (in <PaperCanvas>) grows that base until the
 *     whole cloud organically touches the bounds of the paper.
 *   - The Hero ("Building LearnX itself…", by Yu He Wang) is the loud,
 *     near-full-width manifesto. It is spliced into the MIDDLE of the array so
 *     it naturally renders at the cloud's center of gravity.
 *   - Everyone else is split into LOUD (~20%) and WHISPER (~80%) quotes with
 *     contrasting sizes, widths, weights and ragged alignments.
 *
 * Everything is deterministic per index so the layout stays stable across
 * re-renders.
 * ========================================================================== */

export interface ScatterItem {
  quote: Quote;
  /** The one giant manifesto quote, planted at the cloud's center. */
  isHero: boolean;
  /** Font size in `em`, relative to the container's auto-fit base font. */
  fontEm: number;
  /** Track width as a percentage string of the arena, e.g. '60%'. */
  width: string;
  /** Ragged alignment for an organic, jagged cloud edge. */
  align: 'left' | 'center' | 'right';
  /** Volume = weight: louder quotes are heavier. */
  fontWeight: number;
  /** Force UPPERCASE rendering (Hero only). */
  uppercase: boolean;
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

/** Linear interpolation between `lo` and `hi` by `t` (0..1). */
function lerp(lo: number, hi: number, t: number): number {
  return lo + (hi - lo) * t;
}

/** A percentage-width string sampled from the [lo, hi] range. */
function pct(lo: number, hi: number, t: number): string {
  return `${Math.round(lerp(lo, hi, t))}%`;
}

const ALIGNS = ['left', 'center', 'right'] as const;

/**
 * Turn raw quotes into an organic cloud of contrasting styles.
 *
 *   1. Pull the Hero ("Yu He Wang") out of the stream.
 *   2. Map everyone else to LOUD (~20%) or WHISPER (~80%) styles with
 *      contrasting sizes / widths / weights and a ragged alignment.
 *   3. `splice` the Hero into the MIDDLE so it lands at the center of gravity.
 *
 * The actual font SCALE is decided later, once, for the whole container by the
 * global auto-fit pass in <PaperCanvas>.
 */
export function assignScatter(quotes: Quote[]): ScatterItem[] {
  if (quotes.length === 0) return [];

  // The manifesto Hero is the "Yu He Wang" quote; fall back to index 0.
  const heroIdx = (() => {
    const byAuthor = quotes.findIndex((q) => q.author === 'Yu He Wang');
    return byAuthor >= 0 ? byAuthor : 0;
  })();

  const heroQuote = quotes[heroIdx];
  const rest = quotes.filter((_, idx) => idx !== heroIdx);

  // --- The crowd: extreme, asymmetric contrast -------------------------
  const items: ScatterItem[] = rest.map((quote, index) => {
    const rnd = mulberry32(index * 2654435761 + 11);
    const align = ALIGNS[Math.floor(rnd() * ALIGNS.length)];

    // ~20% of quotes shout; the other ~80% whisper.
    const isLoud = rnd() < 0.2;

    if (isLoud) {
      return {
        quote,
        isHero: false,
        fontEm: lerp(1.8, 2.2, rnd()), // 1.8em – 2.2em
        width: pct(50, 70, rnd()), // 50% – 70%
        align,
        fontWeight: 700, // font-bold
        uppercase: false,
      };
    }

    return {
      quote,
      isHero: false,
      fontEm: lerp(0.85, 1.1, rnd()), // 0.85em – 1.1em
      width: pct(30, 45, rnd()), // 30% – 45%
      align,
      fontWeight: rnd() < 0.5 ? 300 : 400, // font-light or font-normal
      uppercase: false,
    };
  });

  // --- The Hero: the loud, near-full-width manifesto -------------------
  const hero: ScatterItem = {
    quote: heroQuote,
    isHero: true,
    fontEm: 3.5, // 3.5em — by far the largest
    width: '90%', // 80% – 100% band
    align: 'center',
    fontWeight: 900, // font-black
    uppercase: true,
  };

  // 3. Drop the Hero into the exact middle so it reads at the cloud's center.
  const middle = Math.floor(items.length / 2);
  items.splice(middle, 0, hero);

  return items;
}
