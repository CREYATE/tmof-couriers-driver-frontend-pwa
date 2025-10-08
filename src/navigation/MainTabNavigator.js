import React, { useState } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import DashboardScreen from '../screens/DashboardScreen';
import OrdersListScreen from '../screens/OrdersListScreen';
import OrderDetailsScreen from '../screens/OrderDetailsScreen';
import ProofOfDeliveryScreen from '../screens/ProofOfDeliveryScreen';
import StatsScreen from '../screens/StatsScreen';
import TmofSpinner from '../components/ui/TmofSpinner';
import { Colors, FontSizes } from '../constants/theme';
import './MainTabNavigator.css';

export default function MainTabNavigator({ onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const showLoading = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 800);
  };

  const handleTabPress = (path) => {
    if (path === '/logout') {
      if (window.confirm('Are you sure you want to logout?')) {
        onLogout();
      }
      return;
    }
    
    showLoading();
    navigate(path);
  };

  const getActiveTab = () => {
    if (location.pathname === '/dashboard') return 'Dashboard';
    if (location.pathname.startsWith('/orders')) return 'AssignedOrders';
    return 'Dashboard';
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
          <Routes>
            <Route path="/dashboard" element={<DashboardScreen />} />
            <Route path="/orders" element={<OrdersListScreen />} />
            <Route path="/orders/:orderId" element={<OrderDetailsScreen />} />
            <Route path="/orders/:orderId/proof" element={<ProofOfDeliveryScreen />} />
            <Route path="/stats" element={<StatsScreen />} />
            <Route path="/" element={<DashboardScreen />} />
          </Routes>
        </div>

        {/* Bottom Tab Navigation */}
        <div className="bottom-tabs">
          <button
            className={`tab-button ${getActiveTab() === 'Dashboard' ? 'active' : ''}`}
            onClick={() => handleTabPress('/dashboard')}
          >
            <div className="tab-icon">
              {getActiveTab() === 'Dashboard' ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z"/>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z" fillOpacity="0.3"/>
                  <path d="M4 4h6v6H4zm10 0h6v6h-6zm-10 10h6v6H4zm10 0h6v6h-6z" fill="none" stroke="currentColor" strokeWidth="2"/>
                </svg>
              )}
            </div>
            <span className="tab-label">Dashboard</span>
          </button>

          <button
            className={`tab-button ${getActiveTab() === 'AssignedOrders' ? 'active' : ''}`}
            onClick={() => handleTabPress('/orders')}
          >
            <div className="tab-icon">
              {getActiveTab() === 'AssignedOrders' ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.5 2C13.6 2 14.5 2.9 14.5 4C14.5 5.1 13.6 6 12.5 6C11.4 6 10.5 5.1 10.5 4C10.5 2.9 11.4 2 12.5 2M21 9V7L15 4L13.5 4.8V6.5L15.5 7.4L19 9H21M15 15V17L9 20L7.5 19.2V17.5L9.5 16.6L13 15H15M5 12C6.1 12 7 12.9 7 14C7 15.1 6.1 16 5 16C3.9 16 3 15.1 3 14C3 12.9 3.9 12 5 12Z"/>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12.5 2C13.6 2 14.5 2.9 14.5 4C14.5 5.1 13.6 6 12.5 6C11.4 6 10.5 5.1 10.5 4C10.5 2.9 11.4 2 12.5 2M21 9V7L15 4L13.5 4.8V6.5L15.5 7.4L19 9H21M15 15V17L9 20L7.5 19.2V17.5L9.5 16.6L13 15H15M5 12C6.1 12 7 12.9 7 14C7 15.1 6.1 16 5 16C3.9 16 3 15.1 3 14C3 12.9 3.9 12 5 12Z"/>
                </svg>
              )}
            </div>
            <span className="tab-label">Assigned Orders</span>
          </button>

          <button
            className="tab-button logout"
            onClick={() => handleTabPress('/logout')}
          >
            <div className="tab-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16,17 21,12 16,7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </div>
            <span className="tab-label">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}