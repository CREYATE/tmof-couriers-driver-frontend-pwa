'use client';

import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';

export default function DriverPerformanceStats() {
  const [stats, setStats] = useState({
    overview: {
      completed: 24,
      inTransit: 2,
      cancelled: 1,
      avgDeliveryTime: 42,
      totalOrders: 27,
      completionRate: 88.9,
      onTimeDeliveries: 22,
      customerRating: 4.7
    }
  });

  return (
    <div style={{ 
      flex: 1, 
      backgroundColor: '#ffd215', 
      padding: '16px', 
      height: '100%', 
      overflow: 'auto',
      color: '#0C0E29'
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '24px' }}>Performance Dashboard</h1>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '12px', 
        marginBottom: '16px' 
      }}>
        <div style={{ 
          backgroundColor: '#fff', 
          padding: '16px', 
          borderRadius: '12px', 
          textAlign: 'center' 
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.overview.completed}</div>
          <div style={{ fontSize: '12px', fontWeight: '600' }}>Completed Orders</div>
          <div style={{ fontSize: '10px', color: '#6b7280' }}>This month</div>
        </div>
        
        <div style={{ 
          backgroundColor: '#fff', 
          padding: '16px', 
          borderRadius: '12px', 
          textAlign: 'center' 
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.overview.inTransit}</div>
          <div style={{ fontSize: '12px', fontWeight: '600' }}>In Transit</div>
          <div style={{ fontSize: '10px', color: '#6b7280' }}>Active deliveries</div>
        </div>
        
        <div style={{ 
          backgroundColor: '#fff', 
          padding: '16px', 
          borderRadius: '12px', 
          textAlign: 'center' 
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.overview.avgDeliveryTime}min</div>
          <div style={{ fontSize: '12px', fontWeight: '600' }}>Avg. Delivery Time</div>
          <div style={{ fontSize: '10px', color: '#6b7280' }}>Target: 45min</div>
        </div>
        
        <div style={{ 
          backgroundColor: '#fff', 
          padding: '16px', 
          borderRadius: '12px', 
          textAlign: 'center' 
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.overview.customerRating}/5.0</div>
          <div style={{ fontSize: '12px', fontWeight: '600' }}>Customer Rating</div>
          <div style={{ fontSize: '10px', color: '#6b7280' }}>⭐⭐⭐⭐⭐</div>
        </div>
      </div>
      
      <div style={{ 
        backgroundColor: '#fff', 
        padding: '16px', 
        borderRadius: '12px' 
      }}>
        <h3 style={{ marginBottom: '16px' }}>Completion Rate</h3>
        <div style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span>Orders Completed</span>
            <span>{stats.overview.completed}/{stats.overview.totalOrders}</span>
          </div>
          <div style={{ 
            width: '100%', 
            height: '8px', 
            backgroundColor: '#e5e7eb', 
            borderRadius: '4px' 
          }}>
            <div style={{ 
              width: `${stats.overview.completionRate}%`, 
              height: '100%', 
              backgroundColor: '#22c55e', 
              borderRadius: '4px' 
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}