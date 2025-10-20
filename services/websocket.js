// WebSocket service for PWA using STOMP over SockJS - Connected to mobile backend
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

// Get backend URL from environment or use localhost for development
const getBackendUrl = () => {
  if (typeof window !== 'undefined') {
    // For client-side, we need to determine the backend URL
    return process.env.NEXT_PUBLIC_BACKEND_URL || 'https://tmof-couriers.onrender.com';
  }
  return 'https://tmof-couriers.onrender.com';
};

// Convert HTTP URL to WebSocket URL
const getWebSocketUrl = () => {
  const backendUrl = getBackendUrl();
  return backendUrl.replace('http://', 'ws://').replace('https://', 'wss://') + '/ws';
};

class PWAWebSocketService {
  constructor() {
    this.client = null;
    this.subscriptions = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 3; // Reduced attempts
    this.reconnectDelay = 5000;
    this.isWebSocketSupported = true;
  }

  connect() {
    try {
      // Initialize STOMP client with dynamic WebSocket URL
      this.client = new Client({
        brokerURL: getWebSocketUrl(),
        connectHeaders: {},
        debug: (str) => {
          console.log('STOMP Debug:', str);
        },
        reconnectDelay: this.reconnectDelay,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: (frame) => {
          console.log('STOMP WebSocket connected to:', getWebSocketUrl(), frame);
          this.reconnectAttempts = 0;
          
          // Re-subscribe to all existing subscriptions
          this.subscriptions.forEach((callback, destination) => {
            this.subscribeToDestination(destination, callback);
          });
        },
        onStompError: (frame) => {
          console.error('STOMP Error:', frame.headers['message']);
          console.error('Additional details:', frame.body);
        },
        onWebSocketClose: () => {
          console.log('WebSocket connection closed');
          this.attemptReconnect();
        },
        onWebSocketError: (error) => {
          console.error('WebSocket error:', error);
          // If we get a connection error, mark WebSocket as unsupported
          if (this.reconnectAttempts === 0) {
            console.warn('WebSocket connection failed, disabling real-time updates');
            this.isWebSocketSupported = false;
          }
        },
      });

      // Activate the client
      this.client.activate();

      return {
        connected: this.client?.connected || false,
        subscribe: this.subscribe.bind(this),
        disconnect: this.disconnect.bind(this),
        isSupported: this.isWebSocketSupported,
      };
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      this.isWebSocketSupported = false;
      return {
        connected: false,
        subscribe: () => console.warn('WebSocket not supported, subscription ignored'),
        disconnect: () => {},
        isSupported: false,
      };
    }
  }

  subscribe(destination, callback) {
    // Store subscription for reconnection
    this.subscriptions.set(destination, callback);
    
    // Only attempt to subscribe if WebSocket is supported and connected
    if (this.isWebSocketSupported && this.client?.connected) {
      this.subscribeToDestination(destination, callback);
    } else if (!this.isWebSocketSupported) {
      console.warn(`WebSocket not supported, cannot subscribe to ${destination}`);
    }
  }

  subscribeToDestination(destination, callback) {
    if (this.client?.connected) {
      this.client.subscribe(destination, (message) => {
        callback({ body: message.body });
      });
      console.log(`Subscribed to ${destination}`);
    }
  }

  disconnect() {
    this.subscriptions.clear();
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }
  }

  attemptReconnect() {
    if (!this.isWebSocketSupported) {
      console.log('WebSocket not supported, skipping reconnection');
      return;
    }

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`WebSocket reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached, disabling WebSocket');
      this.isWebSocketSupported = false;
    }
  }
  // Send message to server (if needed)
  sendMessage(destination, body) {
    if (this.client?.connected) {
      this.client.publish({
        destination: destination,
        body: JSON.stringify(body),
      });
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }
}

// Export singleton instance
export const webSocketService = new PWAWebSocketService();

// Helper functions for compatibility with existing code
export const initializeWebSocket = () => {
  return webSocketService.connect();
};

export const subscribeToTopic = (client, destination, callback) => {
  if (webSocketService.client?.connected) {
    webSocketService.subscribe(destination, callback);
  }
};