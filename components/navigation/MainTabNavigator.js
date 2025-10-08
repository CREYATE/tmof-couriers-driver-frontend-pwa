'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Grid, LayoutDashboard, Package, PackageOpen, Power } from 'lucide-react';
import TmofSpinner from '../ui/TmofSpinner';
import DashboardPlaceholder from '../driver/DashboardPlaceholder';
import DriverAssignedOrders from '../driver/DriverAssignedOrders';
import { Colors, FontSizes } from '../../constants/theme';
import './MainTabNavigator.css';

export default function MainTabNavigator({ onLogout }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  const showLoading = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 800);
  };

  const handleTabPress = (tab) => {
    if (tab === 'logout') {
      if (window.confirm('Are you sure you want to logout?')) {
        onLogout();
      }
      return;
    }
    
    showLoading();
    setActiveTab(tab);
  };

  const LogoHeader = () => (
    <div className="header-left">
      <img 
        src="/tmof-logo.png" 
        alt="TMOF" 
        className="logo-image"
        onError={(e) => {
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'flex';
        }}
      />
      <div className="logo-fallback" style={{ display: 'none' }}>
        <span>TMOF</span>
      </div>
    </div>
  );

  const HeaderRight = () => (
    <div className="header-right">
      <div className="driver-avatar">
        <span>DR</span>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'orders':
        return <DriverAssignedOrders />;
      case 'dashboard':
      default:
        return <DashboardPlaceholder onNavigateToOrders={() => handleTabPress('orders')} />;
    }
  };

  return (
    <>
      {isLoading && <TmofSpinner />}
      
      <div className="main-container">
        {/* Header */}
        <div className="header">
          <LogoHeader />
          <HeaderRight />
        </div>

        {/* Content */}
        <div className="content">
          {renderContent()}
        </div>

        {/* Bottom Tab Navigation */}
        <div className="bottom-tabs">
          <button
            className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleTabPress('dashboard')}
          >
            <div className="tab-icon">
              <LayoutDashboard 
                size={24} 
                color={activeTab === 'dashboard' ? '#374151' : '#9CA3AF'}
                strokeWidth={activeTab === 'dashboard' ? 2.5 : 2}
              />
            </div>
            <span className="tab-label">Dashboard</span>
          </button>

          <button
            className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => handleTabPress('orders')}
          >
            <div className="tab-icon">
              <PackageOpen
                size={24} 
                color={activeTab === 'orders' ? '#374151' : '#9CA3AF'}
                strokeWidth={activeTab === 'orders' ? 2.5 : 2}
              />
            </div>
            <span className="tab-label">Assigned Orders</span>
          </button>

          <button
            className="tab-button logout"
            onClick={() => handleTabPress('logout')}
          >
            <div className="tab-icon">
              <Power 
                size={24} 
                color="#EF4444"
                strokeWidth={2}
              />
            </div>
            <span className="tab-label">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}