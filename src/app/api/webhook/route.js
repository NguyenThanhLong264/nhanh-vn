import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';
import { saveOrderDealMapping, getDealIdByOrderId } from '../../lib/db';

export async function POST(request) {
    try {
        const rawBody = await request.text();
        console.log('Webhook - Raw body:', rawBody);

        let body;
        try {
            body = JSON.parse(rawBody);
        } catch (parseError) {
            console.error('Webhook - JSON parse error:', parseError.message);
            return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
        }

        console.log('Webhook - Headers:', Object.fromEntries(request.headers));
        console.log('Webhook - Parsed body:', body);

        const verifyToken = body.webhooksVerifyToken;
        if (verifyToken !== process.env.VERIFY_TOKEN) {
            console.log('Webhook - Invalid token:', verifyToken);
            return NextResponse.json({ error: 'Invalid verify token' }, { status: 401 });
        }

        const event = body.event;
        if (!['orderAdd', 'orderUpdate'].includes(event)) {
            console.log(`Webhook - Skipping event: ${event} (only 'orderAdd' and 'orderUpdate' are processed)`);
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

        const replacePlaceholders = (template, data) => {
            if (typeof template !== 'string') return template;
            return template.replace(/\{\{(\w+)\}\}/g, (match, param) => {
                const value = data[param] !== undefined ? data[param] : match;
                console.log(`Replacing ${match} with ${value} in template ${template}`);
                return value;
            });
        };

        if (event === 'orderAdd') {
            // Logic cho orderAdd
            const deal = {
                username: orderData.customerName || 'Unknown',
                subject: `Đơn hàng của ${orderData.customerName || 'Unknown'}`,
                phone: orderData.customerMobile || '',
                email: orderData.customerEmail || '',
                service_id: '',
                group_id: '',
                assignee_id: '164796592',
                pipeline_id: '24',
                pipeline_stage_id: '174',
                estimated_closed_date: new Date().toISOString().split('T')[0],
                deal_label: [],
                custom_fields: [],
                probability: 0,
                value: orderData.calcTotalMoney || 0,
                comment: '',
                'comment.body': '',
                'comment.is_public': 1,
                'comment.author_id': '',
                order_address_detail: orderData.customerAddress || '',
                order_buyer_note: orderData.description || '',
                order_city_id: orderData.shipToCityLocationId || 254,
                order_district_id: orderData.shipToDistrictLocationId || 318,
                order_ward_id: orderData.shipToWardLocationId || 1051,
                order_receiver_name: orderData.customerName || 'Unknown',
                order_receiver_phone: orderData.customerMobile || '',
                order_shipping_fee: orderData.customerShipFee || 0,
                order_status: 'ORDER_STARTED',
                order_tracking_code: '',
                order_tracking_url: orderData.trackingUrl || '',
                order_products: [],
            };

            const nhanhStatus = orderData.status || '';
            let statusMapped = false;
            for (const [key, value] of Object.entries(config.mapping)) {
                if (key.startsWith('order_status.')) {
                    const web2Status = key.replace('order_status.', '');
                    if (value === nhanhStatus) {
                        deal.order_status = web2Status;
                        console.log(`Mapped order_status: ${nhanhStatus} -> ${web2Status}`);
                        statusMapped = true;
                        break;
                    }
                }
            }
            if (!statusMapped) {
                console.log(`No mapping found for Nhanh.vn status: ${nhanhStatus}, using default: ${deal.order_status}`);
            }

            for (const [dealField, value] of Object.entries(config.mapping)) {
                if (!dealField.startsWith('order_products.') && !dealField.startsWith('order_status.')) {
                    if (config.inputTypes[dealField] === 'custom') {
                        deal[dealField] = replacePlaceholders(value, orderData);
                    } else {
                        deal[dealField] = orderData[value] !== undefined ? orderData[value] : deal[dealField];
                    }
                }
            }

            if (orderData.products && Array.isArray(orderData.products)) {
                deal.order_products = orderData.products.map((product) => {
                    const productMapped = {
                        sku: product.id || '',
                        is_free: 0,
                        unit_price: product.price || 0,
                        quantity: product.quantity || 0,
                        discount_markup: 0,
                        discount_value: product.discount || 0,
                    };

                    for (const [dealField, value] of Object.entries(config.mapping)) {
                        if (dealField.startsWith('order_products.')) {
                            const subField = dealField.replace('order_products.', '');
                            if (config.inputTypes[dealField] === 'custom') {
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

            const customFieldsMapping = [];
            const customFieldKeys = Object.keys(config.mapping).filter(key => key.startsWith('custom_fields.id_'));
            customFieldKeys.forEach(idKey => {
                const valueKey = idKey.replace('id_', 'value_');
                const idValue = config.inputTypes[idKey] === 'custom' ? replacePlaceholders(config.mapping[idKey], orderData) : (orderData[config.mapping[idKey]] || '');
                const valueValue = config.mapping[valueKey] !== undefined
                    ? (config.inputTypes[valueKey] === 'custom' ? replacePlaceholders(config.mapping[valueKey], orderData) : (orderData[config.mapping[valueKey]] || null))
                    : null;

                if (idValue || valueValue) {
                    customFieldsMapping.push({ id: idValue, value: valueValue });
                }
            });
            deal.custom_fields = customFieldsMapping;

            delete deal['custom_fields.id'];
            delete deal['custom_fields.value'];

            console.log('Webhook - Mapped deal object:', deal);

            const axiosConfig = {
                method: 'post',
                maxBodyLength: Infinity,
                url: 'https://api.caresoft.vn/thammydemo/api/v1/deal', // Endpoint cho POST
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.WEB2_API_TOKEN}`,
                },
                data: JSON.stringify({ deal }),
            };

            const web2Response = await axios.request(axiosConfig);
            console.log('Webhook - Web 2 response:', JSON.stringify(web2Response.data));

            const orderId = orderData.orderId || orderData.id;
            const dealId = web2Response.data.deal?.id;
            const businessId = body.businessId || orderData.businessId;
            const appid = body.webhooksVerifyToken;

            if (orderId && dealId && businessId && appid) {
                await saveOrderDealMapping(orderId.toString(), dealId.toString(), businessId.toString(), appid);
                console.log(`Saved mapping: order_id=${orderId}, deal_id=${dealId}, business_id=${businessId}, appid=${appid}`);
            } else {
                console.error('Missing required fields for mapping:', { orderId, dealId, businessId, appid });
            }

            return NextResponse.json({ message: 'Webhook received and processed' }, { status: 200 });
        } else if (event === 'orderUpdate') {
            // Logic cho orderUpdate
            const orderId = orderData.orderId || orderData.id;
            if (!orderId) {
                console.error('Webhook - Missing orderId for orderUpdate');
                return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
            }

            const dealId = await getDealIdByOrderId(orderId);
            if (!dealId) {
                console.error(`Webhook - No deal found for order_id=${orderId}`);
                return NextResponse.json({ error: 'Deal not found for this order' }, { status: 404 });
            }

            // Tạo deal object để cập nhật (chỉ chứa các trường cần thay đổi)
            const dealUpdate = {};
            const nhanhStatus = orderData.status || '';
            let statusMapped = false;

            for (const [key, value] of Object.entries(config.mapping)) {
                if (key.startsWith('order_status.')) {
                    const web2Status = key.replace('order_status.', '');
                    if (value === nhanhStatus) {
                        dealUpdate.order_status = web2Status;
                        console.log(`Mapped order_status: ${nhanhStatus} -> ${web2Status}`);
                        statusMapped = true;
                        break;
                    }
                }
            }
            if (!statusMapped && nhanhStatus) {
                console.log(`No mapping found for Nhanh.vn status: ${nhanhStatus}, skipping order_status update`);
            }

            // Ánh xạ các trường khác nếu có trong webhook
            for (const [dealField, value] of Object.entries(config.mapping)) {
                if (!dealField.startsWith('order_products.') && !dealField.startsWith('order_status.') && !dealField.startsWith('custom_fields.')) {
                    if (config.inputTypes[dealField] === 'custom') {
                        const mappedValue = replacePlaceholders(value, orderData);
                        if (mappedValue !== value) dealUpdate[dealField] = mappedValue; // Chỉ thêm nếu có thay đổi
                    } else if (orderData[value] !== undefined) {
                        dealUpdate[dealField] = orderData[value];
                    }
                }
            }

            // Thêm comment nếu có statusDescription hoặc reason
            if (orderData.statusDescription || orderData.reason) {
                dealUpdate.comment = {
                    body: orderData.reason || orderData.statusDescription || '',
                    is_public: 1,
                };
            }

            // Thêm các trường cụ thể từ orderUpdate
            if (orderData.trackingUrl) dealUpdate.order_tracking_url = orderData.trackingUrl;
            if (orderData.deliveryDate) dealUpdate.estimated_closed_date = orderData.deliveryDate;

            console.log('Webhook - Deal update object:', dealUpdate);

            if (Object.keys(dealUpdate).length === 0) {
                console.log('Webhook - No fields to update');
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

            try {
                const web2Response = await axios.request(axiosConfig);
                console.log('Webhook - Web 2 update response:', JSON.stringify(web2Response.data));

                if (web2Response.data.code === 'ok') {
                    return NextResponse.json({ message: 'Webhook received and deal updated' }, { status: 200 });
                } else {
                    console.error('Webhook - Web 2 update failed:', web2Response.data.message);
                    return NextResponse.json(
                        { error: 'Failed to update deal', details: web2Response.data.message },
                        { status: 400 }
                    );
                }
            } catch (web2Error) {
                console.error('Webhook - Web 2 update error:', web2Error.response?.data || web2Error.message);
                return NextResponse.json(
                    { error: 'Failed to update deal in Web 2', details: web2Error.response?.data },
                    { status: 500 }
                );
            }
        }
    } catch (error) {
        console.error('Webhook - Error:', error.message);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}