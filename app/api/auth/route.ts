import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Auth proxy - Received body:", body);
    
    const response = await fetch(`${BACKEND_URL}/api/employee/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    console.log("Auth proxy - Backend response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log("Auth proxy - Backend error:", errorText);
      return NextResponse.json(
        { error: `Backend error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("Auth proxy - Backend success:", data);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Auth proxy - Fetch error:", error);
    return NextResponse.json(
      { error: "Failed to connect to backend server" },
      { status: 500 }
    );
  }
}