import { useState, useRef, useEffect, useMemo } from 'react';

// Math helpers
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 0, g: 0, b: 0 };
}

function rgbToHsv({ r, g, b }: { r: number; g: number; b: number }): { h: number; s: number; v: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (max !== min) {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, v: v * 100 };
}

function hsvToRgb(h: number, s: number, v: number): { r: number; g: number; b: number } {
  h /= 360;
  s /= 100;
  v /= 100;
  let r = 0, g = 0, b = 0;
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (c: number) => {
    const hex = Math.max(0, Math.min(255, c)).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function ColorPicker({ value, onChange, className = '' }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const svRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);

  // Initialize HSV from value
  const initialHsv = useMemo(() => rgbToHsv(hexToRgb(value)), [value]);
  const [h, setH] = useState(initialHsv.h);
  const [s, setS] = useState(initialHsv.s);
  const [v, setV] = useState(initialHsv.v);
  const [inputVal, setInputVal] = useState(value);

  // Sync internal state with external value changes (e.g., preset theme swaps)
  useEffect(() => {
    const currentHex = rgbToHex(
      hsvToRgb(initialHsv.h, initialHsv.s, initialHsv.v).r,
      hsvToRgb(initialHsv.h, initialHsv.s, initialHsv.v).g,
      hsvToRgb(initialHsv.h, initialHsv.s, initialHsv.v).b
    );
    // Compare lowercase hexes to avoid infinite loops
    if (value.toLowerCase() !== currentHex.toLowerCase()) {
      setH(initialHsv.h);
      setS(initialHsv.s);
      setV(initialHsv.v);
      setInputVal(value);
    }
  }, [value, initialHsv]);

  // Sync local text input value when picking colors dynamically
  useEffect(() => {
    setInputVal(value);
  }, [value]);

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle EyeDropper
  const hasEyeDropper = typeof window !== 'undefined' && 'EyeDropper' in window;
  const handleEyeDropper = async () => {
    if (!hasEyeDropper) return;
    try {
      const eyeDropper = new (window as any).EyeDropper();
      const result = await eyeDropper.open();
      if (result && result.sRGBHex) {
        onChange(result.sRGBHex);
      }
    } catch (err) {
      console.error('EyeDropper failed:', err);
    }
  };

  // Drag handlers for Saturation-Value box
  const handleMouseDownSV = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const updateSV = (clientX: number, clientY: number) => {
      if (!svRef.current) return;
      const rect = svRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
      const y = Math.max(0, Math.min(rect.height, clientY - rect.top));
      const newS = (x / rect.width) * 100;
      const newV = (1 - y / rect.height) * 100;
      setS(newS);
      setV(newV);
      const rgb = hsvToRgb(h, newS, newV);
      onChange(rgbToHex(rgb.r, rgb.g, rgb.b));
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      updateSV(moveEvent.clientX, moveEvent.clientY);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    const handleTouchMove = (touchEvent: TouchEvent) => {
      if (touchEvent.touches.length > 0) {
        updateSV(touchEvent.touches[0].clientX, touchEvent.touches[0].clientY);
      }
    };

    const handleTouchEnd = () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    updateSV(clientX, clientY);

    if ('touches' in e) {
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
    } else {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
  };

  // Drag handlers for Hue slider
  const handleMouseDownHue = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const updateHue = (clientX: number) => {
      if (!hueRef.current) return;
      const rect = hueRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
      const newH = (x / rect.width) * 360;
      setH(newH);
      const rgb = hsvToRgb(newH, s, v);
      onChange(rgbToHex(rgb.r, rgb.g, rgb.b));
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      updateHue(moveEvent.clientX);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    const handleTouchMove = (touchEvent: TouchEvent) => {
      if (touchEvent.touches.length > 0) {
        updateHue(touchEvent.touches[0].clientX);
      }
    };

    const handleTouchEnd = () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    updateHue(clientX);

    if ('touches' in e) {
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
    } else {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
  };

  // Handle hex manual typing
  const handleInputChange = (val: string) => {
    setInputVal(val);
    let hex = val.trim();
    if (!hex.startsWith('#')) {
      hex = '#' + hex;
    }
    if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
      onChange(hex);
      const hsv = rgbToHsv(hexToRgb(hex));
      setH(hsv.h);
      setS(hsv.s);
      setV(hsv.v);
    }
  };

  return (
    <div ref={containerRef} className={`relative flex items-center ${className}`}>
      {/* Clickable Color Preview Circle Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative h-6 w-6 cursor-pointer rounded-full border border-neutral-300 shadow-sm transition-transform duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
        style={{ backgroundColor: value }}
        aria-label="Choose color"
      />

      {/* Popover Custom Color Picker */}
      {isOpen && (
        <div className="absolute right-0 top-full z-[120] mt-2 w-[220px] rounded-[20px] border border-neutral-200 bg-white p-3.5 shadow-xl transition-all duration-200 select-none animate-fadeIn dark:bg-neutral-900 dark:border-neutral-800">
          <div className="flex flex-col gap-3">
            {/* SV picker container */}
            <div
              ref={svRef}
              onMouseDown={handleMouseDownSV}
              onTouchStart={handleMouseDownSV}
              className="relative h-[120px] w-full cursor-crosshair rounded-[12px] overflow-hidden"
              style={{
                backgroundColor: `hsl(${h}, 100%, 50%)`,
              }}
            >
              {/* White Saturation gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent" />
              {/* Black Value gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
              
              {/* Drag Pointer Node */}
              <div
                className="absolute h-4.5 w-4.5 -ml-2.25 -mt-2.25 rounded-full border-2 border-white bg-transparent shadow-lg cursor-grab active:cursor-grabbing pointer-events-none"
                style={{
                  left: `${s}%`,
                  top: `${100 - v}%`,
                }}
              />
            </div>

            {/* Rainbow Hue Slider Track */}
            <div
              ref={hueRef}
              onMouseDown={handleMouseDownHue}
              onTouchStart={handleMouseDownHue}
              className="relative h-3 w-full cursor-pointer rounded-[6px]"
              style={{
                background: 'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)',
              }}
            >
              {/* Hue Drag Pointer Node */}
              <div
                className="absolute h-4.5 w-4.5 -mt-0.75 -ml-2.25 rounded-full border-2 border-white shadow-md cursor-grab active:cursor-grabbing pointer-events-none"
                style={{
                  left: `${(h / 360) * 100}%`,
                  backgroundColor: `hsl(${h}, 100%, 50%)`,
                }}
              />
            </div>

            {/* Eyedropper + Input controls */}
            <div className="flex items-center gap-2">
              {/* Eyedropper Button */}
              {hasEyeDropper && (
                <button
                  type="button"
                  onClick={handleEyeDropper}
                  className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-600 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700/80"
                  title="Eyedropper"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L4.82 8.909a2.25 2.25 0 0 1-1.07-1.916V6.75"
                      style={{ display: 'none' }} // standard template override
                    />
                    {/* Actual Eyedropper Icon */}
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m15 11.25 1.5 1.5.75-.75V8.25h-3.75l-.75.75 1.5 1.5ZM21 3v5.25m0-5.25h-5.25M21 3l-6 6M3 21l6.75-6.75M8.25 12.75l3 3"
                    />
                  </svg>
                </button>
              )}

              {/* Hex Input Field */}
              <div className="relative flex flex-1 items-center">
                <span className="absolute left-2.5 text-xs font-bold text-neutral-400">#</span>
                <input
                  type="text"
                  value={inputVal.replace('#', '')}
                  onChange={(e) => handleInputChange(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-1.5 pl-5 pr-2 text-xs font-bold uppercase outline-none transition-colors hover:bg-neutral-100/50 focus:border-purple-500/50 focus:bg-white dark:border-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700/50 dark:focus:border-purple-500/50 dark:focus:bg-neutral-900"
                  maxLength={6}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
