// app/api/sync/start/route.js
import { ggsheetCreateDeal, ggsheetMapDeal } from '@/app/lib/ggsheet/dealhandle';
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const body = await req.json();
        const { config, obj } = body;
        if (!config || !obj) {
            return NextResponse.json({ error: 'Missing required data' }, { status: 400 });
        }
        const mapped = await ggsheetMapDeal(obj, config)
        const results = await ggsheetCreateDeal(mapped);

        return NextResponse.json({ message: 'Done', results });
    } catch (error) {
        console.error('Sync error:', {
            message: error.message,
            response: error.response,
        });

        return NextResponse.json({
            error: error.response?.message || error.message || 'Internal server error',
            details: error.response || null,
        }, { status: 500 });
    }
}
