'use client';

import React from 'react';
import './DashboardPlaceholder.css';

export default function DashboardPlaceholder({ onNavigateToOrders }) {
  const handleViewOrders = () => {
    // Navigate to orders tab via parent callback with loading animation
    if (onNavigateToOrders) {
      onNavigateToOrders();
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="dashboard-placeholder">
      {/* Mobile-first responsive container */}
      <div className="placeholder-container">
        <div className="placeholder-content">
          {/* Main content card - no border, clean design */}
          <div className="placeholder-card">
            
            {/* Under Construction */}
            <div className="construction-section">
              <div className="construction-image">
                <img 
                  src="/under-construction.gif" 
                  alt="Under Construction" 
                  className="construction-gif"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement.innerHTML = '<span class="construction-emoji">🚧</span>';
                  }}
                />
              </div>
              
              {/* Title */}
              <div className="title-section">
                <div className="title-header">
                  <div className="dashboard-icon">📊</div>
                  <h1 className="main-title">Driver Dashboard</h1>
                </div>
                <p className="coming-soon">Coming Soon!</p>
              </div>
            </div>

            {/* Description */}
            <div className="description-section">
              <p className="main-description">
                We're building an amazing driver dashboard that will help you track your performance, manage orders, and view your delivery statistics.
              </p>
              
              {/* Features section */}
              <div className="features-card">
                <h3 className="features-title">
                  <span className="trending-icon">📈</span>
                  What to Expect:
                </h3>
                
                <div className="features-grid">
                  <div className="feature-item">
                    <div className="feature-icon">
                      <span className="icon-chart">📊</span>
                    </div>
                    <div className="feature-content">
                      <span className="feature-title">Performance Analytics</span>
                      <span className="feature-description">Track your delivery stats, completion rates, and performance metrics</span>
                    </div>
                  </div>
                  
                  <div className="feature-item">
                    <div className="feature-icon">
                      <span className="icon-truck">🚚</span>
                    </div>
                    <div className="feature-content">
                      <span className="feature-title">Order Management</span>
                      <span className="feature-description">View and manage your assigned orders with real-time updates</span>
                    </div>
                  </div>
                  
                  <div className="feature-item">
                    <div className="feature-icon">
                      <span className="icon-clock">⏱️</span>
                    </div>
                    <div className="feature-content">
                      <span className="feature-title">Time Tracking</span>
                      <span className="feature-description">Monitor delivery times and optimize your routes for efficiency</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* <div className="info-card">
                <p className="info-text">
                  <span className="info-highlight">Good news:</span> You can continue managing your orders in the Assigned Orders tab. 
                  We'll notify you when the enhanced dashboard is ready! 🎉
                </p>
              </div> */}
            </div>

            {/* Footer Note */}
            {/* <div className="footer-section">
              <p className="footer-text">
                Questions? Contact our support team and we'll keep you updated on the dashboard enhancements.
              </p>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}