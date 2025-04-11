import { NextResponse } from 'next/server';
import axios from 'axios';
import { getDealIdByOrderId } from '../../lib/db';
import { loadConfig, replacePlaceholders, mapOrderStatus } from '../../lib/webhookUtils';

export async function POST(request) {
    try {
        const body = await request.json();
        console.log('OrderUpdate - Parsed body:', body);

        if (body.event !== 'orderUpdate') {
            console.log(`OrderUpdate - Skipping event: ${body.event}`);
            return NextResponse.json({ message: 'Event not supported' }, { status: 400 });
        }

        const orderData = body.data;
        console.log('OrderUpdate - Order data:', orderData);

        const orderId = orderData.orderId || orderData.id;
        if (!orderId) {
            console.error('OrderUpdate - Missing orderId');
            return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
        }

        const dealId = await getDealIdByOrderId(orderId);
        if (!dealId) {
            console.error(`OrderUpdate - No deal found for order_id=${orderId}`);
            return NextResponse.json({ error: 'Deal not found for this order' }, { status: 404 });
        }

        const config = await loadConfig();

        const dealUpdate = {};
        const nhanhStatus = orderData.status || '';
        if (nhanhStatus) {
            dealUpdate.order_status = mapOrderStatus(nhanhStatus, config);
        }

        for (const [dealField, value] of Object.entries(config.mapping)) {
            if (!dealField.startsWith('order_products.') && !dealField.startsWith('order_status.') && !dealField.startsWith('custom_fields.')) {
                if (config.inputTypes[dealField] === 'custom') {
                    const mappedValue = replacePlaceholders(value, orderData);
                    if (mappedValue !== value) dealUpdate[dealField] = mappedValue;
                } else if (orderData[value] !== undefined) {
                    dealUpdate[dealField] = orderData[value];
                }
            }
        }

        if (orderData.statusDescription || orderData.reason) {
            dealUpdate.comment = {
                body: orderData.reason || orderData.statusDescription || '',
                is_public: 1,
            };
        }

        if (orderData.trackingUrl) dealUpdate.order_tracking_url = orderData.trackingUrl;
        if (orderData.deliveryDate) dealUpdate.estimated_closed_date = orderData.deliveryDate;

        console.log('OrderUpdate - Deal update object:', dealUpdate);

        if (Object.keys(dealUpdate).length === 0) {
            console.log('OrderUpdate - No fields to update');
            return NextResponse.json({ message: 'No updates required' }, { status: 200 });
        }

        const axiosConfig = {
            method: 'put',
            maxBodyLength: Infinity,
            url: `https://api.caresoft.vn/thammydemo/api/v1/deal/${dealId}`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.WEB2_API_TOKEN}`,
            },
            data: JSON.stringify({ deal: dealUpdate }),
        };

        const web2Response = await axios.request(axiosConfig);
        console.log('OrderUpdate - Web 2 update response:', JSON.stringify(web2Response.data));

        if (web2Response.data.code === 'ok') {
            return NextResponse.json({ message: 'OrderUpdate webhook received and deal updated' }, { status: 200 });
        } else {
            console.error('OrderUpdate - Web 2 update failed:', web2Response.data.message);
            return NextResponse.json(
                { error: 'Failed to update deal', details: web2Response.data.message },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error('OrderUpdate - Error:', error.message);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}