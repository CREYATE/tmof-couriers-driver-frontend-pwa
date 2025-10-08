'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoginScreen from './login/page';
import MainTabNavigator from '../components/navigation/MainTabNavigator';
import SplashScreen from '../components/screens/SplashScreen';
import { apiService } from '../services/api';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Show splash screen for 5 seconds
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
      checkAuth();
    }, 5000);

    return () => clearTimeout(splashTimer);
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('driverToken') || localStorage.getItem('jwt');
      
      if (token) {
        try {
          // Try to fetch driver orders to validate the token
          await apiService.getDriverOrders();
          setIsAuthenticated(true);
        } catch (error) {
          // Token is invalid, clear storage
          localStorage.removeItem('driverToken');
          localStorage.removeItem('jwt');
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (success) => {
    if (success) {
      setIsAuthenticated(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('driverToken');
    localStorage.removeItem('jwt');
    setIsAuthenticated(false);
  };

  // Show splash screen for 5 seconds first
  if (showSplash) {
    return <SplashScreen />;
  }

  // After splash, show login form as landing page if not authenticated
  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // Only show main app if authenticated
  return <MainTabNavigator onLogout={handleLogout} />;
}