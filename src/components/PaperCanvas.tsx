import { useMemo } from 'react';
import type { CSSProperties } from 'react';
import { AutoFitQuote } from './AutoFitQuote';
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
 * Bento Box Mosaic Canvas
 * -----------------------------------------------------------------------------
 * The paper is a rigid, hole-free mosaic. `packRows` tiles the quotes into rows
 * (random vertical flex) and cells (random horizontal flex) that together cover
 * 100% of the page. There is NO global font search anymore — each cell renders
 * an `<AutoFitQuote>` that grows its own text like a gas until it hits the walls
 * of its bounding box.
 * ========================================================================== */

export function PaperCanvas({
  canvasSize,
  previewScale,
  items,
  showAuthor,
  loading,
}: PaperCanvasProps) {
  // Tile the flat quote list into the rigid full-bleed mosaic.
  const rows = useMemo(() => packRows(items), [items]);

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
          style={canvasStyle}
        >
          <div className="scatter-field">
            {rows.map((row, rowIndex) => (
              <div
                className="quote-row"
                key={`row-${rowIndex}`}
                style={{ flexGrow: row.flex, flexShrink: 1, flexBasis: 0 }}
              >
                {row.cells.map((cell, cellIndex) => (
                  <AutoFitQuote
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
