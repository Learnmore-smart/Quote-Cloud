import { QuoteItem } from './QuoteItem';
import { Loader } from './Loader';
import type { PlacedQuote } from '../types';

interface PaperCanvasProps {
  canvasSize: { w: number; h: number };
  placed: PlacedQuote[];
  showAuthor: boolean;
  loading: boolean;
}

/**
 * The paper board. Renders all placed quotes as absolutely positioned
 * blocks anchored to the canvas center. No hover / focus interactions.
 */
export function PaperCanvas({ canvasSize, placed, showAuthor, loading }: PaperCanvasProps) {
  return (
    <div className="paper-stage">
      <div
        className="paper-canvas"
        id="paperCanvas"
        style={{
          width: canvasSize.w + 'px',
          height: canvasSize.h + 'px',
        }}
      >
        {placed.map((p, i) => (
          <QuoteItem
            key={i}
            placed={p}
            showAuthor={showAuthor}
          />
        ))}
        <Loader loading={loading} />
      </div>
    </div>
  );
}
