'use client';

import DriverLoginForm from '../../components/auth/DriverLoginForm';

export default function LoginPage({ onLogin }) {
  return <DriverLoginForm onLogin={onLogin} />;
}