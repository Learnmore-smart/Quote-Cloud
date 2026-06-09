import { QuoteItem } from './QuoteItem';
import { Loader } from './Loader';
import type { PlacedQuote } from '../types';

interface PaperCanvasProps {
  canvasSize: { w: number; h: number };
  previewScale: number;
  placed: PlacedQuote[];
  showAuthor: boolean;
  loading: boolean;
}

/**
 * The paper board. Renders all placed quotes as absolutely positioned
 * blocks anchored to the canvas center. No hover / focus interactions.
 */
export function PaperCanvas({
  canvasSize,
  previewScale,
  placed,
  showAuthor,
  loading,
}: PaperCanvasProps) {
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
          style={{
            width: `${canvasSize.w}px`,
            height: `${canvasSize.h}px`,
            transform: `scale(${previewScale})`,
          }}
        >
          {placed.map((p) => (
            <QuoteItem
              key={`${p.quote.author}-${p.quote.text}`}
              placed={p}
              showAuthor={showAuthor}
            />
          ))}
          <Loader loading={loading} />
        </div>
      </div>
    </div>
  );
}
