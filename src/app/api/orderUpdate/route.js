import { NextResponse } from 'next/server';
import axios from 'axios';
import FormData from 'form-data';
import { getDealIdByOrderId, saveOrderDealMapping } from '../../lib/db';
import { loadConfig, replacePlaceholders, mapOrderStatus, mapPipelineStageId } from '../../lib/services/webhookUtils';
import condition2 from '@/app/data/condition.json';

export async function POST(request) {
    const condition = condition2.token;

    try {
        const body = await request.json();
        console.log('OrderUpdate - Parsed body:', body);

        if (body.event !== 'orderUpdate') {
            console.log(`OrderUpdate - Skipping event: ${body.event}`);
            return NextResponse.json({ message: 'Event not supported' }, { status: 400 });
        }

        const orderData = body.data;
        console.log('OrderUpdate - Order data:', orderData);

        const orderId = orderData.orderId;
        if (!orderId) {
            console.error('OrderUpdate - Missing orderId');
            return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
        }

        const dealId = await getDealIdByOrderId(orderId);
        const config = await loadConfig();

        if (!dealId) {
            console.log(`OrderUpdate - No deal found for order_id=${orderId}, fetching from Nhanh.vn`);

            let fullOrderData = orderData;
            try {
                const version = condition.NhanhVN_Version;
                const appId = condition.NhanhVN_AppId;
                const businessId = condition.NhanhVN_BusinessId;
                const accessToken = condition.NhanhVN_AccessToken;
                const formData = new FormData();
                formData.append('version', version);
                formData.append('appId', appId);
                formData.append('businessId', businessId);
                formData.append('accessToken', accessToken);
                formData.append('data', JSON.stringify({ page: 1, id: orderId.toString() }));

                console.log('OrderUpdate - Sending Nhanh.vn API request:', {
                    version: version,
                    appId: appId,
                    businessId: body.businessId.toString() || businessId,
                    orderId: orderId.toString(),
                });

                const nhanhResponse = await axios.post('https://open.nhanh.vn/api/order/index', formData, {
                    headers: formData.getHeaders(),
                });
                console.log('OrderUpdate - Nhanh.vn API response:', nhanhResponse.data);

                if (nhanhResponse.data.code !== 1 || !nhanhResponse.data.data || !nhanhResponse.data.data.orders) {
                    console.warn('OrderUpdate - Invalid Nhanh.vn response:', nhanhResponse.data);
                    console.log(`OrderUpdate - Falling back to webhook data for order_id=${orderId}`);
                } else {
                    fullOrderData = nhanhResponse.data.data.orders[orderId];
                    if (!fullOrderData) {
                        console.warn(`OrderUpdate - Order ${orderId} not found in Nhanh.vn response`);
                        console.log(`OrderUpdate - Falling back to webhook data for order_id=${orderId}`);
                    } else {
                        console.log('OrderUpdate - Fetched order data from Nhanh.vn:', fullOrderData);
                    }
                }

                if (fullOrderData) {
                    fullOrderData.orderId = fullOrderData.id;
                    fullOrderData.status = fullOrderData.statusCode;
                    if (Array.isArray(fullOrderData.products)) {
                        fullOrderData.products = fullOrderData.products.map(product => ({
                            ...product,
                            id: product.productId  // or any transformation you need
                        }));
                    }
                }
                console.log('OrderUpdate - Fallback order data:', fullOrderData);

                const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
                const response = await axios.post(`${baseUrl}/api/orderAdd`, {
                    event: 'orderAdd',
                    data: fullOrderData
                }, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                return NextResponse.json(response.data, { status: response.status });
            } catch (nhanhError) {
                console.error('OrderUpdate - Nhanh.vn API error:', {
                    message: nhanhError.message,
                    status: nhanhError.response?.status,
                    data: nhanhError.response?.data,
                });
                console.log(`OrderUpdate - Falling back to webhook data for order_id=${orderId}`);
            }
        }


        const dealUpdate = {};
        const nhanhStatus = orderData.status || '';
        const matchedField = [];
        const comment = {
            body: undefined,
            is_public: undefined,
            author_id: undefined
        };

        // 1. Map status and pipeline stage
        if (nhanhStatus) {
            dealUpdate.order_status = mapOrderStatus(nhanhStatus, config);
            dealUpdate.pipeline_stage_id = mapPipelineStageId(nhanhStatus, config);
        }

        // 2. Loop through config.mapping and match value to orderData key
        for (const [dealField, value] of Object.entries(config.mapping)) {
            console.log(`OrderUpdate - Processing field: ${dealField}, value: ${value}`);
            if (!value) continue; // Skip empty values

            // Skip special cases handled separately
            if (
                dealField.startsWith('order_products.') ||
                dealField.startsWith('order_status.') ||
                dealField.startsWith('custom_fields.') ||
                dealField.startsWith('pipeline_stage_id.') ||
                dealField === 'comment'
            ) continue;
            const inputType = config.inputTypes[dealField];

            if (dealField.startsWith('comment.')) {
                const key = dealField.split('.')[1]; // e.g., 'body', 'is_public', 'author_id'
                if (key in comment) {
                    if (inputType === 'custom') {
                        // Use replacePlaceholders if it's a custom input
                        comment[key] = replacePlaceholders(value, orderData);
                    } else {
                        // Normal handling: check if value refers to orderData key
                        if (orderData.hasOwnProperty(value)) {
                            comment[key] = orderData[value];
                        } else {
                            comment[key] = value; // fallback static value
                        }
                    }
                }
            }
            dealUpdate.comment = comment


            // Handle custom fields with placeholders
            if (inputType === 'custom') {
                const mappedValue = replacePlaceholders(value, orderData);
                if (mappedValue !== value) {
                    dealUpdate[dealField] = mappedValue;
                }
            } else {
                // Handle direct mappings where mapping value matches a field in orderData
                if (orderData.hasOwnProperty(value)) {
                    dealUpdate[dealField] = orderData[value];
                    matchedField.push(dealField)
                }
            }
        }

        console.log("Matched dealFields with orderData keys:", matchedField);
        console.log("Comment object:", comment);
        console.log('OrderUpdate - Deal update object:', dealUpdate);
        console.log('OrderUpdate - Deal ID:', dealId);


        if (Object.keys(dealUpdate).length === 0) {
            console.log('OrderUpdate - No fields to update');
            return NextResponse.json({ message: 'No updates required' }, { status: 200 });
        }
        const axiosConfig = {
            method: 'put',
            maxBodyLength: Infinity,
            url: `https://api.caresoft.vn/${condition.CareSoft_Domain}/api/v1/deal/${dealId}`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${condition.CareSoft_ApiToken}`,
            },
            data: JSON.stringify({ deal: dealUpdate }),
        };

        const web2Response = await axios.request(axiosConfig);
        console.log('OrderUpdate - Web 2 update response:', JSON.stringify(web2Response.data));

        if (web2Response.data.code === 'ok') {
            return NextResponse.json(
                { message: 'OrderUpdate webhook received and deal updated' },
                { status: 200 }
            );
        } else {
            console.error('OrderUpdate - Web 2 update failed:', web2Response.data.message);
            return NextResponse.json(
                { error: 'Failed to update deal', details: web2Response.data.message },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error('OrderUpdate - Error:', error.message);
        console.error('OrderUpdate - Error details:', error.response?.data || error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}