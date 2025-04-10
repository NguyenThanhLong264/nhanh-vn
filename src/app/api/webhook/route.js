import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
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
            return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
        }

        console.log('Webhook - Headers:', Object.fromEntries(request.headers));
        console.log('Webhook - Parsed body:', body);

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

        // Bước xử lý customerMobile
        const customerMobile = orderData.customerMobile;
        if (customerMobile) {
            console.log(`Processing customerMobile: ${customerMobile}`);
            try {
                const checkCustomerResponse = await axios.get(
                    `https://api.caresoft.vn/thammydemo/api/v1/contactsByPhone?phoneNo=${customerMobile}`, // Dùng phoneNo như Postman
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${process.env.WEB2_API_TOKEN}`,
                        },
                    }
                );
                const customerData = checkCustomerResponse.data;
                console.log('Check customer response:', customerData);

                if (customerData.code === 'ok') {
                    console.log(`Customer with phone ${customerMobile} exists, updating...`);
                    const updateCustomerResponse = await axios.put(
                        `https://api.caresoft.vn/thammydemo/api/v1/contacts/${customerData.contact.id}`,
                        {
                            contact: {
                                phone_no: customerMobile,
                                username: orderData.customerName || customerData.contact.username,
                                email: orderData.customerEmail || customerData.contact.email,
                            },
                        },
                        {
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${process.env.WEB2_API_TOKEN}`,
                            },
                        }
                    );
                    console.log('Update customer response:', updateCustomerResponse.data);
                    console.log(`Updated customer with phone ${customerMobile}`);
                } else if (customerData.code === 'errors' && customerData.message === 'Not found user') {
                    console.log(`Customer with phone ${customerMobile} not found, creating new...`);
                    const createCustomerResponse = await axios.post(
                        `https://api.caresoft.vn/thammydemo/api/v1/contacts`,
                        {
                            contact: {
                                phone_no: customerMobile,
                                username: orderData.customerName || 'Unknown',
                                email: orderData.customerEmail || '',
                            },
                        },
                        {
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${process.env.WEB2_API_TOKEN}`,
                            },
                        }
                    );
                    const createData = createCustomerResponse.data;
                    console.log('Create customer response:', createData);

                    if (createData.code === 'ok') {
                        console.log(`Created new customer with phone ${customerMobile}`);
                    } else if (createData.code === 'errors' && createData.message === 'phone_no already exist') {
                        console.log(`Phone ${customerMobile} already exists with ID: ${createData.extra_data.duplicate_id}, skipping creation`);
                    } else {
                        console.log('Unexpected response from create customer API:', createData);
                    }
                } else {
                    console.log('Unexpected response from check customer API:', customerData);
                }
            } catch (customerError) {
                console.error('Customer processing error:', {
                    message: customerError.message,
                    status: customerError.response?.status,
                    data: customerError.response?.data,
                });
            }
        } else {
            console.log('No customerMobile found in orderData, skipping customer processing');
        }

        // Tiếp tục xử lý deal
        const configPath = path.join(process.cwd(), 'src', 'app', 'data', 'config.json');
        let config = { mapping: {}, inputTypes: {} };
        try {
            const configData = await fs.readFile(configPath, 'utf8');
            config = JSON.parse(configData);
        } catch (error) {
            console.log('Webhook - No config found, using default');
        }

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
            order_status: 'ORDER_STARTED', // Giá trị mặc định
            order_tracking_code: '',
            order_tracking_url: orderData.trackingUrl || '',
            order_products: [],
        };

        const replacePlaceholders = (template, data) => {
            if (typeof template !== 'string') return template;
            return template.replace(/\{\{(\w+)\}\}/g, (match, param) => {
                const value = data[param] !== undefined ? data[param] : match;
                console.log(`Replacing ${match} with ${value} in template ${template}`);
                return value;
            });
        };

        // Ánh xạ order_status: Từ trạng thái Nhanh.vn sang trạng thái Web 2
        const nhanhStatus = orderData.status || '';
        let statusMapped = false;
        for (const [key, value] of Object.entries(config.mapping)) {
            if (key.startsWith('order_status.')) {
                const web2Status = key.replace('order_status.', '');
                if (value === nhanhStatus) {
                    deal.order_status = web2Status; // Gán trạng thái Web 2
                    console.log(`Mapped order_status: ${nhanhStatus} -> ${web2Status}`);
                    statusMapped = true;
                    break; // Thoát sau khi tìm thấy ánh xạ đầu tiên
                }
            }
        }
        if (!statusMapped) {
            console.log(`No mapping found for Nhanh.vn status: ${nhanhStatus}, using default: ${deal.order_status}`);
        }

        // Ánh xạ các field khác (giữ nguyên)
        for (const [dealField, value] of Object.entries(config.mapping)) {
            if (!dealField.startsWith('order_products.') && !dealField.startsWith('order_status.')) {
                if (config.inputTypes[dealField] === 'custom') {
                    console.log(`Processing custom field ${dealField} with value: ${value}`);
                    deal[dealField] = replacePlaceholders(value, orderData);
                } else {
                    deal[dealField] = orderData[value] !== undefined ? orderData[value] : deal[dealField];
                }
            }
        }

        // Xử lý order_products (giữ nguyên)
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

        // Xử lý custom_fields (giữ nguyên)
        const customFieldsMapping = [];
        const customFieldKeys = Object.keys(config.mapping).filter(key => key.startsWith('custom_fields.id_'));
        customFieldKeys.forEach(idKey => {
            const valueKey = idKey.replace('id_', 'value_');
            const idValue = config.inputTypes[idKey] === 'custom' ? replacePlaceholders(config.mapping[idKey], orderData) : (orderData[config.mapping[idKey]] || '');
            const valueValue = config.mapping[valueKey] !== undefined
                ? (config.inputTypes[valueKey] === 'custom' ? replacePlaceholders(config.mapping[valueKey], orderData) : (orderData[config.mapping[valueKey]] || null))
                : null;

            if (idValue || valueValue) {
                customFieldsMapping.push({
                    id: idValue,
                    value: valueValue,
                });
            }
        });
        deal.custom_fields = customFieldsMapping;

        delete deal['custom_fields.id'];
        delete deal['custom_fields.value'];

        console.log('Webhook - Mapped deal object:', deal);
        console.log('Webhook - Sending deal to Web 2:', JSON.stringify({ deal }));

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

        try {
            const web2Response = await axios.request(axiosConfig);
            console.log('Webhook - Web 2 response:', JSON.stringify(web2Response.data));
            return NextResponse.json({ message: 'Webhook received and processed' }, { status: 200 });
        } catch (web2Error) {
            console.error('Webhook - Web 2 error:', web2Error.response ? web2Error.response.data : web2Error.message);
            return NextResponse.json(
                { error: 'Failed to process deal in Web 2', details: web2Error.response?.data },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Webhook - Error:', error.message);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}