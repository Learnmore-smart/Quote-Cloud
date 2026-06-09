import { PAPER_PAGE } from './config';
import type { Orientation, PaperKey } from './types';

/**
 * Inject a dynamic @page rule for printing.
 */
export function injectPrintRule(
  paper: PaperKey,
  orientation: Orientation,
): void {
  // Remove existing
  document.querySelectorAll('style[data-dynamic="print"]').forEach((s) => s.remove());
  const size = PAPER_PAGE[paper] || 'A4';
  const orient = orientation;
  const css = `@media print { @page { size: ${size} ${orient}; margin: 0; } }`;
  const s = document.createElement('style');
  s.setAttribute('data-dynamic', 'print');
  s.textContent = css;
  document.head.appendChild(s);
}
