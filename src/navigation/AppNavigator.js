import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginScreen from '../screens/LoginScreen';
import MainTabNavigator from './MainTabNavigator';
import SplashScreen from '../screens/SplashScreen';
import { apiService } from '../services/api';

export default function AppNavigator() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('driverToken');
        const driverId = localStorage.getItem('driverId');
        
        if (token && driverId) {
          // Verify token is still valid
          try {
            await apiService.getDriverProfile(driverId);
            setIsAuthenticated(true);
          } catch (error) {
            // Token invalid, clear storage
            localStorage.removeItem('driverToken');
            localStorage.removeItem('driverId');
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

    checkAuth();
  }, []);

  const handleLogin = (success) => {
    if (success) {
      setIsAuthenticated(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('driverToken');
    localStorage.removeItem('driverId');
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={
          isAuthenticated ? 
          <Navigate to="/dashboard" replace /> : 
          <LoginScreen onLogin={handleLogin} />
        } 
      />
      <Route 
        path="/*" 
        element={
          isAuthenticated ? 
          <MainTabNavigator onLogout={handleLogout} /> : 
          <Navigate to="/login" replace />
        } 
      />
    </Routes>
  );
}