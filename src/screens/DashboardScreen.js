import React from 'react';
import DriverPerformanceStats from '../components/driver/DriverPerformanceStats';
import './DashboardScreen.css';

export default function DashboardScreen() {
  return (
    <div className="dashboard-container">
      <DriverPerformanceStats />
    </div>
  );
}