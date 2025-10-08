'use client';

import DriverPerformanceStats from '../../components/driver/DriverPerformanceStats';
import './dashboard.css';

export default function DashboardPage() {
  return (
    <div className="dashboard-container">
      <DriverPerformanceStats />
    </div>
  );
}