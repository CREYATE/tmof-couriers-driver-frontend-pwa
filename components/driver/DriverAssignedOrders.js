'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Clock, Truck, CheckCircle, Calendar, XCircle, Package } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { apiService } from '../../services/api';
import { webSocketService } from '../../services/websocket';
import './DriverAssignedOrders.css';

const statusConfig = {
  AWAITING_COLLECTION: {
    label: "Awaiting Collection",
    icon: "clock",
    color: "#3b82f6",
    bgColor: "#dbeafe",
  },
  COLLECTED: {
    label: "Collected",
    icon: "package",
    color: "#8b5cf6",
    bgColor: "#ede9fe",
  },
  IN_TRANSIT: {
    label: "In Transit", 
    icon: "truck",
    color: "#f59e0b",
    bgColor: "#fef3c7",
  },
  DELIVERED: {
    label: "Delivered",
    icon: "check-circle",
    color: "#059669",
    bgColor: "#d1fae5",
  },
  RESCHEDULED: {
    label: "Rescheduled",
    icon: "calendar",
    color: "#f59e0b",
    bgColor: "#fef3c7",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: "x-circle",
    color: "#dc2626",
    bgColor: "#fee2e2",
  },
};

const serviceTypeLabels = {
  STANDARD: "Standard Delivery",
  STANDARD_DELIVERY: "Standard Delivery",
  EXPRESS: "Express Delivery", 
  OVERNIGHT: "Overnight Delivery",
  SAME_DAY: "Same Day Delivery",
};

