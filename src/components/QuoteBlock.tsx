import type { CSSProperties } from 'react';
import type { ScatterItem } from '../scatter';

interface QuoteBlockProps {
  item: ScatterItem;
  showAuthor: boolean;
}

/* =============================================================================
 * <QuoteBlock> — one quote in the organic cloud
 * -----------------------------------------------------------------------------
 * Purely presentational. It carries NO sizing logic of its own: its `fontSize`
 * is expressed in `em`, so the single global auto-fit pass in <PaperCanvas>
 * scales every block together by growing the container's base font. The block
 * claims a ragged share of the arena width (`flex-basis`) and wraps naturally,
 * leaving the airy negative space that gives the cloud its feel.
 * ========================================================================== */

export function QuoteBlock({ item, showAuthor }: QuoteBlockProps) {
  const { quote, isHero, fontEm, width, align, fontWeight, uppercase } = item;

  const style: CSSProperties = {
    // Ragged track width: grow no further than its share, shrink if it must.
    flexGrow: 0,
    flexShrink: 1,
    flexBasis: width,
    maxWidth: width,
    fontSize: `${fontEm}em`,
    textAlign: align,
    fontWeight,
    textTransform: uppercase ? 'uppercase' : 'none',
  };

  return (
    <p className={`quote${isHero ? ' quote-hero' : ''}`} style={style}>
      {quote.text}
      {showAuthor && quote.author && (
        <span className="author-name italic"> — {quote.author}</span>
      )}
    </p>
  );
}
