import { useLayoutEffect, useMemo, useRef } from 'react';
import type { CSSProperties } from 'react';
import { QuoteItem } from './QuoteItem';
import { Loader } from './Loader';
import { packRows } from '../scatter';
import type { ScatterItem } from '../scatter';

interface PaperCanvasProps {
  canvasSize: { w: number; h: number };
  previewScale: number;
  items: ScatterItem[];
  showAuthor: boolean;
  loading: boolean;
}

/* =============================================================================
 * Brute-force Auto-Fit Engine
 * -----------------------------------------------------------------------------
 * The paper is an absolute bounded arena (`overflow: hidden`). We lay every
 * quote into explicit full-width rows (see `packRows`), then binary-search the
 * largest `--base` font size where the cloud's natural `scrollHeight` still
 * fits inside the arena's `clientHeight`. Because the rows have NO horizontal
 * holes and a readability floor (>= 1.2em), the search now settles on a much
 * larger, balanced base that fills the page top to bottom without crushing the
 * smaller quotes into dust.
 * ========================================================================== */

/** Smallest base font we will ever try (px, in virtual canvas space). */
const MIN_FONT = 5;
/** Largest base font we will ever try (px, in virtual canvas space). */
const MAX_FONT = 100;
/** Stop the search once the window is tighter than this (px). */
const PRECISION = 0.5;

export function PaperCanvas({
  canvasSize,
  previewScale,
  items,
  showAuthor,
  loading,
}: PaperCanvasProps) {
  const arenaRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Group the flat quote list into explicit full-width rows of 1 or 2 quotes.
  const rows = useMemo(() => packRows(items), [items]);

  // Auto-fit: measure the real DOM and binary-search the base font size.
  useLayoutEffect(() => {
    const arena = arenaRef.current;
    const wrapper = wrapperRef.current;
    if (!arena || !wrapper) return;
    if (items.length === 0) return;

    // The arena's inner height is the hard ceiling. The wrapper carries the
    // padding, so a fit means `wrapper.scrollHeight <= arena.clientHeight`.
    const ceiling = arena.clientHeight;

    /** Apply a candidate size and force a synchronous reflow + measure. */
    const fitsAt = (size: number): boolean => {
      wrapper.style.setProperty('--base', `${size}px`);
      // Reading scrollHeight forces layout, so the loop measures fresh values.
      return wrapper.scrollHeight <= ceiling;
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
        // Too big — pull the ceiling down.
        max = mid;
      }
    }

    // Lock in the largest safe size.
    wrapper.style.setProperty('--base', `${best}px`);
  }, [rows, items, canvasSize.w, canvasSize.h, showAuthor]);

  const canvasStyle: CSSProperties = {
    width: `${canvasSize.w}px`,
    height: `${canvasSize.h}px`,
    transform: `scale(${previewScale})`,
  };

  return (
    <div className="paper-stage">
      <div
        className="paper-frame"
        style={{
          width: `${canvasSize.w * previewScale}px`,
          height: `${canvasSize.h * previewScale}px`,
        }}
      >
        <div
          className="paper-canvas"
          id="paperCanvas"
          ref={arenaRef}
          style={canvasStyle}
        >
          <div className="scatter-field" ref={wrapperRef}>
            {rows.map((row, rowIndex) => (
              <div className="quote-row" key={`row-${rowIndex}`}>
                {row.cells.map((cell, cellIndex) => (
                  <QuoteItem
                    key={`${cell.item.quote.author}-${rowIndex}-${cellIndex}`}
                    item={cell.item}
                    flex={cell.flex}
                    showAuthor={showAuthor}
                  />
                ))}
              </div>
            ))}
          </div>
          <Loader loading={loading} />
        </div>
      </div>
    </div>
  );
}
