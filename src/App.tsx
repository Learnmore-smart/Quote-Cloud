import { useState, useEffect, useCallback, useMemo } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { PaperCanvas } from './components/PaperCanvas';
import { iterativeFitLayout } from './layout';
import { injectPrintRule } from './print';
import { fetchWeights } from './weights';
import { SEED_QUOTES } from './seed';
import { PAPER_SIZES } from './config';
import type { PaperKey, Orientation, PlacedQuote, Quote } from './types';

import './styles.css';

/** Calculate the actual CSS pixel size of the paper canvas based on viewport */
function computePaperCssSize(
  paper: PaperKey,
  orientation: Orientation,
  viewportW: number,
  viewportH: number,
): { w: number; h: number } {
  const p = PAPER_SIZES[paper];
  const aspectRatio = orientation === 'landscape' ? p.h / p.w : p.w / p.h;
  const margin = 24;
  const availW = Math.max(200, viewportW - 64 - margin * 2);
  const availH = Math.max(200, viewportH - 144 - margin * 2);
  let cssW: number, cssH: number;
  if (availW / availH > aspectRatio) {
    cssH = availH;
    cssW = cssH * aspectRatio;
  } else {
    cssW = availW;
    cssH = cssW / aspectRatio;
  }
  return { w: Math.round(cssW), h: Math.round(cssH) };
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
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [placed, setPlaced] = useState<PlacedQuote[]>([]);
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

  // Compute actual CSS pixel size of paper canvas
  const canvasSize = useMemo(
    () => computePaperCssSize(paper, orientation, viewportSize.w, viewportSize.h),
    [paper, orientation, viewportSize.w, viewportSize.h],
  );

  // Fetch weights — must wait for fonts to load first so the
  // very first layout pass uses the final font metrics.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      // 1. Wait for fonts BEFORE measuring anything
      await waitForFonts();
      if (cancelled) return;
      // 2. Tiny breathing room so the loading state is visible
      await new Promise((r) => setTimeout(r, 250));
      // 3. Fetch AI weights (or fall back to local heuristic)
      const { data } = await fetchWeights(SEED_QUOTES);
      if (cancelled) return;
      const sanitized = data.map((q) => {
        const w = q.weight;
        const safe: 1 | 2 | 3 = w === 1 || w === 2 || w === 3 ? w : 2;
        return { ...q, weight: safe };
      });
      setQuotes(sanitized);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Re-layout when quotes or canvas size change
  useEffect(() => {
    if (quotes.length === 0) return;
    const result = iterativeFitLayout(quotes, canvasSize.w, canvasSize.h);
    setPlaced(result);
  }, [quotes, canvasSize.w, canvasSize.h]);

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
          placed={placed}
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
        onPrint={handlePrint}
      />
      <div className="signature">
        Quote Cloud · <span>AI</span> Layout Engine
      </div>
    </>
  );
}
