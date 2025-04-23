import { NextResponse } from 'next/server';
import axios from 'axios';
import { saveOrderDealMapping, getDealIdByOrderId } from '../../lib/db';
import { loadConfig, replacePlaceholders, mapOrderStatus } from '../../lib/webhookUtils';
import condition2 from '../../data/condition.json';

export async function POST(request) {
    const condition = condition2.token;
    try {
        const body = await request.json();
        console.log('OrderAdd - Parsed body:', body);

        if (body.event !== 'orderAdd') {
            console.log(`OrderAdd - Skipping event: ${body.event}`);
            return NextResponse.json({ message: 'Event not supported' }, { status: 400 });
        }

        const orderData = body.data;
        console.log('OrderAdd - Order data:', orderData);

        const orderId = orderData.orderId;
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
                    `https://api.caresoft.vn/${condition.CareSoft_Domain}/api/v1/contactsByPhone?phoneNo=${customerMobile}`,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${condition.CareSoft_ApiToken}`,
                        },
                    }
                );
                const customerData = checkCustomerResponse.data;
                console.log('OrderAdd - Check customer response:', customerData);

                if (customerData.code === 'ok') {
                    console.log(`OrderAdd - Customer with phone ${customerMobile} exists, updating...`);
                    contactId = customerData.contact.id;
                    const updateCustomerResponse = await axios.put(
                        `https://api.caresoft.vn/${condition.CareSoft_Domain}/api/v1/contacts/${contactId}`,
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
                                'Authorization': `Bearer ${condition.CareSoft_ApiToken}`,
                            },
                        }
                    );
                    console.log('OrderAdd - Update customer response:', updateCustomerResponse.data);
                    console.log(`OrderAdd - Updated customer with phone ${customerMobile}`);
                } else if (customerData.code === 'errors' && customerData.message === 'Not found user') {
                    console.log(`OrderAdd - Customer with phone ${customerMobile} not found, creating new...`);
                    const createCustomerResponse = await axios.post(
                        `https://api.caresoft.vn/${condition.CareSoft_Domain}/api/v1/contacts`,
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
                                'Authorization': `Bearer ${condition.CareSoft_ApiToken}`,
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

        // Initialize empty deal object
        const deal = {};

        // Dynamically populate deal based on config.mapping
        for (const [dealField, value] of Object.entries(config.mapping)) {
            console.log(`🛠 Mapping field: ${dealField} => ${value}`);

            if (
                !dealField.startsWith('order_products.') &&
                !dealField.startsWith('custom_fields.') &&
                !dealField.startsWith('order_status.')
            ) {
                if (config.inputTypes[dealField] === 'custom') {
                    // If value contains {{products}}, inject custom product formatting
                    const placeholderData = { ...orderData };
                    Object.keys(placeholderData).forEach(key => {
                        if (placeholderData[key] === null) {
                            placeholderData[key] = 'Không có dữ liệu';
                        }
                    });
                    if (value.includes('{{products}}')) {
                        // Format products array into a string
                        const productLines = Array.isArray(orderData.products)
                            ? orderData.products.map(
                                (p, i) =>
                                    `#${i + 1} ID sản phẩm NhanhVN: ${p.id} 
                                    - SL: ${p.quantity}
                                    - Giá: ${p.price.toLocaleString()}₫ 
                                    - Giảm: ${p.discount?.toLocaleString?.() ?? 0}₫`
                            ).join('\n')
                            : 'Không có sản phẩm';
                        placeholderData.products = productLines;
                    }
                    console.log(`🔍 [Custom] Replacing placeholders in: "${value}" with data:`, placeholderData);
                    const replaced = replacePlaceholders(value, placeholderData);
                    console.log(`✅ [Custom] Result: "${replaced}"`);
                    deal[dealField] = replaced;
                } else {
                    const directValue = orderData[value];
                    console.log(`📦 [Direct] Using orderData[${value}] =`, directValue);
                    deal[dealField] = directValue !== undefined ? directValue : null;
                }
            }
        }


        // Special handling for order_status if defined
        if (config.mapping['order_status'] && config.inputTypes['order_status'] === 'custom') {
            deal['order_status'] = replacePlaceholders(config.mapping['order_status'], { ...orderData, orderId });
        } else if (orderData.status) {
            deal['order_status'] = mapOrderStatus(orderData.status || '', config);
        }

        // Map order products if available
        if (orderData.products && Array.isArray(orderData.products)) {
            // console.log('OrderAdd - Deal before product', deal);
            if (config.inputTypes['order_products'] === 'map') {
                deal.order_products = orderData.products.map((product) => {
                    const productMapped = {};

                    for (const [dealField, value] of Object.entries(config.mapping)) {
                        if (dealField.startsWith('order_products.')) {
                            const subField = dealField.replace('order_products.', '');
                            const inputType = config.inputTypes[dealField];
                            if (inputType === 'custom') {
                                const replacedValue = replacePlaceholders(value, { ...orderData, ...product });
                                productMapped[subField] = replacedValue;
                            } else if (inputType === 'map') {
                                const fieldValue = product[value];
                                if (fieldValue !== undefined) {
                                    productMapped[subField] = fieldValue;
                                } else {
                                    console.warn(`⚠️ Field "${value}","${dealField}" not found in product`);
                                }
                            } else if (value.startsWith('products.')) {
                                const productSubField = value.replace('products.', '');
                                const fieldValue = product[productSubField];
                                if (fieldValue !== undefined) {
                                    productMapped[subField] = fieldValue;
                                } else {
                                    console.warn(`⚠️ Field "${productSubField}" not found in product`);
                                }
                            }
                        }
                    }
                    return productMapped;
                });
            } else {
                console.log('⏭ Skipping product mapping: inputTypes.order_product is not custom');
            }
        }


        if ('pipeline_stage_id' in config.mapping) {
            if (config.inputTypes['pipeline_stage_id'] === 'custom') {
                deal['pipeline_stage_id'] = replacePlaceholders(config.mapping['pipeline_stage_id'], { ...orderData, orderId });
            } else if (orderData.status) {
                const statusKey = orderData.status.trim();
                const key = `pipeline_stage_id.${statusKey}`;
                if (config.mapping[key]) {
                    deal['pipeline_stage_id'] = config.mapping[key];
                } else {
                    console.warn(`OrderAdd - No pipeline_stage_id mapping found for status: ${statusKey}`);
                }
            }
            for (const key in deal) {
                if (key.startsWith('pipeline_stage_id.') || key === '') {
                    delete deal[key];
                }
            }
        }
        if (!config.mapping['probability']) {
            delete deal.probability;
        }
        // Custom fields
        const customFieldsMapping = [];
        const customFieldKeys = Object.keys(config.mapping).filter(key => key.startsWith('custom_fields.id_'));

        customFieldKeys.forEach(idKey => {
            const valueKey = idKey.replace('id_', 'value_');
            const idValue = config.inputTypes[idKey] === 'custom'
                ? replacePlaceholders(config.mapping[idKey], orderData)
                : (orderData[config.mapping[idKey]] || '');

            const valueValue = config.mapping[valueKey] !== undefined
                ? (config.inputTypes[valueKey] === 'custom'
                    ? replacePlaceholders(config.mapping[valueKey], { ...orderData, orderId })
                    : (orderData[config.mapping[valueKey]] || null))
                : null;

            if (
                idValue !== null && idValue !== undefined && idValue !== '' &&
                valueValue !== null && valueValue !== undefined && valueValue !== ''
            ) {
                customFieldsMapping.push({ id: idValue, value: valueValue });
            }
        });
        deal.custom_fields = customFieldsMapping;


        // Final log
        console.log('OrderAdd - Final Deal object:', deal);

        const axiosConfig = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `https://api.caresoft.vn/${condition.CareSoft_Domain}/api/v1/deal`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${condition.CareSoft_ApiToken}`,
            },
            data: JSON.stringify({ deal }),
        };

        const web2Response = await axios.request(axiosConfig);
        console.log('OrderAdd - Web 2 response:', JSON.stringify(web2Response.data));

        const dealId = web2Response.data.deal?.id;
        const businessId = body.businessId;
        const appid = condition.NhanhVN_AppId;

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