'use client';

import React, { useState, useRef, useEffect } from "react";
import Button from "../../components/ui/Button";
import SignaturePad from "signature_pad";
import { webSocketService } from "../../services/websocket";
import { apiService } from "../../services/api";
import './ProofOfDeliveryScreen.css';
import '../../components/driver/DashboardPlaceholder.css';

export default function DriverProofOfDelivery({ order, setStatus, onGoBack }) {
  const [notes, setNotes] = useState(order?.deliveryNotes || "");
  const [isCompleted, setIsCompleted] = useState(order?.status === "DELIVERED");
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");
  const [signature, setSignature] = useState(order?.signature || null);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(order?.status || "AWAITING_COLLECTION");
  const canvasRef = useRef(null);
  const signaturePadRef = useRef(null);

  // Sync currentStatus with order prop changes
  useEffect(() => {
    if (order?.status) {
      setCurrentStatus(order.status);
    }
  }, [order?.status]);

  // Initialize WebSocket for real-time updates
  useEffect(() => {
    if (!order?.trackingNumber) return;

    const wsClient = webSocketService.connect();
    
    // Subscribe to order-specific updates
    const orderTopic = `/topic/orders/${order.trackingNumber}`;
    wsClient.subscribe(orderTopic, (message) => {
      try {
        const orderUpdate = JSON.parse(message.body);
        console.log('Received order update via WebSocket:', orderUpdate);
        
        // Update local state based on WebSocket message
        if (orderUpdate.status && setStatus) {
          setStatus(orderUpdate.status);
        }
        
        // Handle specific order completion
        if (orderUpdate.status === 'DELIVERED') {
          setIsCompleted(true);
        }
        
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });

    // Subscribe to general driver updates
    const driverTopic = `/topic/driver/updates`;
    wsClient.subscribe(driverTopic, (message) => {
      try {
        const driverUpdate = JSON.parse(message.body);
        console.log('Received driver update via WebSocket:', driverUpdate);
        
        // Handle driver-specific updates if needed
        if (driverUpdate.trackingNumber === order.trackingNumber) {
          console.log('Driver update for current order:', driverUpdate);
        }
        
      } catch (error) {
        console.error('Error parsing driver WebSocket message:', error);
      }
    });

    // Cleanup function
    return () => {
      wsClient.disconnect();
    };
  }, [order?.trackingNumber, setStatus]);

  const updateOrderStatus = async (newStatus, signatureData, deliveryNotes) => {
    try {
      setIsUpdating(true);
      setError("");

      const payload = { 
        status: newStatus
      };
      if (signatureData) {
        payload.signature = signatureData;
      }
      if (deliveryNotes) {
        payload.deliveryNotes = deliveryNotes;
      } else {
        // Preserve existing original notes if no new delivery notes provided
        payload.deliveryNotes = order.originalCustomerNotes || order.originalNotes || order.customerNotes || 
                               order.deliveryNotes || 
                               (order.notes && !order.notes.includes('Automatically') ? order.notes : '');
      }

      const response = await apiService.updateOrderStatus(order.trackingNumber, payload);
      
      // Update local status
      setCurrentStatus(newStatus);
      
      if (setStatus) {
        setStatus(newStatus);
      }
      
      if (newStatus === "DELIVERED") {
        setIsCompleted(true);
        setTimeout(() => {
          if (window.history.length > 1) {
            window.history.back();
          } else {
            window.location.href = '/dashboard';
          }
        }, 2000);
      }

      return true;
    } catch (err) {
      console.error("Error updating order status:", err);
      setError(err instanceof Error ? err.message : "Failed to update order status");
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const updateOrderLocation = async (newLocation) => {
    try {
      await apiService.updateOrderLocation(order.trackingNumber, newLocation);
      return true;
    } catch (err) {
      console.error("Error updating location:", err);
      setError(err instanceof Error ? err.message : "Failed to update location");
      return false;
    }
  };

  const handleComplete = async () => {
    if (!signature) {
      setError("Customer signature is required");
      return;
    }
    
    const success = await updateOrderStatus("DELIVERED", signature, notes);
    
    if (success) {
      console.log("Delivery completed:", {
        orderId: order.id,
        trackingNumber: order.trackingNumber,
        customerSignature: signature,
        deliveryNotes: notes,
        timestamp: new Date().toISOString()
      });
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    const success = await updateOrderStatus(newStatus);
    if (success) {
      console.log(`Order status updated to: ${newStatus}`);
    }
  };

  // Function to determine if a status is completed
  const isStatusCompleted = (status) => {
    const statusOrder = ['AWAITING_COLLECTION', 'COLLECTED', 'IN_TRANSIT', 'DELIVERED'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const statusIndex = statusOrder.indexOf(status);
    return statusIndex < currentIndex;
  };

  const handleLocationUpdate = async () => {
    try {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const location = `${position.coords.latitude}, ${position.coords.longitude}`;
            const success = await updateOrderLocation(location);
            if (success) {
              console.log(`Location updated to: ${location}`);
            }
          },
          (error) => {
            console.error("Error getting location:", error);
            setError("Failed to get current location");
          }
        );
      } else {
        setError("Geolocation is not supported by this browser");
      }
    } catch (error) {
      console.error("Error getting location:", error);
      setError("Failed to get current location");
    }
  };

  const clearSignature = () => {
    setSignature(null);
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
    }
  };

  const saveSignature = () => {
    if (signaturePadRef.current && !signaturePadRef.current.isEmpty()) {
      const signatureData = signaturePadRef.current.toDataURL();
      setSignature(signatureData);
      setShowSignaturePad(false);
    } else {
      setError("Please provide a signature");
    }
  };

  // Initialize signature pad when showSignaturePad becomes true
  useEffect(() => {
    if (showSignaturePad && canvasRef.current && !signaturePadRef.current) {
      signaturePadRef.current = new SignaturePad(canvasRef.current, {
        backgroundColor: 'rgb(255, 255, 255)',
        penColor: 'rgb(0, 0, 0)',
        minWidth: 1,
        maxWidth: 3,
      });
    }
  }, [showSignaturePad]);

  // Show signature pad overlay
  if (showSignaturePad) {
    return (
      <div className="signature-container">
        <div className="signature-header">
          <h2 className="signature-title">Customer Signature</h2>
          <p className="signature-subtitle">
            Please ask the customer to sign below
          </p>
        </div>
        
        <div className="signature-pad-container">
          <canvas
            ref={canvasRef}
            className="signature-pad"
            width="350"
            height="200"
          />
        </div>

        <div className="signature-actions">
          <Button
            variant="outline"
            onClick={() => setShowSignaturePad(false)}
            className="cancel-button"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (signaturePadRef.current) {
                signaturePadRef.current.clear();
              }
            }}
            variant="outline"
            className="clear-button"
          >
            Clear
          </Button>
          <Button
            onClick={saveSignature}
            className="save-button"
          >
            Save Signature
          </Button>
        </div>
      </div>
    );
  }

  // Show completion screen
  if (isCompleted) {
    return (
      <div className="completed-container">
        <div className="success-icon">
          <span className="checkmark">✓</span>
        </div>
        <h2 className="completed-title">Order Delivered Successfully</h2>
        <p className="completed-subtitle">
          This order has been marked as delivered and completed.
        </p>
        
        {/* Delivery Summary */}
        <div className="delivery-summary">
          <h3 className="summary-title">Delivery Summary</h3>
          
          <div className="summary-row">
            <span className="summary-label">Delivered to:</span>
            <span className="summary-value">{order.customerName}</span>
          </div>
          
          <div className="summary-row">
            <span className="summary-label">Delivery time:</span>
            <span className="summary-value">{new Date().toLocaleString()}</span>
          </div>
          
          <div className="summary-row">
            <span className="summary-label">Signature:</span>
            <span className="summary-value">✓ Collected</span>
          </div>
          
          <div className="summary-row">
            <span className="summary-label">Notes:</span>
            <span className="summary-value">{order.originalCustomerNotes || order.originalNotes || order.customerNotes || (order.notes && !order.notes.includes('Automatically') ? order.notes : '') || 'No additional notes'}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-placeholder">
      <div className="placeholder-container">
        <div className="placeholder-content">
          <div className="container">
            {error && (
              <div className="error-container">
                <div className="error-header">
                  <span className="error-icon">⚠️</span>
                  <span className="error-text">{error}</span>
                </div>
                <button onClick={() => setError("")} className="dismiss-button">
                  Dismiss
                </button>
              </div>
            )}

            {/* Status Update Buttons */}
            <div className="section">
              <h3 className="section-title">Update Order Status</h3>
              
              <div className="status-buttons">
                {['AWAITING_COLLECTION', 'COLLECTED', 'IN_TRANSIT', 'DELIVERED'].map((status) => (
                  <Button
                    key={status}
                    variant={currentStatus === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleStatusUpdate(status)}
                    className={`status-button ${
                      currentStatus === status 
                        ? 'status-button-active' 
                        : isStatusCompleted(status) 
                          ? 'status-button-completed' 
                          : ''
                    }`}
                    disabled={isUpdating || isStatusCompleted(status)}
                  >
                    {isStatusCompleted(status) && <span className="completed-check">✓ </span>}
                    {status.replace('_', ' ')}
                  </Button>
                ))}
              </div>
            </div>

            {/* Proof of Delivery Section */}
            <div className="section">
              <h3 className="section-title">Proof of Delivery</h3>
              
              {/* Signature Section */}
              <div className="signature-section">
                <label className="field-label">Customer Signature *</label>
                
                {signature ? (
                  <div className="signature-preview">
                    <div className="signature-image-container">
                      <span className="signature-success">✓ Signature captured</span>
                      <img
                        src={signature}
                        alt="Customer signature"
                        className="signature-image"
                      />
                    </div>
                    <div className="signature-actions">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowSignaturePad(true)}
                        className="retake-button"
                      >
                        Retake
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearSignature}
                        className="clear-button"
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="signature-placeholder">
                    <p className="placeholder-text">
                      Tap to capture customer signature
                    </p>
                    <Button
                      onClick={() => setShowSignaturePad(true)}
                      className="signature-button"
                    >
                      Capture Signature
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Complete Button Section */}
            <div className="section-button">
              <Button
                onClick={handleComplete}
                disabled={!signature || isUpdating}
                className={!signature ? "complete-button-disabled" : "complete-button"}
              >
                {isUpdating ? "Processing..." : "Complete Delivery"}
              </Button>
              
              {/* Back Button */}
              <Button
                onClick={onGoBack}
                variant="outline"
                className="back-button"
                style={{ marginTop: '12px' }}
              >
                ← Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}