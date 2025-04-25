// lib/services/deal/updateDeal.js
import axios from 'axios';
import { replacePlaceholders, mapOrderStatus, mapPipelineStageId } from '../webhookUtils';
import condition from '../../data/condition.json';
import { loadConfig, replacePlaceholders, mapOrderStatus } from '../services/webhookUtils';
import { getDealIdByOrderId } from '../../lib/db';

export async function updateDeal(orderData) {
    const config = await loadConfig();
    const dealId = await getDealIdByOrderId(orderData.orderId)
    const nhanhStatus = orderData.status || '';
    const comment = { body: undefined, is_public: undefined, author_id: undefined };
    const dealUpdate = {};

    // 1. Map status + pipeline
    if (nhanhStatus) {
        dealUpdate.order_status = mapOrderStatus(nhanhStatus, config);
        dealUpdate.pipeline_stage_id = mapPipelineStageId(nhanhStatus, config);
    }

    // 2. Map other fields
    for (const [dealField, value] of Object.entries(config.mapping)) {
        if (!value) continue;
        const inputType = config.inputTypes[dealField];

        if (dealField.startsWith('comment.')) {
            const key = dealField.split('.')[1];
            comment[key] = inputType === 'custom'
                ? replacePlaceholders(value, orderData)
                : orderData[value] || value;
            continue;
        }

        if (
            dealField.startsWith('order_products.') ||
            dealField.startsWith('order_status.') ||
            dealField.startsWith('custom_fields.') ||
            dealField.startsWith('pipeline_stage_id.') ||
            dealField === 'comment'
        ) continue;

        if (inputType === 'custom') {
            const mappedValue = replacePlaceholders(value, orderData);
            if (mappedValue !== value) dealUpdate[dealField] = mappedValue;
        } else {
            if (orderData.hasOwnProperty(value)) {
                dealUpdate[dealField] = orderData[value];
            }
        }
    }

    dealUpdate.comment = comment;

    if (Object.keys(dealUpdate).length === 0) {
        console.log('updateDeal - Nothing to update');
        return { skip: true };
    }

    const axiosConfig = {
        method: 'put',
        url: `https://api.caresoft.vn/${condition.CareSoft_Domain}/api/v1/deal/${dealId}`,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${condition.CareSoft_ApiToken}`,
        },
        data: JSON.stringify({ deal: dealUpdate }),
    };

    const res = await axios.request(axiosConfig);
    return res.data;
}
