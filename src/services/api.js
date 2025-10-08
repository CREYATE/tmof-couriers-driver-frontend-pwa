// API Configuration for PWA - Connected to Next.js API routes
export const API_CONFIG = {
  BASE_URL: '', // Use relative URLs for Next.js API routes
  
  ENDPOINTS: {
    AUTH: '/api/auth',
    DRIVER_ORDERS: '/api/driver/orders',
    UPDATE_ORDER_STATUS: '/api/orders/update/status',
    UPDATE_ORDER_LOCATION: '/api/orders/update/location',
  },
  
  STORAGE_KEYS: {
    JWT_TOKEN: 'jwt',
    DRIVER_JWT: 'driver_jwt',
    ADMIN_JWT: 'admin_jwt',
    AUTH_TOKEN: 'authToken',
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
    // Check both possible token locations
    return localStorage.getItem(API_CONFIG.STORAGE_KEYS.JWT_TOKEN) || 
           localStorage.getItem('driverToken');
  },

  async setToken(token) {
    localStorage.setItem(API_CONFIG.STORAGE_KEYS.JWT_TOKEN, token);
    localStorage.setItem('driverToken', token);
  },

  async clearTokens() {
    Object.values(API_CONFIG.STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
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

  // Update order status
  async updateOrderStatus(trackingNumber, status, signature = null, notes = '') {
    const token = await StorageService.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    return this.makeRequest(`${API_CONFIG.ENDPOINTS.UPDATE_ORDER_STATUS}/${trackingNumber}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ status, signature, notes }),
    });
  }

  // Update order location
  async updateOrderLocation(trackingNumber, location) {
    const token = await StorageService.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    return this.makeRequest(`${API_CONFIG.ENDPOINTS.UPDATE_ORDER_LOCATION}/${trackingNumber}/location`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ location }),
    });
  }

  // Logout
  async logout() {
    await StorageService.clearTokens();
  }
}

export const apiService = new ApiService();