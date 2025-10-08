import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
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

    const body = await request.json();
    const { trackingNumber } = params;
    
    console.log("Order location update proxy - Tracking number:", trackingNumber);
    console.log("Order location update proxy - Body:", body);
    
    // Use production backend URL
    const backendUrl = 'https://tmof-couriers.onrender.com';
    const response = await fetch(`${backendUrl}/api/orders/update/location/${trackingNumber}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeader,
      },
      body: JSON.stringify(body),
    });

    console.log("Order location update proxy - Backend response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log("Order location update proxy - Backend error:", errorText);
      return NextResponse.json(
        { error: `Backend error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("Order location update proxy - Backend success:", data);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Order location update proxy - Fetch error:", error);
    return NextResponse.json(
      { error: "Failed to connect to backend server" },
      { status: 500 }
    );
  }
}