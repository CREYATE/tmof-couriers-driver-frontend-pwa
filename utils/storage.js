// Storage utility for mobile PWA (localStorage based)
export class StorageService {
  static async getToken() {
    return localStorage.getItem('driverToken');
  }

  static async setToken(token) {
    localStorage.setItem('driverToken', token);
  }

  static async clearToken() {
    localStorage.removeItem('driverToken');
    localStorage.removeItem('driverId');
  }

  static async getDriverId() {
    return localStorage.getItem('driverId');
  }

  static async setDriverId(driverId) {
    localStorage.setItem('driverId', driverId);
  }
}

export default StorageService;