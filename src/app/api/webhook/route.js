import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request) {
    try {
        const rawBody = await request.text();
        console.log('Webhook - Raw body:', rawBody);

        let body;
        try {
            body = JSON.parse(rawBody);
        } catch (parseError) {
            console.error('Webhook - JSON parse error:', parseError.message);
            return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
        }

        const verifyToken = body.webhooksVerifyToken;
        if (verifyToken !== process.env.VERIFY_TOKEN) {
            console.log('Webhook - Invalid token:', verifyToken);
            return NextResponse.json({ error: 'Invalid verify token' }, { status: 401 });
        }

        const event = body.event;
        const internalUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

        let response;
        if (event === 'orderAdd') {
            response = await axios.post(`${internalUrl}/api/orderAdd`, body, {
                headers: { 'Content-Type': 'application/json' },
            });
            return NextResponse.json(response.data, { status: response.status });
        } else if (event === 'orderUpdate') {
            response = await axios.post(`${internalUrl}/api/orderUpdate`, body, {
                headers: { 'Content-Type': 'application/json' },
            });
            return NextResponse.json(response.data, { status: response.status });
        } else if (event === 'webhooksEnabled') {
            console.log('Webhook - Webhooks enabled confirmed');
            return NextResponse.json({ message: 'Webhooks enabled' }, { status: 200 });
        } else {
            console.log(`Webhook - Skipping event: ${event}`);
            return NextResponse.json({ message: 'Event not supported' }, { status: 400 });
        }
    } catch (error) {
        console.error('Webhook - Error:', error.message);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}