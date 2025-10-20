import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

export async function GET(
  request: NextRequest,
  { params }: { params: { trackingNumber: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const { trackingNumber } = params;
    
    console.log("Order details proxy - Tracking number:", trackingNumber);
    
    const response = await fetch(`${BACKEND_URL}/api/orders/${trackingNumber}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeader,
      },
    });

    console.log("Order details proxy - Backend response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log("Order details proxy - Backend error:", errorText);
      return NextResponse.json(
        { error: `Backend error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("Order details proxy - Backend success:", data);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Order details proxy - Fetch error:", error);
    return NextResponse.json(
      { error: "Failed to connect to backend server" },
      { status: 500 }
    );
  }
}