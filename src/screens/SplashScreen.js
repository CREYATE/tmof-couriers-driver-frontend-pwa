import React from 'react';
import './SplashScreen.css';

export default function SplashScreen() {
  return (
    <div className="splash-container">
      <div className="splash-content">
        <img 
          src="/tmof-logo.png" 
          alt="TMOF" 
          className="splash-logo"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        <div className="splash-logo-fallback" style={{ display: 'none' }}>
          <span>TMOF</span>
        </div>
        <div className="splash-text">
          <h1>TMOF Couriers</h1>
          <p>Driver Portal</p>
        </div>
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </div>
    </div>
  );
}