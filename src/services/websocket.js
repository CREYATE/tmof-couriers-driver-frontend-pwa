// WebSocket service for PWA using STOMP over SockJS - Connected to production backend
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class PWAWebSocketService {
  constructor() {
    this.client = null;
    this.subscriptions = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 5000;
  }

  connect() {
    try {
      // Initialize STOMP client with SockJS for production backend
      this.client = new Client({
        webSocketFactory: () => {
          return new SockJS('https://tmof-couriers.onrender.com/ws');
        },
        connectHeaders: {},
        debug: (str) => {
          console.log('STOMP Debug:', str);
        },
        reconnectDelay: this.reconnectDelay,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      this.client.onConnect = (frame) => {
        console.log('STOMP WebSocket connected:', frame);
        this.reconnectAttempts = 0;
        
        // Re-subscribe to all existing subscriptions
        this.subscriptions.forEach((callback, destination) => {
          this.subscribeToDestination(destination, callback);
        });
      };

      this.client.onStompError = (frame) => {
        console.error('STOMP Error:', frame.headers['message']);
        console.error('Additional details:', frame.body);
      };

      this.client.onWebSocketClose = () => {
        console.log('WebSocket connection closed');
        this.attemptReconnect();
      };

      this.client.onWebSocketError = (error) => {
        console.error('WebSocket error:', error);
      };

      // Activate the client
      this.client.activate();

      return {
        connected: this.client?.connected || false,
        subscribe: this.subscribe.bind(this),
        disconnect: this.disconnect.bind(this),
      };
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      return {
        connected: false,
        subscribe: () => {},
        disconnect: () => {},
      };
    }
  }

  subscribe(destination, callback) {
    // Store subscription for reconnection
    this.subscriptions.set(destination, callback);
    
    // Subscribe immediately if connected
    if (this.client?.connected) {
      this.subscribeToDestination(destination, callback);
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
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`WebSocket reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }
}

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