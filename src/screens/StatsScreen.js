import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import './StatsScreen.css';

export default function StatsScreen() {
  return (
    <div className="stats-container">
      <div className="stats-content">
        <Card className="stats-card">
          <CardHeader>
            <CardTitle>Driver Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="stats-info">
              <h3>Performance Metrics</h3>
              <p>Detailed statistics and analytics will be displayed here.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}