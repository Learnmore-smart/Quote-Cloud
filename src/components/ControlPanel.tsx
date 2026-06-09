import type { PaperKey, Orientation } from '../types';

interface ControlPanelProps {
  paper: PaperKey;
  orientation: Orientation;
  showAuthor: boolean;
  onPaperChange: (paper: PaperKey) => void;
  onOrientationChange: (orient: Orientation) => void;
  onShowAuthorChange: (show: boolean) => void;
  onPrint: () => void;
}

const PAPER_OPTIONS: Array<[PaperKey, string]> = [
  ['A4', 'A4 · 210×297'],
  ['A3', 'A3 · 297×420'],
  ['Letter', 'Letter · 8.5×11'],
];

export function ControlPanel({
  paper,
  orientation,
  showAuthor,
  onPaperChange,
  onOrientationChange,
  onShowAuthorChange,
  onPrint,
}: ControlPanelProps) {
  return (
    <aside className="controls" id="controls">
      <h1>
        Quote Cloud
        <small>AI Layout Studio</small>
      </h1>

      <div className="control-row">
        <label htmlFor="paper">Paper</label>
        <select
          id="paper"
          value={paper}
          onChange={(e) => onPaperChange(e.target.value as PaperKey)}
        >
          {PAPER_OPTIONS.map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </div>

      <div className="control-row">
        <label>Orientation</label>
        <div className="orient-toggle" id="orientToggle">
          <button
            data-val="portrait"
            className={orientation === 'portrait' ? 'active' : ''}
            onClick={() => onOrientationChange('portrait')}
          >
            Portrait
          </button>
          <button
            data-val="landscape"
            className={orientation === 'landscape' ? 'active' : ''}
            onClick={() => onOrientationChange('landscape')}
          >
            Landscape
          </button>
        </div>
      </div>

      <div className="control-row">
        <label htmlFor="authorToggle">Show Author</label>
        <span className="switch">
          <input
            type="checkbox"
            id="authorToggle"
            checked={showAuthor}
            onChange={(e) => onShowAuthorChange(e.target.checked)}
          />
          <span className="slider" />
        </span>
      </div>

      <button className="print-btn" id="printBtn" onClick={onPrint}>
        Print Poster
      </button>
    </aside>
  );
}
