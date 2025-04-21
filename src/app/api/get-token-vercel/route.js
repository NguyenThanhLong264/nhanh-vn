import { NextResponse } from 'next/server';
import { get } from '@vercel/edge-config';

export async function GET() {
    try {
        const token = await get('token'); // get 'token' from Edge Config
        return NextResponse.json({ token });
    } catch (error) {
        console.error('Error fetching config data:', error);
        return NextResponse.json({ error: 'Failed to fetch token' }, { status: 500 });
    }
}
