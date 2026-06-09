import { useLayoutEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import { QuoteBlock } from './QuoteBlock';
import { Loader } from './Loader';
import type { ScatterItem } from '../scatter';

interface PaperCanvasProps {
  canvasSize: { w: number; h: number };
  previewScale: number;
  items: ScatterItem[];
  showAuthor: boolean;
  loading: boolean;
}

/* =============================================================================
 * Organic Quote Cloud Canvas
 * -----------------------------------------------------------------------------
 * The paper is a single free-flowing `flex-wrap` arena, pulled to the vertical
 * center (`align-content: center`). There is NO row packing and NO per-cell
 * search. Every <QuoteBlock> sizes itself in `em`, and ONE global auto-fit pass
 * here grows the arena's base font until the whole cloud organically touches
 * the widest or tallest bound of the paper.
 * ========================================================================== */

/** Smallest base font we will ever try (px, virtual canvas space). */
const MIN_BASE = 4;
/** Largest base font we will ever try (px, virtual canvas space). */
const MAX_BASE = 160;
/** Stop the search once the window is tighter than this (px). */
const PRECISION = 0.4;

export function PaperCanvas({
  canvasSize,
  previewScale,
  items,
  showAuthor,
  loading,
}: PaperCanvasProps) {
  const fieldRef = useRef<HTMLDivElement>(null);

  // Single global auto-fit: grow the container base font until the cloud
  // touches the paper bounds (vertically or horizontally), whichever first.
  useLayoutEffect(() => {
    const field = fieldRef.current;
    if (!field) return;

    const fit = () => {
      const maxH = field.clientHeight;
      const maxW = field.clientWidth;
      if (maxH <= 0 || maxW <= 0) return;

      // While probing, stack content from the top so `scrollHeight` reports the
      // TRUE total content height. With `align-content: center`, symmetric
      // overflow is clipped at the top and would otherwise be under-measured.
      const prevAlignContent = field.style.alignContent;
      field.style.alignContent = 'flex-start';

      // Apply a candidate base font and force a synchronous reflow + measure.
      const fitsAt = (size: number): boolean => {
        field.style.fontSize = `${size}px`;
        // Reading scroll* forces layout, so each probe measures fresh values.
        return field.scrollHeight <= maxH && field.scrollWidth <= maxW;
      };

      let min = MIN_BASE;
      let max = MAX_BASE;
      let best = MIN_BASE;

      while (max - min > PRECISION) {
        const mid = (min + max) / 2;
        if (fitsAt(mid)) {
          best = mid;
          min = mid;
        } else {
          max = mid;
        }
      }

      field.style.fontSize = `${best}px`;
      // Restore center-gravity so the settled cloud sits in the vertical middle.
      field.style.alignContent = prevAlignContent;
    };

    fit();

    // Re-grow the cloud whenever the paper / orientation / panel reflows.
    const observer = new ResizeObserver(() => fit());
    observer.observe(field);
    return () => observer.disconnect();
  }, [items, showAuthor]);

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
        <div className="paper-canvas" id="paperCanvas" style={canvasStyle}>
          <div className="scatter-field" ref={fieldRef}>
            {items.map((item, index) => (
              <QuoteBlock
                key={`${item.quote.author}-${index}`}
                item={item}
                showAuthor={showAuthor}
              />
            ))}
          </div>
          <Loader loading={loading} />
        </div>
      </div>
    </div>
  );
}
