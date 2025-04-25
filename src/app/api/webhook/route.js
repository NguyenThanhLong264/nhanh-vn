import { NextResponse } from 'next/server';
import { webhookDispatcher } from '../../lib/handlers/webhookDispatcher';

export async function POST(request) {
    try {
        const body = await request.json();
        const event = body.event;

        if (!event) {
            return NextResponse.json({ message: 'Missing event type' }, { status: 400 });
        }

        const result = await webhookDispatcher(event, body);

        return NextResponse.json(result.data, { status: result.status });
    } catch (error) {
        console.error('Webhook - Error:', error.message);
        return NextResponse.json(
            { message: 'Webhook processing failed', error: error.message },
            { status: 500 }
        );
    }
}
