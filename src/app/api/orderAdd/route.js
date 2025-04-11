import { NextResponse } from 'next/server';
import axios from 'axios';
import { saveOrderDealMapping } from '../../lib/db';
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

        const config = await loadConfig();

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
            order_status: mapOrderStatus(orderData.status || '', config),
            order_tracking_code: '',
            order_tracking_url: orderData.trackingUrl || '',
            order_products: [],
        };

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

        console.log('OrderAdd - Mapped deal object:', deal);

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

        const orderId = orderData.orderId || orderData.id;
        const dealId = web2Response.data.deal?.id;
        const businessId = body.businessId || orderData.businessId;
        const appid = body.webhooksVerifyToken;

        if (orderId && dealId && businessId && appid) {
            await saveOrderDealMapping(orderId.toString(), dealId.toString(), businessId.toString(), appid);
            console.log(`OrderAdd - Saved mapping: order_id=${orderId}, deal_id=${dealId}, business_id=${businessId}, appid=${appid}`);
        } else {
            console.error('OrderAdd - Missing required fields for mapping:', { orderId, dealId, businessId, appid });
        }

        return NextResponse.json({ message: 'OrderAdd webhook received and processed' }, { status: 200 });
    } catch (error) {
        console.error('OrderAdd - Error:', error.message);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}