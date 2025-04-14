import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request) {
    try {
        const body = await request.json();
        console.log('Webhook - Raw body:', JSON.stringify(body));

        const event = body.event;
        let endpoint;

        switch (event) {
            case 'orderAdd':
                endpoint = '/api/orderAdd';
                break;
            case 'orderUpdate':
                endpoint = '/api/orderUpdate';
                break;
            default:
                console.log(`Webhook - Unsupported event: ${event}`);
                return NextResponse.json({ message: 'Event not supported' }, { status: 400 });
        }

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        if (!baseUrl) {
            console.error('Webhook - NEXT_PUBLIC_BASE_URL is not defined');
            return NextResponse.json(
                { message: 'Webhook received, but base URL is not configured' },
                { status: 200 }
            );
        }

        console.log(`Webhook - Forwarding to ${baseUrl}${endpoint}`);

        const response = await axios.post(
            `${baseUrl}${endpoint}`,
            body,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        console.log(`Webhook - Response from ${endpoint}:`, response.data);
        return NextResponse.json(response.data, { status: response.status });
    } catch (error) {
        console.error('Webhook - Error:', error.message);
        console.error('Webhook - Error details:', error.response?.data || error);
        return NextResponse.json(
            { message: 'Webhook received, but processing failed', error: error.message },
            { status: 200 }
        );
    }
}