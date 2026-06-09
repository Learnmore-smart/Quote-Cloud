import { useState, useEffect, useCallback, useMemo } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { PaperCanvas } from './components/PaperCanvas';
import { assignScatter } from './scatter';
import { injectPrintRule } from './print';
import { fetchWeights } from './weights';
import { SEED_QUOTES } from './seed';
import { getPaperCanvasSize } from './config';
import type { PaperKey, Orientation, Quote } from './types';

import './styles.css';

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
  const [quotes, setQuotes] = useState<Quote[]>([]);
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

  // Assign semantic cloud styles (loudness, ragged widths / alignments).
  // The actual font scaling now happens inside PaperCanvas via a measured
  // binary-search auto-fit pass, so no estimate is needed here.
  const items = useMemo(() => assignScatter(quotes), [quotes]);

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
        onPrint={handlePrint}
      />
      <div className="signature">
        Quote Cloud · <span>AI</span> Layout Engine
      </div>
    </>
  );
}
