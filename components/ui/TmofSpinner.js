'use client';

import './TmofSpinner.css';

export default function TmofSpinner() {
  return (
    <div className="tmof-spinner-overlay">
      <div className="tmof-spinner-backdrop">
        <div className="tmof-spinner-container">
          <div className="tmof-spinner"></div>
          <div className="tmof-spinner-text">Loading...</div>
        </div>
      </div>
    </div>
  );
}