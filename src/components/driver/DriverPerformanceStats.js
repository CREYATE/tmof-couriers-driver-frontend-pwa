'use client';

import React, { useState } from 'react';
import './DriverPerformanceStats.css';

export default function DriverPerformanceStats() {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Mock comprehensive stats - matching mobile exactly
  const stats = {
    overview: {
      completed: 24,
      inTransit: 2,
      cancelled: 1,
      avgDeliveryTime: 42, // in minutes
      totalOrders: 27,
      completionRate: 88.9,
      onTimeDeliveries: 22,
      customerRating: 4.7
    },
    weekly: {
      deliveries: [3, 5, 4, 6, 3, 4, 5], // Last 7 days
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    monthly: {
      completedOrders: [15, 18, 22, 24],
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4']
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    icon, 
    trend, 
    color = '#3b82f6' 
  }) => (
    <div className="stat-card">
      <div className="stat-card-content">
        <div className="stat-header">
          <div className="stat-icon" style={{ backgroundColor: color + '20' }}>
            <i className={`icon ${icon}`} style={{ color }}></i>
          </div>
          {trend && (
            <div className={`trend-container ${trend.isPositive ? 'positive' : 'negative'}`}>
              <i className={`trend-icon ${trend.isPositive ? 'icon-trending-up' : 'icon-trending-down'}`}></i>
              <span className="trend-text">
                {Math.abs(trend.value)}%
              </span>
            </div>
          )}
        </div>
        <div className="stat-value">{value}</div>
        <div className="stat-title">{title}</div>
        <div className="stat-subtitle">{subtitle}</div>
      </div>
    </div>
  );

  const renderTabButton = (tabKey, label, isActive) => (
    <button
      key={tabKey}
      className={`tab-button ${isActive ? 'active' : ''}`}
      onClick={() => setActiveTab(tabKey)}
    >
      {label}
    </button>
  );

  return (
    <div className="performance-container">
      <h1 className="performance-title">Performance Dashboard</h1>
      
      {/* Tabs */}
      <div className="tab-container">
        {renderTabButton('overview', 'Overview', activeTab === 'overview')}
        {renderTabButton('weekly', 'Weekly', activeTab === 'weekly')}
        {renderTabButton('trends', 'Trends', activeTab === 'trends')}
      </div>

      <div className="scroll-container">
        {activeTab === 'overview' && (
          <div className="tab-content">
            {/* Stats Grid */}
            <div className="stats-grid">
              <StatCard
                title="Completed Orders"
                value={stats.overview.completed}
                subtitle="This month"
                icon="icon-checkmark-circle"
                color="#22c55e"
              />
              <StatCard
                title="In Transit"
                value={stats.overview.inTransit}
                subtitle="Active deliveries"
                icon="icon-car"
                color="#f59e0b"
              />
              <StatCard
                title="Cancelled Orders"
                value={stats.overview.cancelled}
                subtitle="This month"
                icon="icon-close-circle"
                color="#ef4444"
              />
              <StatCard
                title="Avg. Delivery Time"
                value={`${stats.overview.avgDeliveryTime}min`}
                subtitle="Target: 45min"
                icon="icon-time"
                color="#3b82f6"
              />
            </div>

            {/* Completion Rate */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Completion Rate</h3>
              </div>
              <div className="card-content">
                <div className="progress-section">
                  <div className="progress-item">
                    <span className="progress-label">Orders Completed</span>
                    <span className="progress-value">
                      {stats.overview.completed}/{stats.overview.totalOrders}
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${stats.overview.completionRate}%` }}
                    />
                  </div>
                  
                  <div className="progress-item">
                    <span className="progress-label">On-Time Deliveries</span>
                    <span className="progress-value">
                      {stats.overview.onTimeDeliveries}/{stats.overview.completed}
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${(stats.overview.onTimeDeliveries / stats.overview.completed) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Rating */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">
                  <i className="icon icon-star" style={{ color: '#fbbf24' }}></i>
                  Customer Rating
                </h3>
              </div>
              <div className="card-content">
                <div className="rating-display">
                  <div className="rating-value">{stats.overview.customerRating}</div>
                  <div className="rating-stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <i 
                        key={star}
                        className={`icon icon-star ${star <= Math.floor(stats.overview.customerRating) ? 'filled' : ''}`}
                        style={{ color: star <= Math.floor(stats.overview.customerRating) ? '#fbbf24' : '#d1d5db' }}
                      />
                    ))}
                  </div>
                  <div className="rating-subtitle">Average customer rating</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'weekly' && (
          <div className="tab-content">
            {/* Weekly Chart */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title chart-title">
                  <i className="icon icon-calendar" style={{ color: '#22c55e' }}></i>
                  Weekly Delivery Performance
                </h3>
              </div>
              <div className="card-content">
                <div className="weekly-chart">
                  {stats.weekly.deliveries.map((value, index) => (
                    <div key={index} className="chart-bar">
                      <div 
                        className="bar-fill"
                        style={{ height: `${(value / Math.max(...stats.weekly.deliveries)) * 100}%` }}
                      />
                      <span className="bar-label">{stats.weekly.labels[index]}</span>
                      <span className="bar-value">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Weekly Stats */}
            <div className="stats-grid">
              <StatCard
                title="This Week"
                value={stats.weekly.deliveries.reduce((a, b) => a + b, 0)}
                subtitle="Total deliveries"
                icon="icon-trophy"
                color="#22c55e"
              />
              <StatCard
                title="Best Day"
                value={Math.max(...stats.weekly.deliveries)}
                subtitle="Peak performance"
                icon="icon-trending-up"
                color="#22c55e"
              />
              <StatCard
                title="Daily Average"
                value={Math.round(stats.weekly.deliveries.reduce((a, b) => a + b, 0) / 7)}
                subtitle="Deliveries per day"
                icon="icon-bar-chart"
                color="#3b82f6"
              />
            </div>
          </div>
        )}

        {activeTab === 'trends' && (
          <div className="tab-content">
            {/* Monthly Progress */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">
                  <i className="icon icon-trending-up" style={{ color: '#22c55e' }}></i>
                  Monthly Progress
                </h3>
              </div>
              <div className="card-content">
                <div className="trends-chart">
                  {stats.monthly.completedOrders.map((value, index) => (
                    <div key={index} className="trend-bar">
                      <div 
                        className="trend-fill"
                        style={{ height: `${(value / Math.max(...stats.monthly.completedOrders)) * 100}%` }}
                      />
                      <span className="trend-label">{stats.monthly.labels[index]}</span>
                      <span className="trend-value">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Growth Metrics */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Growth Metrics</h3>
              </div>
              <div className="card-content">
                <div className="growth-metrics">
                  <div className="metric-row">
                    <span className="metric-label">Week over Week</span>
                    <span className="metric-value positive">+12%</span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">Month over Month</span>
                    <span className="metric-value positive">+8%</span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">Efficiency Score</span>
                    <span className="metric-value positive">94%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}