import { NextResponse } from 'next/server';
import axios from 'axios';
import { saveOrderDealMapping, getDealIdByOrderId } from '../../lib/db';
import { loadConfig, replacePlaceholders, mapOrderStatus } from '../../lib/webhookUtils';

export async function POST(request) {
    try {
        const body = await request.json();
        console.log('OrderAdd - Parsed body:', body);

        if (body.event !== 'orderAdd') {
            console.log(`OrderAdd - Skipping event: ${body.event}`);
            return NextResponse.json({ message: 'Event not supported' }, { status: 400 });
        }

        const orderData = body.data;
        console.log('OrderAdd - Order data:', orderData);

        const orderId = orderData.orderId || orderData.id;
        if (!orderId) {
            console.error('OrderAdd - Missing orderId');
            return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
        }

        const config = await loadConfig();

        // Bước xử lý customerMobile
        let contactId = null;
        const customerMobile = orderData.customerMobile;
        if (customerMobile) {
            console.log(`OrderAdd - Processing customerMobile: ${customerMobile}`);
            try {
                const checkCustomerResponse = await axios.get(
                    `https://api.caresoft.vn/thammydemo/api/v1/contactsByPhone?phoneNo=${customerMobile}`,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${process.env.WEB2_API_TOKEN}`,
                        },
                    }
                );
                const customerData = checkCustomerResponse.data;
                console.log('OrderAdd - Check customer response:', customerData);

                if (customerData.code === 'ok') {
                    console.log(`OrderAdd - Customer with phone ${customerMobile} exists, updating...`);
                    contactId = customerData.contact.id;
                    const updateCustomerResponse = await axios.put(
                        `https://api.caresoft.vn/thammydemo/api/v1/contacts/${contactId}`,
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
                    console.log('OrderAdd - Update customer response:', updateCustomerResponse.data);
                    console.log(`OrderAdd - Updated customer with phone ${customerMobile}`);
                } else if (customerData.code === 'errors' && customerData.message === 'Not found user') {
                    console.log(`OrderAdd - Customer with phone ${customerMobile} not found, creating new...`);
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
                    console.log('OrderAdd - Create customer response:', createData);

                    if (createData.code === 'ok') {
                        contactId = createData.contact.id;
                        console.log(`OrderAdd - Created new customer with phone ${customerMobile}`);
                    } else if (createData.code === 'errors' && createData.message === 'phone_no already exist') {
                        contactId = createData.extra_data.duplicate_id;
                        console.log(`OrderAdd - Phone ${customerMobile} already exists with ID: ${contactId}`);
                    } else {
                        console.log('OrderAdd - Unexpected response from create customer API:', createData);
                    }
                } else {
                    console.log('OrderAdd - Unexpected response from check customer API:', customerData);
                }
            } catch (customerError) {
                console.error('OrderAdd - Customer processing error:', {
                    message: customerError.message,
                    status: customerError.response?.status,
                    data: customerError.response?.data,
                });
            }
        } else {
            console.log('OrderAdd - No customerMobile found in orderData, skipping customer processing');
        }

        const deal = {
            contact_id: contactId || '',
            username: orderData.customerName || 'Unknown',
            subject: `Đơn hàng của ${orderData.customerName || 'Unknown'}`,
            phone: orderData.customerMobile || '',
            email: orderData.customerEmail || '',
            service_id: '',
            group_id: '',
            assignee_id: '164796592',
            pipeline_id: '24',
            pipeline_stage_id: '174',
            estimated_closed_date: orderData.createdDateTime ? new Date(orderData.createdDateTime).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
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
            order_status: mapOrderStatus(orderData.status || '', config),
            order_tracking_code: '',
            order_tracking_url: orderData.trackingUrl || '',
            order_products: [],
        };

        for (const [dealField, value] of Object.entries(config.mapping)) {
            if (!dealField.startsWith('order_products.') && !dealField.startsWith('order_status.')) {
                if (config.inputTypes[dealField] === 'custom') {
                    deal[dealField] = replacePlaceholders(value, { ...orderData, orderId });
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
                    unit_price: product.price ? parseFloat(product.price) : 0,
                    quantity: product.quantity ? parseFloat(product.quantity) : 0,
                    discount_markup: 0,
                    discount_value: product.discount ? parseFloat(product.discount) : 0,
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
                ? (config.inputTypes[valueKey] === 'custom' ? replacePlaceholders(config.mapping[valueKey], { ...orderData, orderId }) : (orderData[config.mapping[valueKey]] || null))
                : null;
            if (idValue || valueValue) {
                customFieldsMapping.push({ id:idValue, value: valueValue });
            }
        });
        deal.custom_fields = customFieldsMapping;

        delete deal['custom_fields.id_0'];
        delete deal['custom_fields.value_0'];
        delete deal['custom_fields.id_1'];
        delete deal['custom_fields.value_1'];
        delete deal['custom_fields.id_2'];
        delete deal['custom_fields.value_2'];
        delete deal['custom_fields.id_3'];
        delete deal['custom_fields.value_3'];

        console.log('OrderAdd - Deal object:', deal);

        const axiosConfig = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://api.caresoft.vn/thammydemo/api/v1/deal',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.WEB2_API_TOKEN}`,
            },
            data: JSON.stringify({ deal }),
        };

        const web2Response = await axios.request(axiosConfig);
        console.log('OrderAdd - Web 2 response:', JSON.stringify(web2Response.data));

        const dealId = web2Response.data.deal?.id;
        const businessId = body.businessId;
        const appid = body.webhooksVerifyToken;

        if (orderId && dealId && businessId && appid) {
            await saveOrderDealMapping(orderId.toString(), dealId.toString(), businessId.toString(), appid);
            console.log(`OrderAdd - Saved mapping: order_id=${orderId}, deal_id=${dealId}, business_id=${businessId}, appid=${appid}`);
        } else {
            console.error('OrderAdd - Missing fields for mapping:', { orderId, dealId, businessId, appid });
        }

        return NextResponse.json({ message: 'OrderAdd webhook received and processed' }, { status: 200 });
    } catch (error) {
        console.error('OrderAdd - Error:', error.message);
        console.error('OrderAdd - Error details:', error.response?.data);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}