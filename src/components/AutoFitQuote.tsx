import { useLayoutEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import type { ScatterItem } from '../scatter';

interface AutoFitQuoteProps {
  item: ScatterItem;
  /** Horizontal flex-grow weight inside its row. */
  flex: number;
  showAuthor: boolean;
}

/* =============================================================================
 * <AutoFitQuote> — the "gas" inside one bento box
 * -----------------------------------------------------------------------------
 * This component owns a single closed cell. The cell flex-grows to fill its
 * share of the row (so the mosaic is hole-free), and the text inside it acts
 * like a gas: a binary search grows the `fontSize` until the text node perfectly
 * hits the walls of the cell — both vertically (`scrollHeight`) and horizontally
 * (`scrollWidth`). Every cell fits independently, so short quotes get to grow
 * just as large as their box allows.
 * ========================================================================== */

/** Smallest font we will ever try (px, in virtual canvas space). */
const MIN_FONT = 5;
/** Largest font we will ever try (px, in virtual canvas space). */
const MAX_FONT = 200;
/** Stop the search once the window is tighter than this (px). */
const PRECISION = 0.4;

export function AutoFitQuote({ item, flex, showAuthor }: AutoFitQuoteProps) {
  const { quote, isHero, fontWeight, lineHeight, uppercase } = item;

  const cellRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const cell = cellRef.current;
    const text = textRef.current;
    if (!cell || !text) return;

    /**
     * Run the binary search against the cell's CURRENT inner size. Re-invoked
     * whenever the box resizes (paper / orientation change, panel reflow).
     */
    const fit = () => {
      const maxH = cell.clientHeight;
      const maxW = cell.clientWidth;
      if (maxH <= 0 || maxW <= 0) return;

      /** Apply a candidate size and force a synchronous reflow + measure. */
      const fitsAt = (size: number): boolean => {
        text.style.fontSize = `${size}px`;
        // Reading scroll* forces layout, so each probe measures fresh values.
        return text.scrollHeight <= maxH && text.scrollWidth <= maxW;
      };

      let min = MIN_FONT;
      let max = MAX_FONT;
      let best = MIN_FONT;

      while (max - min > PRECISION) {
        const mid = (min + max) / 2;
        if (fitsAt(mid)) {
          // Fits — remember it and push for something bigger.
          best = mid;
          min = mid;
        } else {
          // Overflowed (vertically OR horizontally) — pull the ceiling down.
          max = mid;
        }
      }

      text.style.fontSize = `${best}px`;
    };

    fit();

    // The bento boxes change size when the paper / orientation changes. A
    // ResizeObserver re-grows the gas to the new walls without a manual dep.
    const observer = new ResizeObserver(() => fit());
    observer.observe(cell);
    return () => observer.disconnect();
  }, [quote.text, quote.author, showAuthor, fontWeight, lineHeight, uppercase]);

  const cellStyle: CSSProperties = {
    flexGrow: flex,
    flexShrink: 1,
    flexBasis: 0,
    minWidth: 0,
    // Container alignment: stack the text block and center it vertically so any
    // minor leftover space inside the box is consumed gracefully.
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    height: '100%',
  };

  // Smart typography. The dynamic, per-item bits (weight, line-height, casing)
  // stay inline; the balanced-justification rules now live in styles.css on the
  // `.quote` / `.quote-hero` classes to keep this component clean and ensure the
  // browser reliably applies `text-wrap: balance` + `text-align-last: justify`.
  const textStyle: CSSProperties = {
    fontWeight,
    lineHeight,
    textTransform: uppercase ? 'uppercase' : 'none',
  };

  return (
    <div
      ref={cellRef}
      className={`quote-cell${isHero ? ' quote-cell-hero' : ''}`}
      style={cellStyle}
    >
      <p
        ref={textRef}
        className={`quote${isHero ? ' quote-hero' : ''}`}
        style={textStyle}
      >
        {quote.text}
        {showAuthor && quote.author && (
          <span className="opacity-80 whitespace-nowrap">
            {' '}— {quote.author}
          </span>
        )}
      </p>
    </div>
  );
}
