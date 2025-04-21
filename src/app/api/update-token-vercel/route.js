// app/api/update-token-vercel/route.js
import { NextResponse } from 'next/server';

export async function POST(request) {
    const body = await request.json();

    const res = await fetch(`https://api.vercel.com/v1/edge-config/${process.env.EDGE_CONFIG_ID}/items`, {
        method: 'PATCH',
        headers: {
            Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            items: [
                { operation: 'update', key: 'token', value: body.token }
            ]
        })
    });

    const result = await res.json();
    return NextResponse.json(result);
}
