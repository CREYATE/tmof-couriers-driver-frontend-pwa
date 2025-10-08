// Location service for PWA using browser geolocation API
export class LocationService {
  static async requestLocationPermission() {
    try {
      // For PWA, we don't need explicit permission request
      // The browser will prompt automatically when getCurrentPosition is called
      return true;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  }

  static async getCurrentLocation() {
    try {
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation is not supported by this browser'));
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            resolve(`${latitude},${longitude}`);
          },
          (error) => {
            console.error('Error getting current location:', error);
            reject(new Error('Location permission denied or unavailable'));
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000, // Cache for 1 minute
          }
        );
      });
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  }

  static async getCurrentCoords() {
    try {
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation is not supported by this browser'));
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          (error) => {
            console.error('Error getting current coordinates:', error);
            reject(new Error('Location permission denied or unavailable'));
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000, // Cache for 1 minute
          }
        );
      });
    } catch (error) {
      console.error('Error getting current coordinates:', error);
      return null;
    }
  }

  // Watch position for real-time tracking
  static watchPosition(callback, errorCallback) {
    if (!navigator.geolocation) {
      errorCallback(new Error('Geolocation is not supported by this browser'));
      return null;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        callback({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.error('Error watching position:', error);
        errorCallback(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 30000, // Cache for 30 seconds
      }
    );

    return watchId;
  }

  // Clear position watch
  static clearWatch(watchId) {
    if (watchId && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId);
    }
  }
}

export default LocationService;