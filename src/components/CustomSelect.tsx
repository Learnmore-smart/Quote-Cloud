import { useState, useRef, useEffect } from 'react';

export interface SelectOption {
  value: string;
  label: string;
  subLabel?: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  triggerClassName?: string;
  align?: 'left' | 'right';
  disabled?: boolean;
}

export function CustomSelect({
  options,
  value,
  onChange,
  className = '',
  triggerClassName = '',
  align = 'left',
  disabled = false
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close the dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Keyboard accessibility
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!isOpen) return;
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`flex w-full cursor-pointer items-center justify-between rounded-xl border px-3.5 py-3 text-sm font-medium shadow-inner outline-none transition-all custom-select-trigger disabled:opacity-30 disabled:cursor-not-allowed focus:ring-2 focus:ring-emerald-500/10 ${triggerClassName}`}
      >
        <div className="flex items-center gap-2 truncate">
          <span>
            {selectedOption?.label}
          </span>
          {selectedOption?.subLabel && (
            <>
              <span className="text-neutral-500 text-[10px]">•</span>
              <span className="text-xs font-normal truncate opacity-80">
                {selectedOption.subLabel}
              </span>
            </>
          )}
        </div>
        <svg
          className={`h-4 w-4 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path d="M6 8l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Dropdown Options List */}
      <div
        role="listbox"
        className={`absolute left-0 right-0 z-50 mt-2 max-h-64 origin-top overflow-y-auto rounded-2xl border p-1.5 shadow-2xl backdrop-blur-2xl transition-all duration-200 custom-scrollbar custom-select-options ${
          isOpen
            ? 'translate-y-0 opacity-100 scale-100 pointer-events-auto'
            : '-translate-y-2 opacity-0 scale-95 pointer-events-none'
        } ${align === 'right' ? 'origin-top-right' : 'origin-top-left'}`}
      >
        <div className="flex flex-col gap-1">
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-colors text-left cursor-pointer custom-select-option ${
                  isSelected ? 'selected' : ''
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span>
                    {option.label}
                  </span>
                  {option.subLabel && (
                    <>
                      <span className="text-neutral-500 text-[10px]">•</span>
                      <span className="text-xs font-normal truncate opacity-85">
                        {option.subLabel}
                      </span>
                    </>
                  )}
                </div>
                {isSelected && (
                  <svg className="h-4 w-4 shrink-0" style={{ color: 'var(--accent-color)' }} viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
