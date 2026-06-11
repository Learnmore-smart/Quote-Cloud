import { useEffect, useRef, useState } from 'react';
import { Download, FileText, Image, Printer, X, Loader2 } from 'lucide-react';
import { toPng, toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import type { PaperKey, Orientation } from '../types';

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
  canvasSize: { w: number; h: number };
  orientation: Orientation;
  paper: PaperKey;
  themeMode: 'dark' | 'light';
  currentLang: 'en' | 'zh';
  t: any;
  onPrint: () => void;
}

export function ExportModal({
  open,
  onClose,
  canvasSize,
  orientation,
  paper,
  themeMode,
  currentLang,
  t,
  onPrint,
}: ExportModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [exportingFormat, setExportingFormat] = useState<'png' | 'jpeg' | 'pdf' | null>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, onClose]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const getFileName = (ext: string) => {
    return `quote-cloud-${paper.toLowerCase()}-${orientation}-${Date.now()}.${ext}`;
  };

  const handleExport = async (format: 'png' | 'jpeg' | 'pdf') => {
    const element = document.getElementById('paperCanvas');
    if (!element) return;

    setExportingFormat(format);

    try {
      // Small delay to make sure UI states settle and are clean
      await new Promise((resolve) => setTimeout(resolve, 200));

      const options = {
        pixelRatio: 2.5, // Crisp high-DPI scaling
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
        },
        width: canvasSize.w,
        height: canvasSize.h,
        filter: (node: Node) => {
          const el = node as HTMLElement;
          if (el.classList) {
            // Exclude device preview overlays, loader spinner during export
            if (
              el.classList.contains('wallpaper-preview-overlay') ||
              el.classList.contains('print:hidden') ||
              el.classList.contains('loader-container')
            ) {
              return false;
            }
          }
          return true;
        },
      };

      if (format === 'png') {
        const dataUrl = await toPng(element, options);
        const link = document.createElement('a');
        link.download = getFileName('png');
        link.href = dataUrl;
        link.click();
      } else if (format === 'jpeg') {
        const dataUrl = await toJpeg(element, { ...options, quality: 0.95 });
        const link = document.createElement('a');
        link.download = getFileName('jpg');
        link.href = dataUrl;
        link.click();
      } else if (format === 'pdf') {
        const dataUrl = await toPng(element, options);
        const pdf = new jsPDF({
          orientation: orientation === 'portrait' ? 'portrait' : 'landscape',
          unit: 'px',
          format: [canvasSize.w, canvasSize.h],
        });
        pdf.addImage(dataUrl, 'PNG', 0, 0, canvasSize.w, canvasSize.h);
        pdf.save(getFileName('pdf'));
      }
    } catch (error) {
      console.error('Failed to export poster:', error);
      alert(currentLang === 'zh' ? '导出失败，请重试' : 'Export failed. Please try again.');
    } finally {
      setExportingFormat(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 select-none animate-fadeIn">
      <div
        ref={modalRef}
        className={`relative flex w-full max-w-[580px] flex-col overflow-hidden rounded-3xl border shadow-2xl backdrop-blur-2xl [font-family:Inter,sans-serif] modal-theme-${themeMode} theme-modal-window`}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-50 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border transition-colors theme-modal-close-btn"
          aria-label="Close"
        >
          <X className="h-4 w-4" strokeWidth={2.5} />
        </button>

        {/* Modal Header */}
        <div className="p-6 border-b border-neutral-200/10 theme-modal-border-light">
          <h2 className="text-lg font-bold tracking-tight theme-modal-text-title">
            {t.exportModal.title}
          </h2>
          <p className="text-xs mt-1 theme-modal-text-muted">
            {t.exportModal.subtitle}
          </p>
        </div>

        {/* Modal Body / Formats Grid */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* PNG Option Card */}
          <div className="flex flex-col justify-between rounded-2xl border p-4 theme-modal-card hover:brightness-105 transition-all">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Image className="h-4.5 w-4.5" />
                </div>
                <h3 className="font-bold text-sm" style={{ color: 'var(--modal-text)' }}>
                  {t.exportModal.pngTitle}
                </h3>
              </div>
              <p className="text-xs leading-relaxed min-h-[36px]" style={{ color: 'var(--modal-text-muted)' }}>
                {t.exportModal.pngDesc}
              </p>
            </div>
            <button
              type="button"
              disabled={exportingFormat !== null}
              onClick={() => handleExport('png')}
              style={{
                backgroundColor: exportingFormat === 'png' ? undefined : 'var(--accent-color)',
                color: exportingFormat === 'png' ? undefined : 'var(--theme-paper-bg)',
              }}
              className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-md disabled:cursor-not-allowed hover:scale-[1.01] controls-cta-btn"
            >
              {exportingFormat === 'png' ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  {t.exportModal.generating}
                </>
              ) : (
                <>
                  <Download className="h-3.5 w-3.5" />
                  {t.exportModal.pngAction}
                </>
              )}
            </button>
          </div>

          {/* JPEG Option Card */}
          <div className="flex flex-col justify-between rounded-2xl border p-4 theme-modal-card hover:brightness-105 transition-all">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Image className="h-4.5 w-4.5" />
                </div>
                <h3 className="font-bold text-sm" style={{ color: 'var(--modal-text)' }}>
                  {t.exportModal.jpgTitle}
                </h3>
              </div>
              <p className="text-xs leading-relaxed min-h-[36px]" style={{ color: 'var(--modal-text-muted)' }}>
                {t.exportModal.jpgDesc}
              </p>
            </div>
            <button
              type="button"
              disabled={exportingFormat !== null}
              onClick={() => handleExport('jpeg')}
              style={{
                backgroundColor: exportingFormat === 'jpeg' ? undefined : 'var(--accent-color)',
                color: exportingFormat === 'jpeg' ? undefined : 'var(--theme-paper-bg)',
              }}
              className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-md disabled:cursor-not-allowed hover:scale-[1.01] controls-cta-btn"
            >
              {exportingFormat === 'jpeg' ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  {t.exportModal.generating}
                </>
              ) : (
                <>
                  <Download className="h-3.5 w-3.5" />
                  {t.exportModal.jpgAction}
                </>
              )}
            </button>
          </div>

          {/* PDF Option Card */}
          <div className="flex flex-col justify-between rounded-2xl border p-4 theme-modal-card hover:brightness-105 transition-all">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
                  <FileText className="h-4.5 w-4.5" />
                </div>
                <h3 className="font-bold text-sm" style={{ color: 'var(--modal-text)' }}>
                  {t.exportModal.pdfTitle}
                </h3>
              </div>
              <p className="text-xs leading-relaxed min-h-[36px]" style={{ color: 'var(--modal-text-muted)' }}>
                {t.exportModal.pdfDesc}
              </p>
            </div>
            <button
              type="button"
              disabled={exportingFormat !== null}
              onClick={() => handleExport('pdf')}
              style={{
                backgroundColor: exportingFormat === 'pdf' ? undefined : 'var(--accent-color)',
                color: exportingFormat === 'pdf' ? undefined : 'var(--theme-paper-bg)',
              }}
              className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-md disabled:cursor-not-allowed hover:scale-[1.01] controls-cta-btn"
            >
              {exportingFormat === 'pdf' ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  {t.exportModal.generating}
                </>
              ) : (
                <>
                  <Download className="h-3.5 w-3.5" />
                  {t.exportModal.pdfAction}
                </>
              )}
            </button>
          </div>

          {/* Print Option Card */}
          <div className="flex flex-col justify-between rounded-2xl border p-4 theme-modal-card hover:brightness-105 transition-all">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Printer className="h-4.5 w-4.5" />
                </div>
                <h3 className="font-bold text-sm" style={{ color: 'var(--modal-text)' }}>
                  {t.exportModal.printTitle}
                </h3>
              </div>
              <p className="text-xs leading-relaxed min-h-[36px]" style={{ color: 'var(--modal-text-muted)' }}>
                {t.exportModal.printDesc}
              </p>
            </div>
            <button
              type="button"
              disabled={exportingFormat !== null}
              onClick={() => {
                onClose();
                onPrint();
              }}
              style={{
                backgroundColor: 'var(--accent-color)',
                color: 'var(--theme-paper-bg)',
              }}
              className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-md disabled:cursor-not-allowed hover:scale-[1.01] controls-cta-btn"
            >
              <Printer className="h-3.5 w-3.5" />
              {t.exportModal.printAction}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
