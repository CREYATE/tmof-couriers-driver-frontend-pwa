// API Configuration for PWA - Using Next.js API routes as proxy
export const API_CONFIG = {
  BASE_URL: '/api', // Use Next.js API routes as proxy
  BACKEND_URL: 'https://tmof-couriers.onrender.com',
  
  ENDPOINTS: {
    AUTH: '/auth',
    DRIVER_ORDERS: '/driver/orders',
    UPDATE_ORDER_STATUS: '/orders/update/status',
    UPDATE_ORDER_LOCATION: '/orders/update/location',
    ORDER_DETAILS: '/orders',
    EMPLOYEE_LOGOUT: '/employee/logout',
  },
  
  STORAGE_KEYS: {
    JWT_TOKEN: 'driverToken',
    DRIVER_ID: 'driverId',
  },
};

// HTTP request headers
export const getAuthHeaders = (token) => ({
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
});

export const getDefaultHeaders = () => ({
  'Content-Type': 'application/json',
});

// Storage service
export const StorageService = {
  async getToken() {
    return localStorage.getItem(API_CONFIG.STORAGE_KEYS.JWT_TOKEN);
  },

  async setToken(token) {
    localStorage.setItem(API_CONFIG.STORAGE_KEYS.JWT_TOKEN, token);
  },

  async clearToken() {
    localStorage.removeItem(API_CONFIG.STORAGE_KEYS.JWT_TOKEN);
    localStorage.removeItem(API_CONFIG.STORAGE_KEYS.DRIVER_ID);
  },

  async clearTokens() {
    localStorage.removeItem(API_CONFIG.STORAGE_KEYS.JWT_TOKEN);
    localStorage.removeItem(API_CONFIG.STORAGE_KEYS.DRIVER_ID);
  }
};

// API Service class
class ApiService {
  async makeRequest(endpoint, options = {}) {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getDefaultHeaders(),
        ...options.headers,
      },
    });

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Response is not JSON');
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  }

  // Authentication
  async login(credentials) {
    return this.makeRequest(API_CONFIG.ENDPOINTS.AUTH, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  // Driver Orders
  async getDriverOrders() {
    const token = await StorageService.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    return this.makeRequest(API_CONFIG.ENDPOINTS.DRIVER_ORDERS, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
  }

  // Helper method to handle authentication
  async authenticatedRequest(endpoint, options = {}) {
    const token = await StorageService.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    return this.makeRequest(endpoint, {
      ...options,
      headers: {
        ...getAuthHeaders(token),
        ...options.headers,
      },
    });
  }

  // Get order details by tracking number
  async getOrderDetails(trackingNumber) {
    try {
      const token = await StorageService.getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ORDER_DETAILS}/${trackingNumber}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Backend returned non-JSON response.");
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch order details");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching order details:", error);
      throw new Error("Internal server error. Please check if the backend is running.");
    }
  }

  // Update order status - enhanced version
  async updateOrderStatus(trackingNumber, payload) {
    try {
      const token = await StorageService.getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPDATE_ORDER_STATUS}/${trackingNumber}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (jsonError) {
          const text = await response.text();
          throw new Error(text || "Failed to update status");
        }
        throw new Error(errorData.error || "Failed to update status");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error updating order status:", error);
      throw error;
    }
  }

  // Update order location - enhanced version
  async updateOrderLocation(trackingNumber, location) {
    try {
      const token = await StorageService.getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPDATE_ORDER_LOCATION}/${trackingNumber}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ location }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update location");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error updating order location:", error);
      throw error;
    }
  }

  // Get driver profile
  async getDriverProfile(driverId) {
    const token = await StorageService.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    return this.makeRequest(`/api/drivers/${driverId}`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
  }

  // Logout
  async logout() {
    try {
      const token = await StorageService.getToken();
      if (!token) {
        throw new Error("No token provided");
      }

      console.log("Logout - Received token:", token.substring(0, 20) + "...");
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EMPLOYEE_LOGOUT}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      console.log("Logout - Backend status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Logout - Backend error:", errorData);
        throw new Error(errorData.error || "Logout failed");
      }

      const data = await response.json();
      console.log("Logout - Backend data:", data);

      // Clear local token
      await StorageService.clearToken();
      
      return { message: "Logged out successfully" };
    } catch (error) {
      console.error("Logout - Fetch error:", error);
      throw new Error("Internal server error");
    }
  }
}

export const apiService = new ApiService();