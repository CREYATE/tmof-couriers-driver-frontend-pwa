'use client';

import React, { useEffect, useState } from 'react';

export default function SplashScreen() {
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    // Trigger fade-in animation
    const timer = setTimeout(() => setFadeIn(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      width: '100%',
      backgroundColor: '#ffd215',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 1000,
      transition: 'all 0.8s ease-in-out',
      opacity: fadeIn ? 1 : 0,
      transform: fadeIn ? 'scale(1)' : 'scale(0.9)'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        animation: 'gentle-bounce 2s ease-in-out infinite'
      }}>
        <img 
          src="/tmof-logo.png" 
          alt="TMOF" 
          style={{
            width: '140px',
            height: '140px',
            marginBottom: '32px',
            objectFit: 'contain',
            borderRadius: '20px',
            boxShadow: '0 8px 32px rgba(12, 14, 41, 0.3)'
          }}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        <div 
          style={{
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
            width: '120px',
            height: '120px',
            backgroundColor: '#0C0E29',
            borderRadius: '60px',
            marginBottom: '24px'
          }}
        >
          <span style={{
            color: '#ffd215',
            fontWeight: 'bold',
            fontSize: '36px'
          }}>TMOF</span>
        </div>
        
        <div style={{ marginTop: '20px' }}>
          <h1 style={{
            color: '#0C0E29',
            fontSize: '36px',
            fontWeight: 'bold',
            marginBottom: '12px',
            textShadow: '0 2px 4px rgba(12, 14, 41, 0.1)'
          }}>TMOF Couriers</h1>
          <p style={{
            color: '#0C0E29',
            fontSize: '20px',
            opacity: 0.9,
            marginBottom: '40px',
            fontWeight: '500'
          }}>Driver Portal</p>
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            backgroundColor: '#0C0E29',
            borderRadius: '50%',
            animation: 'pulse 1.5s ease-in-out infinite'
          }} />
          <div style={{
            width: '8px',
            height: '8px',
            backgroundColor: '#0C0E29',
            borderRadius: '50%',
            animation: 'pulse 1.5s ease-in-out infinite 0.2s'
          }} />
          <div style={{
            width: '8px',
            height: '8px',
            backgroundColor: '#0C0E29',
            borderRadius: '50%',
            animation: 'pulse 1.5s ease-in-out infinite 0.4s'
          }} />
        </div>
      </div>
      
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { 
            opacity: 0.3;
            transform: scale(0.8);
          }
          50% { 
            opacity: 1;
            transform: scale(1.2);
          }
        }
        
        @keyframes gentle-bounce {
          0%, 100% { 
            transform: translateY(0px);
          }
          50% { 
            transform: translateY(-10px);
          }
        }
      `}</style>
    </div>
  );
}