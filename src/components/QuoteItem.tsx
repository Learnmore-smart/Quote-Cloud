import type { CSSProperties } from 'react';
import type { ScatterItem } from '../scatter';

interface QuoteItemProps {
  item: ScatterItem;
  /** Flex-grow weight inside its row (1 for solo, 2 or 3 for a pair). */
  flex: number;
  showAuthor: boolean;
}

/**
 * A single quote block inside an explicit full-width row. It flex-grows to
 * fill its share of the row, so the row is always edge-to-edge with no holes.
 * Its font size is driven by *loudness* (importance) relative to the field
 * `--base`, so the binary-search Auto-Fit engine can scale the whole poster at
 * once by changing a single CSS variable.
 */
export function QuoteItem({ item, flex, showAuthor }: QuoteItemProps) {
  const { quote, isHero, align, fontEm, fontWeight, lineHeight } = item;

  const style: CSSProperties = {
    // Grow to fill the row; never overflow it.
    flexGrow: flex,
    flexShrink: 1,
    flexBasis: 0,
    minWidth: 0,
    textAlign: align,
    fontSize: `calc(var(--base, 18px) * ${fontEm})`,
    fontWeight,
    lineHeight,
  };

  return (
    <figure className={`quote${isHero ? ' quote-hero' : ''}`} style={style}>
      <span className="text">{quote.text}</span>
      {showAuthor && quote.author && (
        <span className="author-name">— {quote.author}</span>
      )}
    </figure>
  );
}
