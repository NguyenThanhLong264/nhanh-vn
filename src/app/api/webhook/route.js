import { NextResponse } from 'next/server';
import { webhookDispatcher } from '../../lib/handlers/webhookDispatcher';
import condition from '../../data/condition.json'

export async function POST(request) {
    const token = condition.token
    try {
        const body = await request.json();
        const event = body.event;
        const webhooksVerifyToken = body.webhooksVerifyToken;


        if (!event) {
            console.log('Missing event type');
            return NextResponse.json({ message: 'Missing event type' }, { status: 400 });
        } else if (!webhooksVerifyToken) {
            console.log('Missing webhooksVerifyToken');
            return NextResponse.json({ message: 'Missing webhooksVerifyToken' }, { status: 400 });
        } else if (webhooksVerifyToken !== token.NhanhVN_VerifyToken) {
            console.log('WebhooksVerifyToken not match.Received:', webhooksVerifyToken, 'Expected:', token.NhanhVN_VerifyToken);
            return NextResponse.json({ message: 'Missing webhooksVerifyToken' }, { status: 400 });
        }

        webhookDispatcher(event, body).catch(err => {
            console.error('Async webhook handling error:', err.message);
        });

        return NextResponse.json({ message: 'Received successfully' }, { status: 200 });
    } catch (error) {
        console.error('Webhook - Error:', error.message);
        return NextResponse.json(
            { message: 'Webhook processing failed', error: error.message },
            { status: 500 }
        );
    }
}
