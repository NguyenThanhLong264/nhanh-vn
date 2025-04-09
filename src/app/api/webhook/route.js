import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';

export async function POST(request) {
    try {
        const body = await request.json();
        console.log('Webhook - Headers:', Object.fromEntries(request.headers));
        console.log('Webhook - Body:', body);

        const verifyToken = body.webhooksVerifyToken;
        if (verifyToken !== process.env.VERIFY_TOKEN) {
            console.log('Webhook - Invalid token:', verifyToken);
            return NextResponse.json({ error: 'Invalid verify token' }, { status: 401 });
        }

        if (body.event !== 'orderAdd') {
            console.log(`Webhook - Skipping event: ${body.event} (only 'orderAdd' is processed)`);
            return NextResponse.json({ message: 'Webhook received but not processed' }, { status: 200 });
        }

        const orderData = body.data;
        console.log('Webhook - Order data:', orderData);

        const configPath = path.join(process.cwd(), 'src', 'app', 'data', 'config.json');
        let config = { mapping: {}, inputTypes: {} };
        try {
            const configData = await fs.readFile(configPath, 'utf8');
            config = JSON.parse(configData);
        } catch (error) {
            console.log('Webhook - No config found, using default');
        }

        const deal = {
            username: '',
            subject: '',
            phone: '',
            email: '',
            service_id: '',
            group_id: '',
            assignee_id: '',
            pipeline_id: '',
            pipeline_stage_id: '',
            estimated_closed_date: new Date().toISOString().split('T')[0],
            deal_label: [],
            custom_fields: [],
            probability: 0,
            value: 0,
            comment: '',
            'comment.body': '',
            'comment.is_public': 1,
            'comment.author_id': '',
            order_address_detail: '',
            order_buyer_note: '',
            order_city_id: '',
            order_district_id: '',
            order_ward_id: '',
            order_receiver_name: '',
            order_receiver_phone: '',
            order_shipping_fee: 0,
            order_status: 'New',
            order_tracking_code: '',
            order_tracking_url: '',
            order_products: [],
        };

        // Hàm thay thế placeholder
        const replacePlaceholders = (template, data) => {
            if (typeof template !== 'string') return template;
            return template.replace(/\{\{(\w+)\}\}/g, (match, param) => {
                const value = data[param] !== undefined ? data[param] : match;
                console.log(`Replacing ${match} with ${value} in template ${template}`);
                return value;
            });
        };

        // Ánh xạ các trường thông thường
        for (const [dealField, value] of Object.entries(config.mapping)) {
            if (!dealField.startsWith('order_products.')) {
                if (config.inputTypes[dealField] === 'custom') {
                    console.log(`Processing custom field ${dealField} with value: ${value}`);
                    deal[dealField] = replacePlaceholders(value, orderData);
                } else {
                    deal[dealField] = orderData[value] !== undefined ? orderData[value] : deal[dealField];
                }
            }
        }

        // Điều chỉnh dữ liệu thông thường
        if (deal.email === null) deal.email = '';
        if (deal.comment === null) deal.comment = '';
        if (deal.order_buyer_note === null) deal.order_buyer_note = '';
        if (deal.value === 0 && orderData.calcTotalMoney) deal.value = orderData.calcTotalMoney;

        if (!deal.username && !deal.phone && !deal.email) {
            deal.username = orderData.customerName || 'Unknown';
            deal.phone = orderData.customerMobile || '';
            deal.email = orderData.customerEmail || '';
        }

        // Xử lý ánh xạ order_products
        if (orderData.products && Array.isArray(orderData.products)) {
            deal.order_products = orderData.products.map((product) => {
                const productMapped = {
                    sku: '',
                    is_free: 0,
                    unit_price: 0,
                    quantity: 0,
                    discount_markup: 0,
                    discount_value: 0,
                };

                for (const [dealField, value] of Object.entries(config.mapping)) {
                    if (dealField.startsWith('order_products.')) {
                        const subField = dealField.replace('order_products.', '');
                        if (config.inputTypes[dealField] === 'custom') {
                            console.log(`Processing custom product field ${dealField} with value: ${value}`);
                            productMapped[subField] = replacePlaceholders(value, { ...orderData, ...product });
                        } else if (value.startsWith('products.')) {
                            const productSubField = value.replace('products.', '');
                            productMapped[subField] = product[productSubField] !== undefined ? product[productSubField] : productMapped[subField];
                        }
                    }
                }

                return productMapped;
            });
        }

        console.log('Webhook - Mapped deal object:', deal);

        const axiosConfig = {
            method: 'post',
            maxBodyLength: Infinity,
            url: process.env.WEB2_API_URL,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.WEB2_API_TOKEN}`,
            },
            data: JSON.stringify({ deal }),
        };

        const web2Response = await axios.request(axiosConfig);
        console.log('Webhook - Web 2 response:', JSON.stringify(web2Response.data));

        return NextResponse.json({ message: 'Webhook received and processed' }, { status: 200 });
    } catch (error) {
        if (error.response) {
            console.error('Webhook - Web 2 error response:', {
                status: error.response.status,
                data: error.response.data,
                headers: error.response.headers,
            });
        } else {
            console.error('Webhook - Error:', error.message);
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}