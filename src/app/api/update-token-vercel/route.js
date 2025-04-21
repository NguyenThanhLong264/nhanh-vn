import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        // Parse request body
        const body = await request.json();
        if (!body.token) {
            return NextResponse.json({ error: 'Token is required' }, { status: 400 });
        }

        // Validate environment variables
        if (!process.env.EDGE_CONFIG_ID || !process.env.VERCEL_API_TOKEN) {
            console.error('Missing environment variables: EDGE_CONFIG_ID or VERCEL_API_TOKEN');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        // Optional: Add authentication (e.g., API key)
        const authHeader = request.headers.get('x-api-key');
        if (authHeader !== process.env.API_SECRET) {
            console.warn('Unauthorized request attempt');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Construct API URL with optional teamId
        const url = `https://api.vercel.com/v1/edge-config/${process.env.EDGE_CONFIG_ID}/items${process.env.VERCEL_TEAM_ID ? `?teamId=${process.env.VERCEL_TEAM_ID}` : ''
            }`;

        // Make PATCH request to Vercel Edge Config
        const res = await fetch(url, {
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

        // Check for Vercel API errors
        if (!res.ok) {
            console.error('Vercel API error:', result);
            return NextResponse.json(
                { error: result.error?.message || 'Failed to update token' },
                { status: res.status }
            );
        }

        // Log success for debugging
        console.log('Token updated successfully:', body.token);

        return NextResponse.json({ status: 'ok', message: 'Token updated successfully' });
    } catch (error) {
        // Log detailed error for debugging
        console.error('Error in update-token-vercel:', {
            message: error.message,
            stack: error.stack
        });
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Optional: Add runtime configuration for Vercel
export const runtime = 'edge'; // Run on Vercel Edge for faster execution