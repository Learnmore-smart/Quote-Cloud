import type { PlacedQuote } from '../types';

interface QuoteItemProps {
  placed: PlacedQuote;
  showAuthor: boolean;
}

/**
 * A single quote rendered as an absolutely positioned block.
 *
 * `placed.x` / `placed.y` are CENTER coordinates (offset from the paper
 * center), so the element is anchored with:
 *   left: calc(50% + x - width/2)
 *   top:  calc(50% + y - height/2)
 *
 * The result is a perfectly packed, static, typographic Quote Cloud
 * with zero hover / focus / glow interactions.
 */
export function QuoteItem({ placed, showAuthor }: QuoteItemProps) {
  const classNames = [
    'quote',
    placed.className,
    showAuthor ? 'show-author' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={classNames}
      style={{
        left: `calc(50% + ${placed.x}px - ${placed.w / 2}px)`,
        top: `calc(50% + ${placed.y}px - ${placed.h / 2}px)`,
        width: placed.w + 'px',
        height: placed.h + 'px',
        fontSize: placed.fontSize + 'px',
        lineHeight: placed.lineHeight + 'px',
        fontWeight: placed.fontWeight,
        color: placed.color,
      }}
    >
      <span className="text">{placed.lines.join('\n')}</span>
      {showAuthor && placed.quote.author && (
        <span className="author">— {placed.quote.author}</span>
      )}
    </div>
  );
}
