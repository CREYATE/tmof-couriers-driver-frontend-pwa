'use client';

import React from 'react';
import './Button.css';

export default function Button({
  variant = 'default',
  size = 'default',
  disabled = false,
  onClick,
  children,
  className = '',
  type = 'button',
  ...props
}) {
  const getButtonClasses = () => {
    const classes = ['button'];
    
    classes.push(`button-${variant}`);
    classes.push(`button-${size}`);
    
    if (disabled) classes.push('button-disabled');
    if (className) classes.push(className);
    
    return classes.join(' ');
  };

  return (
    <button
      type={type}
      className={getButtonClasses()}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}