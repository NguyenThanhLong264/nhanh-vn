import { NextResponse } from 'next/server';
import axios from 'axios';
import FormData from 'form-data';
import { getDealIdByOrderId, saveOrderDealMapping } from '../../lib/db';
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
        const config = await loadConfig();

        if (!dealId) {
            console.log(`OrderUpdate - No deal found for order_id=${orderId}, fetching from Nhanh.vn`);

            let fullOrderData = orderData;
            try {
                const formData = new FormData();
                formData.append('version', '2.0');
                formData.append('appId', '75230');
                formData.append('businessId', body.businessId.toString() || '205142');
                formData.append('accessToken', process.env.NHANH_API_TOKEN);
                formData.append('data', JSON.stringify({ page: 1, id: orderId.toString() }));

                console.log('OrderUpdate - Sending Nhanh.vn API request:', {
                    version: '2.0',
                    appId: '75230',
                    businessId: body.businessId.toString() || '205142',
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
            } catch (nhanhError) {
                console.error('OrderUpdate - Nhanh.vn API error:', {
                    message: nhanhError.message,
                    status: nhanhError.response?.status,
                    data: nhanhError.response?.data,
                });
                console.log(`OrderUpdate - Falling back to webhook data for order_id=${orderId}`);
            }

            let contactId = null;
            const customerMobile = fullOrderData.customerMobile;
            if (customerMobile) {
                console.log(`OrderUpdate - Processing customerMobile: ${customerMobile}`);
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
                    console.log('OrderUpdate - Check customer response:', customerData);

                    if (customerData.code === 'ok') {
                        console.log(`OrderUpdate - Customer with phone ${customerMobile} exists, updating...`);
                        contactId = customerData.contact.id;
                        const updateCustomerResponse = await axios.put(
                            `https://api.caresoft.vn/thammydemo/api/v1/contacts/${contactId}`,
                            {
                                contact: {
                                    phone_no: customerMobile,
                                    username: fullOrderData.customerName || customerData.contact.username,
                                    email: fullOrderData.customerEmail || customerData.contact.email,
                                },
                            },
                            {
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${process.env.WEB2_API_TOKEN}`,
                                },
                            }
                        );
                        console.log('OrderUpdate - Update customer response:', updateCustomerResponse.data);
                        console.log(`OrderUpdate - Updated customer with phone ${customerMobile}`);
                    } else {
                        console.log(`OrderUpdate - Customer with phone ${customerMobile} not found, creating new...`);
                        const createCustomerResponse = await axios.post(
                            `https://api.caresoft.vn/thammydemo/api/v1/contacts`,
                            {
                                contact: {
                                    phone_no: customerMobile,
                                    username: fullOrderData.customerName || 'Unknown',
                                    email: fullOrderData.customerEmail || '',
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
                        console.log('OrderUpdate - Create customer response:', createData);

                        if (createData.code === 'ok') {
                            contactId = createData.contact.id;
                            console.log(`OrderUpdate - Created new customer with phone ${customerMobile}`);
                        } else if (createData.code === 'errors' && createData.message === 'phone_no already exist') {
                            contactId = createData.extra_data.duplicate_id;
                            console.log(`OrderUpdate - Phone ${customerMobile} already exists with ID: ${contactId}`);
                        } else {
                            console.error('OrderUpdate - Failed to create customer:', createData);
                        }
                    }
                } catch (customerError) {
                    console.error('OrderUpdate - Customer processing error:', {
                        message: customerError.message,
                        status: customerError.response?.status,
                        data: customerError.response?.data,
                    });
                }
            } else {
                console.log('OrderUpdate - No customerMobile found in orderData, skipping customer processing');
            }

            const deal = {
                contact_id: contactId || '',
                username: fullOrderData.customerName || 'Unknown',
                subject: `Đơn hàng của ${fullOrderData.customerName || 'Unknown'}`,
                phone: fullOrderData.customerMobile || '',
                email: fullOrderData.customerEmail || '',
                service_id: '',
                group_id: '',
                assignee_id: '164796592',
                pipeline_id: '24',
                pipeline_stage_id: '174',
                estimated_closed_date: fullOrderData.createdDateTime
                    ? new Date(fullOrderData.createdDateTime).toISOString().split('T')[0]
                    : new Date().toISOString().split('T')[0],
                deal_label: [],
                custom_fields: [],
                probability: 0,
                value: fullOrderData.calcTotalMoney || 0,
                comment: '',
                'comment.body': fullOrderData.reason || fullOrderData.statusDescription || '',
                'comment.is_public': 1,
                'comment.author_id': '',
                order_address_detail: fullOrderData.customerAddress || '',
                order_buyer_note: fullOrderData.description || fullOrderData.reason || '',
                order_city_id: fullOrderData.shipToCityLocationId || 254,
                order_district_id: fullOrderData.shipToDistrictLocationId || 318,
                order_ward_id: fullOrderData.shipToWardLocationId || 1051,
                order_receiver_name: fullOrderData.customerName || 'Unknown',
                order_receiver_phone: fullOrderData.customerMobile || '',
                order_shipping_fee: fullOrderData.customerShipFee || 0,
                order_status: mapOrderStatus(fullOrderData.statusCode || fullOrderData.status || '', config),
                order_tracking_code: '',
                order_tracking_url: orderData.trackingUrl || '',
                order_products: [],
            };

            if (fullOrderData.products && Array.isArray(fullOrderData.products)) {
                deal.order_products = fullOrderData.products.map((product) => {
                    const productMapped = {
                        sku: product.productId || '',
                        is_free: 0,
                        unit_price: parseFloat(product.price) || 0,
                        quantity: parseFloat(product.quantity) || 0,
                        discount_markup: 0,
                        discount_value: parseFloat(product.discount) || 0,
                    };
                    for (const [dealField, value] of Object.entries(config.mapping)) {
                        if (dealField.startsWith('order_products.')) {
                            const subField = dealField.replace('order_products.', '');
                            if (config.inputTypes[dealField] === 'custom') {
                                productMapped[subField] = replacePlaceholders(value, {
                                    ...fullOrderData,
                                    ...product,
                                });
                            } else if (value.startsWith('products.')) {
                                const productSubField = value.replace('products.', '');
                                productMapped[subField] =
                                    product[productSubField] !== undefined
                                        ? product[productSubField]
                                        : productMapped[subField];
                            }
                        }
                    }
                    return productMapped;
                });
            }

            for (const [dealField, value] of Object.entries(config.mapping)) {
                if (!dealField.startsWith('order_products.') && !dealField.startsWith('order_status.')) {
                    if (config.inputTypes[dealField] === 'custom') {
                        deal[dealField] = replacePlaceholders(value, { ...fullOrderData, orderId });
                    } else {
                        deal[dealField] =
                            fullOrderData[value] !== undefined
                                ? fullOrderData[value]
                                : deal[dealField];
                    }
                }
            }

            const customFieldsMapping = [];
            const customFieldKeys = Object.keys(config.mapping).filter((key) =>
                key.startsWith('custom_fields.id_')
            );
            customFieldKeys.forEach((idKey) => {
                const valueKey = idKey.replace('id_', 'value_');
                const idValue =
                    config.inputTypes[idKey] === 'custom'
                        ? replacePlaceholders(config.mapping[idKey], fullOrderData)
                        : fullOrderData[config.mapping[idKey]] || '';
                const valueValue =
                    config.mapping[valueKey] !== undefined
                        ? config.inputTypes[valueKey] === 'custom'
                            ? replacePlaceholders(config.mapping[valueKey], {
                                  ...fullOrderData,
                                  orderId,
                              })
                            : fullOrderData[config.mapping[valueKey]] || null
                        : null;
                if (idValue || valueValue) {
                    customFieldsMapping.push({ id: idValue, value: valueValue });
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

            console.log('OrderUpdate - Final deal object:', deal);

            const createDealConfig = {
                method: 'post',
                maxBodyLength: Infinity,
                url: 'https://api.caresoft.vn/thammydemo/api/v1/deal',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.WEB2_API_TOKEN}`,
                },
                data: JSON.stringify({ deal }),
            };
            const web2Response = await axios.request(createDealConfig);
            console.log('OrderUpdate - Web 2 create response:', JSON.stringify(web2Response.data));

            const newDealId = web2Response.data.deal?.id;
            const businessId = body.businessId || fullOrderData.businessId || '205142';
            const appid = body.webhooksVerifyToken;

            if (orderId && newDealId && businessId && appid) {
                await saveOrderDealMapping(
                    orderId.toString(),
                    newDealId.toString(),
                    businessId.toString(),
                    appid
                );
                console.log(
                    `OrderUpdate - Saved mapping: order_id=${orderId}, deal_id=${newDealId}, business_id=${businessId}, appid=${appid}`
                );
            } else {
                console.error('OrderUpdate - Missing fields for mapping:', {
                    orderId,
                    newDealId,
                    businessId,
                    appid,
                });
            }

            return NextResponse.json(
                { message: 'OrderUpdate webhook received, deal created', dealId: newDealId },
                { status: 200 }
            );
        }

        const dealUpdate = {};
        const nhanhStatus = orderData.status || '';
        if (nhanhStatus) {
            dealUpdate.order_status = mapOrderStatus(nhanhStatus, config);
        }

        for (const [dealField, value] of Object.entries(config.mapping)) {
            if (
                !dealField.startsWith('order_products.') &&
                !dealField.startsWith('order_status.') &&
                !dealField.startsWith('custom_fields.')
            ) {
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