import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import { apiService } from '../../services/api';
import { webSocketService } from '../../services/websocket';
import './DriverAssignedOrders.css';

const statusConfig = {
  AWAITING_COLLECTION: {
    label: 'Awaiting Collection',
    icon: '⏰',
    color: '#3b82f6',
    bgColor: '#dbeafe',
  },
  IN_TRANSIT: {
    label: 'In Transit',
    icon: '🚗',
    color: '#f59e0b',
    bgColor: '#fef3c7',
  },
  DELIVERED: {
    label: 'Delivered',
    icon: '✅',
    color: '#059669',
    bgColor: '#d1fae5',
  },
  RESCHEDULED: {
    label: 'Rescheduled',
    icon: '📅',
    color: '#f59e0b',
    bgColor: '#fef3c7',
  },
  CANCELLED: {
    label: 'Cancelled',
    icon: '❌',
    color: '#dc2626',
    bgColor: '#fee2e2',
  },
};

const serviceTypeLabels = {
  STANDARD: 'Standard Delivery',
  EXPRESS: 'Express Delivery',
  OVERNIGHT: 'Overnight Delivery',
  SAME_DAY: 'Same Day Delivery',
};

export default function DriverAssignedOrders() {
  const [activeTab, setActiveTab] = useState('AWAITING_COLLECTION');
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDriverOrders();
    const wsClient = setupWebSocket();
    
    return () => {
      if (wsClient) {
        wsClient.disconnect();
        console.log('WebSocket disconnected on component unmount');
      }
    };
  }, []);

  const fetchDriverOrders = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('driverToken');
      if (!token) {
        setError('Authentication required');
        alert('Please login to view orders');
        return;
      }

      const data = await apiService.getDriverOrders();
      console.log('Driver orders data:', data);
      setOrders(data);
      setError('');
    } catch (err) {
      console.error('Error fetching driver orders:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load orders';
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const setupWebSocket = () => {
    try {
      console.log('Setting up WebSocket for driver orders...');
      const wsClient = webSocketService.connect();
      
      const driverTopic = `/topic/driver/orders`;
      wsClient.subscribe(driverTopic, (message) => {
        try {
          const orderUpdate = JSON.parse(message.body);
          console.log('Received driver order update via WebSocket:', orderUpdate);
          
          setOrders(prevOrders => {
            const existingIndex = prevOrders.findIndex(
              order => order.trackingNumber === orderUpdate.trackingNumber
            );
            
            if (existingIndex !== -1) {
              const updatedOrders = [...prevOrders];
              updatedOrders[existingIndex] = { ...updatedOrders[existingIndex], ...orderUpdate };
              return updatedOrders;
            } else {
              return [...prevOrders, orderUpdate];
            }
          });
          
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });

      const ordersGeneralTopic = `/topic/orders/updates`;
      wsClient.subscribe(ordersGeneralTopic, (message) => {
        try {
          const orderUpdate = JSON.parse(message.body);
          console.log('Received general order update via WebSocket:', orderUpdate);
          
          setOrders(prevOrders => {
            const existingIndex = prevOrders.findIndex(
              order => order.trackingNumber === orderUpdate.trackingNumber
            );
            
            if (existingIndex !== -1) {
              const updatedOrders = [...prevOrders];
              updatedOrders[existingIndex] = { ...updatedOrders[existingIndex], ...orderUpdate };
              return updatedOrders;
            }
            
            return prevOrders;
          });
          
        } catch (error) {
          console.error('Error parsing general order WebSocket message:', error);
        }
      });
      
      console.log('WebSocket subscriptions set up successfully');
      return wsClient;
      
    } catch (error) {
      console.error('WebSocket setup failed:', error);
      return null;
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(order => order.status?.toUpperCase() === activeTab);
  }, [orders, activeTab]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDriverOrders();
    setRefreshing(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getServiceTypeDisplay = (serviceType) => {
    return serviceTypeLabels[serviceType] || serviceType;
  };

  const renderTabButton = (status) => {
    const config = statusConfig[status];
    const isActive = activeTab === status;

    return (
      <button
        key={status}
        className={`tab-button ${isActive ? 'active' : ''}`}
        onClick={() => setActiveTab(status)}
      >
        <div className="tab-content">
          <span className="tab-icon">{config.icon}</span>
          <span className="tab-text">{config.label}</span>
        </div>
      </button>
    );
  };

  const renderOrderCard = (order) => (
    <Card key={order.trackingNumber} className="order-card">
      <CardContent className="card-content">
        <div className="order-header">
          <div>
            <div className="tracking-id">#{order.trackingNumber}</div>
            <div className="order-time">{formatDate(order.createdAt)}</div>
          </div>
          <div 
            className="status-badge"
            style={{ backgroundColor: statusConfig[order.status]?.bgColor }}
          >
            <span 
              className="status-text"
              style={{ color: statusConfig[order.status]?.color }}
            >
              {statusConfig[order.status]?.label || order.status}
            </span>
          </div>
        </div>

        <div className="customer-info">
          <div className="info-row">
            <span className="info-icon">👤</span>
            <div className="info-text">
              <div className="info-label">{order.customerName}</div>
              <div className="info-subtext">Customer</div>
            </div>
          </div>
          <div className="info-row">
            <span className="info-icon">📞</span>
            <div className="info-text">
              <div className="info-label">{order.recipientPhone}</div>
              <div className="info-subtext">Contact</div>
            </div>
          </div>
        </div>

        <div className="route-info">
          <div className="info-row">
            <span className="info-icon">📍</span>
            <div className="info-text">
              <div className="info-label">From: {order.pickupAddress}</div>
              <div className="info-label">To: {order.deliveryAddress}</div>
            </div>
          </div>
        </div>

        <div className="service-info">
          <div className="service-label">{getServiceTypeDisplay(order.serviceType)}</div>
        </div>

        {order.deliveryNotes && (
          <div className="service-info">
            <div className="info-label">Notes: {order.deliveryNotes}</div>
          </div>
        )}

        <Button
          className="details-button"
          onClick={() => {
            navigate(`/orders/${order.trackingNumber}`);
          }}
        >
          <span className="button-icon">👁</span>
          <span>View Details</span>
        </Button>
      </CardContent>
    </Card>
  );

  const renderSpecialTabContent = (status) => {
    if (status === 'RESCHEDULED' || status === 'CANCELLED') {
      return (
        <div className="container">
          <div className="empty-state">
            <div className="empty-icon">
              {statusConfig[status].icon}
            </div>
            <div className="empty-title">
              {statusConfig[status].label} Orders
            </div>
            <div className="empty-subtitle">
              API is being developed and will be available soon
            </div>
            <div className="service-info">
              <div className="info-label">
                <strong>Coming Soon:</strong> View and manage {status.toLowerCase()} orders through our API integration
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="orders-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <div>Loading orders...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <div className="orders-header">
        <h1 className="orders-title">Assigned Orders</h1>
        <button className="refresh-button" onClick={onRefresh} disabled={refreshing}>
          <span className={`refresh-icon ${refreshing ? 'spinning' : ''}`}>🔄</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <div className="tabs-scroll">
          {Object.keys(statusConfig).map(status => renderTabButton(status))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="tab-content-container">
        {activeTab === 'RESCHEDULED' || activeTab === 'CANCELLED' ? (
          renderSpecialTabContent(activeTab)
        ) : (
          <div className="orders-list">
            {error ? (
              <div className="error-state">
                <div className="error-icon">⚠️</div>
                <div className="error-text">{error}</div>
                <Button onClick={fetchDriverOrders}>Retry</Button>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">{statusConfig[activeTab].icon}</div>
                <div className="empty-title">No {statusConfig[activeTab].label} Orders</div>
                <div className="empty-subtitle">You don't have any orders with this status.</div>
              </div>
            ) : (
              filteredOrders.map(order => renderOrderCard(order))
            )}
          </div>
        )}
      </div>
    </div>
  );
}