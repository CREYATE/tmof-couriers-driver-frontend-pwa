import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import './OrderDetailsScreen.css';

export default function OrderDetailsScreen() {
  const { orderId } = useParams();

  return (
    <div className="order-details-container">
      <div className="order-details-content">
        <Card className="order-details-card">
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="order-info">
              <h3>Order #{orderId}</h3>
              <p>Detailed order information will be displayed here.</p>
              
              <div className="order-actions">
                <Button variant="default">
                  Update Status
                </Button>
                <Button variant="outline">
                  Contact Customer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}