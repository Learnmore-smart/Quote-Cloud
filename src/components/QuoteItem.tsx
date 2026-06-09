import type { PlacedQuote } from '../types';

interface QuoteItemProps {
  placed: PlacedQuote;
  showAuthor: boolean;
}

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
        left: '50%',
        top: '50%',
        transform: `translate(calc(-50% + ${placed.x}px), calc(-50% + ${placed.y}px))`,
        width: `${placed.w}px`,
        height: `${placed.h}px`,
        fontSize: `${placed.fontSize}px`,
        lineHeight: `${placed.lineHeight}px`,
        fontWeight: placed.fontWeight,
        color: placed.color,
      }}
    >
      <span className="text">{placed.lines.join('\n')}</span>
      {showAuthor && placed.authorText && (
        <span
          className="author"
          style={{
            marginTop: `${placed.authorMarginTop ?? 0}px`,
            fontSize: `${placed.authorFontSize ?? placed.fontSize * 0.55}px`,
            lineHeight: `${placed.authorLineHeight ?? placed.lineHeight * 0.55}px`,
          }}
        >
          {placed.authorText}
        </span>
      )}
    </div>
  );
}
