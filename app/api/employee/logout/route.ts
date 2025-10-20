import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    console.log("Employee logout proxy - Auth header:", authHeader);
    
    const response = await fetch(`${BACKEND_URL}/api/employee/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeader,
      },
    });

    console.log("Employee logout proxy - Backend response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log("Employee logout proxy - Backend error:", errorText);
      return NextResponse.json(
        { error: `Backend error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("Employee logout proxy - Backend success:", data);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Employee logout proxy - Fetch error:", error);
    return NextResponse.json(
      { error: "Failed to connect to backend server" },
      { status: 500 }
    );
  }
}