import { useState, useEffect, useCallback, useMemo } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { PaperCanvas } from './components/PaperCanvas';
import { assignScatter, shuffleQuotes } from './scatter';
import { injectPrintRule } from './print';
import { SEED_QUOTES, FAMOUS_QUOTES } from './seed';
import { getPaperCanvasSize } from './config';
import type { PaperKey, Orientation, Quote } from './types';

import './styles.css';

/** A fresh random seed — used to reshuffle the deck on demand. */
function randomSeed(): number {
  return Math.floor(Math.random() * 0x7fffffff);
}

function computePreviewScale(
  canvasW: number,
  canvasH: number,
  viewportW: number,
  viewportH: number,
): number {
  const availW = Math.max(240, viewportW - 64);
  const availH = Math.max(240, viewportH - 144);
  return Math.min(1, availW / canvasW, availH / canvasH);
}

/**
 * Wait until the document fonts are fully loaded so Pretext
 * measures text with the final glyph widths.
 */
async function waitForFonts(): Promise<void> {
  if (typeof document === 'undefined' || !document.fonts) return;
  try {
    await document.fonts.ready;
  } catch {
    /* ignore — fall back to whatever fonts are available */
  }
}

export default function App() {
  const [paper, setPaper] = useState<PaperKey>('A4');
  const [orientation, setOrientation] = useState<Orientation>('portrait');
  const [showAuthor, setShowAuthor] = useState(false);
  // Open-source ready: the deck lives in state so external inputs (or the
  // "I Feel Lucky" button) can swap it out and trigger a fresh layout.
  const [quotes, setQuotes] = useState<Quote[]>(SEED_QUOTES);
  // A per-mount random seed makes the layout look different on every refresh.
  const [shuffleSeed, setShuffleSeed] = useState<number>(() => randomSeed());
  const [loading, setLoading] = useState(true);
  const [viewportSize, setViewportSize] = useState({
    w: typeof window !== 'undefined' ? window.innerWidth : 1280,
    h: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  // Track viewport size
  useEffect(() => {
    const handleResize = () => {
      setViewportSize({ w: window.innerWidth, h: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Use fixed virtual paper pixels for layout; scale only the preview.
  const canvasSize = useMemo(
    () => getPaperCanvasSize(paper, orientation),
    [paper, orientation],
  );
  const previewScale = useMemo(
    () => computePreviewScale(
      canvasSize.w,
      canvasSize.h,
      viewportSize.w,
      viewportSize.h,
    ),
    [canvasSize.h, canvasSize.w, viewportSize.h, viewportSize.w],
  );

  // Wait for fonts before the first auto-fit pass so the binary search measures
  // final glyph widths. (Weighting is now manual via `quote.weight` + the 2D
  // checkerboard, so there's no async ranking step anymore.)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await waitForFonts();
      if (cancelled) return;
      // Tiny breathing room so the loading state is visible.
      await new Promise((r) => setTimeout(r, 250));
      if (cancelled) return;
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Reshuffle whenever the deck or the seed changes (stable for one seed).
  const shuffledQuotes = useMemo(
    () => shuffleQuotes(quotes, shuffleSeed),
    [quotes, shuffleSeed],
  );

  // Assign semantic cloud styles. The Hero is surgically re-centred by
  // `packRows` after the shuffle; per-cell bold/light is resolved at render.
  const items = useMemo(() => assignScatter(shuffledQuotes), [shuffledQuotes]);

  // "I Feel Lucky" — swap in a fresh deck of famous quotes and reshuffle.
  const handleFeelLucky = useCallback(() => {
    setQuotes(FAMOUS_QUOTES);
    setShuffleSeed(randomSeed());
  }, []);

  // Inject print rule on paper/orientation change
  useEffect(() => {
    injectPrintRule(paper, orientation);
  }, [paper, orientation]);

  const handlePrint = useCallback(() => {
    injectPrintRule(paper, orientation);
    setTimeout(() => window.print(), 80);
  }, [paper, orientation]);

  return (
    <>
      <div className="app">
        <PaperCanvas
          canvasSize={canvasSize}
          previewScale={previewScale}
          items={items}
          showAuthor={showAuthor}
          loading={loading}
        />
      </div>
      <ControlPanel
        paper={paper}
        orientation={orientation}
        showAuthor={showAuthor}
        onPaperChange={setPaper}
        onOrientationChange={setOrientation}
        onShowAuthorChange={setShowAuthor}
        onFeelLucky={handleFeelLucky}
        onPrint={handlePrint}
      />
      <div className="signature">
        Quote Cloud · <span>AI</span> Layout Engine
      </div>
    </>
  );
}
