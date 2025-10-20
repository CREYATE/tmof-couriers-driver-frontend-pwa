'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { LayoutDashboard, PackageOpen, Power } from 'lucide-react';
import DriverProofOfDelivery from '../../src/screens/ProofOfDeliveryScreen';
import { apiService } from '../../services/api';
import '../../components/navigation/MainTabNavigator.css';

// Add CSS for loading animation
const spinnerStyle = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Inject the CSS
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = spinnerStyle;
  document.head.appendChild(style);
}

function ProofOfDeliveryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const trackingNumber = searchParams.get('trackingNumber');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!trackingNumber) {
      setError('No tracking number provided');
      setLoading(false);
      return;
    }

    fetchOrderDetails();
  }, [trackingNumber]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Try to fetch real order data from the backend
      try {
        const orderData = await apiService.getOrderDetails(trackingNumber);
        setOrder(orderData);
      } catch (apiError) {
        console.error('Failed to fetch order from API, using mock data:', apiError);
        
        // Fallback to mock order object if API fails
        const mockOrder = {
          id: trackingNumber,
          trackingNumber: trackingNumber,
          status: 'AWAITING_COLLECTION',
          customerName: 'John Doe',
          recipientName: 'Jane Smith',
          recipientPhone: '+27123456789',
          recipientEmail: 'jane@example.com',
          pickupAddress: '123 Main St, Cape Town',
          deliveryAddress: '456 Oak Ave, Johannesburg',
          serviceType: 'STANDARD_DELIVERY',
          deliveryNotes: 'Handle with care - fragile items. Customer prefers delivery at back door.',
          createdAt: new Date().toISOString(),
          distance: 500,
          price: 150.00,
          driverName: 'Current Driver'
        };
        
        setOrder(mockOrder);
      }
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = (newStatus) => {
    if (order) {
      setOrder(prev => ({ ...prev, status: newStatus }));
    }
  };

  const handleGoBack = () => {
    try {
      // Always navigate to orders page instead of using browser back
      router.push('/orders');
    } catch (error) {
      console.error('Navigation error:', error);
      router.push('/');
    }
  };

  const handleTabPress = (tab) => {
    if (tab === 'logout') {
      if (window.confirm('Are you sure you want to logout?')) {
        // Clear tokens and redirect to login
        localStorage.removeItem('driverToken');
        localStorage.removeItem('jwt');
        router.push('/');
      }
      return;
    }
    
    if (tab === 'dashboard') {
      router.push('/');
    } else if (tab === 'orders') {
      router.push('/orders');
    }
  };

  if (loading) {
    return (
      <div className="main-container">
        {/* Header - same as dashboard */}
        <div className="header">
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
          <div className="header-right">
            <div className="driver-avatar">
              <span>DR</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="content">
          <div className="dashboard-placeholder">
            <div className="placeholder-container">
              <div className="placeholder-content">
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  height: '60vh',
                  flexDirection: 'column'
                }}>
                  <div style={{ marginBottom: '16px' }}>Loading order details...</div>
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    border: '4px solid #f3f3f3',
                    borderTop: '4px solid #ffd215',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Tab Navigation */}
        <div className="bottom-tabs">
          <button
            className="tab-button"
            onClick={() => handleTabPress('dashboard')}
          >
            <div className="tab-icon">
              <LayoutDashboard 
                size={24} 
                color="#9CA3AF"
                strokeWidth={2}
              />
            </div>
            <span className="tab-label">Dashboard</span>
          </button>

          <button
            className="tab-button active"
            onClick={() => handleTabPress('orders')}
          >
            <div className="tab-icon">
              <PackageOpen
                size={24} 
                color="#374151"
                strokeWidth={2.5}
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
    );
  }

  if (error || !order) {
    return (
      <div className="main-container">
        {/* Header - same as dashboard */}
        <div className="header">
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
          <div className="header-right">
            <div className="driver-avatar">
              <span>DR</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="content">
          <div className="dashboard-placeholder">
            <div className="placeholder-container">
              <div className="placeholder-content">
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  height: '60vh',
                  flexDirection: 'column',
                  padding: '20px'
                }}>
                  <h2 style={{ color: '#dc2626', marginBottom: '16px' }}>Error</h2>
                  <p style={{ color: '#6b7280', marginBottom: '24px' }}>
                    {error || 'Order not found'}
                  </p>
                  <button
                    onClick={handleGoBack}
                    style={{
                      backgroundColor: '#ffd215',
                      color: '#0C0E29',
                      padding: '12px 24px',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '16px'
                    }}
                  >
                    Go Back
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Tab Navigation */}
        <div className="bottom-tabs">
          <button
            className="tab-button"
            onClick={() => handleTabPress('dashboard')}
          >
            <div className="tab-icon">
              <LayoutDashboard 
                size={24} 
                color="#9CA3AF"
                strokeWidth={2}
              />
            </div>
            <span className="tab-label">Dashboard</span>
          </button>

          <button
            className="tab-button active"
            onClick={() => handleTabPress('orders')}
          >
            <div className="tab-icon">
              <PackageOpen
                size={24} 
                color="#374151"
                strokeWidth={2.5}
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
    );
  }

  return (
    <div className="main-container">
      {/* Header - same as dashboard */}
      <div className="header">
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
        <div className="header-right">
          <div className="driver-avatar">
            <span>DR</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="content">
        <DriverProofOfDelivery 
          order={order} 
          setStatus={handleStatusUpdate}
          onGoBack={handleGoBack}
          onCloseCard={handleGoBack}
        />
      </div>

      {/* Bottom Tab Navigation */}
      <div className="bottom-tabs">
        <button
          className="tab-button"
          onClick={() => handleTabPress('dashboard')}
        >
          <div className="tab-icon">
            <LayoutDashboard 
              size={24} 
              color="#9CA3AF"
              strokeWidth={2}
            />
          </div>
          <span className="tab-label">Dashboard</span>
        </button>

        <button
          className="tab-button active"
          onClick={() => handleTabPress('orders')}
        >
          <div className="tab-icon">
            <PackageOpen
              size={24} 
              color="#374151"
              strokeWidth={2.5}
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
  );
}

export default function ProofOfDeliveryPage() {
  return (
    <Suspense fallback={
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Loading...
      </div>
    }>
      <ProofOfDeliveryContent />
    </Suspense>
  );
}