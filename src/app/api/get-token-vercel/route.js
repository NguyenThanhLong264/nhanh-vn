// app/api/get-token-vercel/route.js
import { NextResponse } from 'next/server';
import { get } from '@vercel/edge-config';

export const config = {
  matcher: '/api/get-token-vercel', // You can adjust this path as necessary
};

export async function GET() {
  try {
    // Fetch data from Vercel Edge Config
    const configData = await get('mapping'); // Or another key like 'token'

    return NextResponse.json(configData); // Send the mapping or token data as response
  } catch (error) {
    console.error('Error fetching config data:', error);
    return NextResponse.json({ error: 'Failed to fetch config data' }, { status: 500 });
  }
}