export default function DriverAssignedOrders() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("AWAITING_COLLECTION");
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState("");

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

  // Auto-switch to COLLECTED tab if there are COLLECTED orders
  useEffect(() => {
    if (orders.length > 0) {
      const collectedOrders = orders.filter(order => order.status.toUpperCase() === 'COLLECTED');
      if (collectedOrders.length > 0 && activeTab === 'AWAITING_COLLECTION') {
        console.log(`Found ${collectedOrders.length} COLLECTED orders, switching to COLLECTED tab`);
        setActiveTab('COLLECTED');
        
        // Show notification
        setNotification(`${collectedOrders.length} order(s) ready for transit - check Collected tab`);
        setTimeout(() => setNotification(""), 4000);
      }
    }
  }, [orders, activeTab]);

  const fetchDriverOrders = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('driverToken');
      if (!token) {
        setError("Authentication required");
        alert("Please login to view orders");
        return;
      }

      const data = await apiService.getDriverOrders();
      console.log("Driver orders data:", data);
      console.log("Order statuses:", data.map((order) => order.status));
      
      // Debug order notes to understand the issue
      data.forEach((order, index) => {
        console.log(`Order ${index + 1} (${order.trackingNumber}):`, {
          notes: order.notes,
          deliveryNotes: order.deliveryNotes,
          originalNotes: order.originalNotes,
          customerNotes: order.customerNotes,
          status: order.status
        });
      });
      
      // Preserve original notes before any status changes
      const ordersWithOriginalNotes = data.map(order => {
        // Extract original notes by filtering out automatic messages
        let originalNotes = '';
        
        // Check notes field first
        if (order.notes && !order.notes.toLowerCase().includes('automatically') && !order.notes.toLowerCase().includes('moved from')) {
          originalNotes = order.notes;
        }
        // Check deliveryNotes if notes is automatic
        else if (order.deliveryNotes && !order.deliveryNotes.toLowerCase().includes('automatically') && !order.deliveryNotes.toLowerCase().includes('moved from')) {
          originalNotes = order.deliveryNotes;
        }
        // Check customerNotes as fallback
        else if (order.customerNotes) {
          originalNotes = order.customerNotes;
        }
        // Check originalNotes if it exists
        else if (order.originalNotes) {
          originalNotes = order.originalNotes;
        }
        
        return {
          ...order,
          originalCustomerNotes: originalNotes
        };
      });
      
      setOrders(ordersWithOriginalNotes);
      setError("");
    } catch (err) {
      console.error("Error fetching driver orders:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to load orders";
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
              const oldOrder = prevOrders[existingIndex];
              const updatedOrders = [...prevOrders];
              updatedOrders[existingIndex] = { ...updatedOrders[existingIndex], ...orderUpdate };
              
              // Check if status changed and switch to the new tab
              if (oldOrder.status !== orderUpdate.status) {
                const newStatus = orderUpdate.status.toUpperCase();
                
                // Show notification about the status change
                setNotification(`Order ${orderUpdate.trackingNumber} moved to ${newStatus.replace('_', ' ')}`);
                setTimeout(() => setNotification(""), 3000);
                
                // Auto-switch to the new status tab after a short delay
                setTimeout(() => {
                  setActiveTab(newStatus);
                }, 1000);
              }
              
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
    return orders.filter(order => order.status.toUpperCase() === activeTab);
  }, [orders, activeTab]);

  const ordersByStatus = useMemo(() => {
    const grouped = {};
    Object.keys(statusConfig).forEach(status => {
      grouped[status] = orders.filter(order => order.status.toUpperCase() === status);
    });
    return grouped;
  }, [orders]);

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

  const renderIcon = (iconName, color = '#666', size = 16) => {
    const iconProps = { size, color, strokeWidth: 2 };
    
    switch (iconName) {
      case 'clock':
        return <Clock {...iconProps} />;
      case 'package':
        return <Package {...iconProps} />;
      case 'truck':
        return <Truck {...iconProps} />;
      case 'check-circle':
        return <CheckCircle {...iconProps} />;
      case 'calendar':
        return <Calendar {...iconProps} />;
      case 'x-circle':
        return <XCircle {...iconProps} />;
      default:
        return null;
    }
  };

  const renderTabButton = (status) => {
    const config = statusConfig[status];
    const isActive = activeTab === status;
    const orderCount = ordersByStatus[status]?.length || 0;

    return (
      <button
        key={status}
        className={`tab-button ${isActive ? 'active' : ''}`}
        onClick={() => setActiveTab(status)}
      >
        <div className="tab-content">
          <span className="tab-icon">
            {renderIcon(config.icon, isActive ? '#0C0E29' : '#666', 18)}
          </span>
          <span className={`tab-text ${isActive ? 'active' : ''}`}>
            {config.label}
          </span>
          {orderCount > 0 && (
            <span className={`tab-badge ${isActive ? 'active' : ''}`}>
              {orderCount}
            </span>
          )}
        </div>
      </button>
    );
  };

  const renderOrderCard = (order) => (
    <div key={order.id} className="order-card">
      <div className="card-content">
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
            <div className="info-text">
              <div className="info-label">{order.customerName}</div>
              <div className="info-subtext">Customer</div>
            </div>
          </div>
          <div className="info-row">
            <div className="info-text">
              <div className="info-label">{order.recipientPhone}</div>
              <div className="info-subtext">Contact</div>
            </div>
          </div>
        </div>

        <div className="route-info">
          <div className="info-row">
            <div className="info-text">
              <div className="info-label">From: {order.pickupAddress}</div>
              <div className="info-label">To: {order.deliveryAddress}</div>
            </div>
          </div>
        </div>

        <div className="service-info">
          <div className="service-label">{getServiceTypeDisplay(order.serviceType)}</div>
        </div>

        {(order.originalCustomerNotes || order.originalNotes || order.customerNotes) && (
          <div className="service-info">
            <div className="info-label">Notes: {order.originalCustomerNotes || order.originalNotes || order.customerNotes}</div>
          </div>
        )}

        <div className="order-actions">
          <button
            className="details-button"
            onClick={() => {
              console.log('Navigate to order details:', order.trackingNumber);
              router.push(`/proof-of-delivery?trackingNumber=${order.trackingNumber}`);
            }}
          >
            <span>View Details</span>
          </button>
          
          {order.status.toUpperCase() === 'COLLECTED' && (
            <button
              className="transit-button"
              onClick={async () => {
                try {
                  console.log(`Original order data before update:`, {
                    notes: order.notes,
                    deliveryNotes: order.deliveryNotes,
                    status: order.status
                  });
                  
                  const payload = {
                    status: 'IN_TRANSIT',
                    signature: null,
                    // Send the original customer notes, not the system-generated ones
                    deliveryNotes: order.originalCustomerNotes || order.originalNotes || order.customerNotes || '',
                    notes: order.originalCustomerNotes || order.originalNotes || order.customerNotes || '',
                    preserveOriginalNotes: true  // Flag to tell backend not to generate automatic messages
                  };

                  console.log(`Moving order ${order.trackingNumber} from COLLECTED to IN_TRANSIT`);
                  console.log(`Payload being sent:`, payload);
                  
                  const result = await apiService.updateOrderStatus(order.trackingNumber, payload);
                  console.log(`Result received from backend:`, result);
                  
                  if (result) {
                    // Update local state immediately but preserve original notes
                    setOrders(prevOrders => 
                      prevOrders.map(prevOrder => 
                        prevOrder.trackingNumber === order.trackingNumber 
                          ? { 
                              ...prevOrder, 
                              status: 'IN_TRANSIT',
                              // Keep the preserved original notes
                              originalCustomerNotes: prevOrder.originalCustomerNotes
                            }
                          : prevOrder
                      )
                    );

                    // Show notification
                    setNotification(`Order ${order.trackingNumber} moved to In Transit`);
                    setTimeout(() => setNotification(""), 3000);
                    
                    // Switch to IN_TRANSIT tab
                    setTimeout(() => {
                      setActiveTab('IN_TRANSIT');
                    }, 1000);
                    
                    console.log(`Successfully moved order ${order.trackingNumber} to IN_TRANSIT`);
                  }
                } catch (error) {
                  console.error(`Failed to move order ${order.trackingNumber} to IN_TRANSIT:`, error);
                  alert('Failed to move order to In Transit. Please try again.');
                }
              }}
            >
              <span>Move to In Transit</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const renderSpecialTabContent = (status) => {
    if (status === "RESCHEDULED" || status === "CANCELLED") {
      return (
        <div className="container">
          <div className="empty-state">
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

  const renderEmptyState = () => (
    <div className="empty-state">
      <div className="empty-title">
        No {statusConfig[activeTab].label.toLowerCase()} orders
      </div>
      <div className="empty-subtitle">
        Orders with this status will appear here
      </div>
    </div>
  );

  const renderLoadingState = () => (
    <div className="empty-state">
      <div className="empty-title">Loading orders...</div>
      <div className="empty-subtitle">Please wait while we fetch your orders</div>
    </div>
  );

  const renderErrorState = () => (
    <div className="empty-state">
      <div className="empty-title error">Error loading orders</div>
      <div className="empty-subtitle">{error}</div>
      <button
        className="details-button"
        onClick={fetchDriverOrders}
      >
        <span>Retry</span>
      </button>
    </div>
  );

  if (isLoading && orders.length === 0) {
    return (
      <div className="container">
        {renderLoadingState()}
      </div>
    );
  }

  if (error && orders.length === 0) {
    return (
      <div className="container">
        {renderErrorState()}
      </div>
    );
  }

  return (
    <div className="container">
      {/* Notification Banner */}
      {notification && (
        <div className="notification-banner">
          <span>{notification}</span>
        </div>
      )}
      
      <div className="tab-container">
        <div className="tab-container-content">
          {Object.keys(statusConfig).map((status) => 
            renderTabButton(status)
          )}
        </div>
      </div>

      {activeTab === "RESCHEDULED" || activeTab === "CANCELLED" ? (
        renderSpecialTabContent(activeTab)
      ) : (
        <div className="orders-list">
          {refreshing && <div className="refresh-indicator">Refreshing...</div>}
          {filteredOrders.length === 0 ? renderEmptyState() : 
            filteredOrders.map(order => renderOrderCard(order))
          }
        </div>
      )}
    </div>
  );
}