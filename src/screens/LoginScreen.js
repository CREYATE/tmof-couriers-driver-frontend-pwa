import React from 'react';
import DriverLoginForm from '../components/auth/DriverLoginForm';

export default function LoginScreen({ onLogin }) {
  return <DriverLoginForm onLogin={onLogin} />;
}