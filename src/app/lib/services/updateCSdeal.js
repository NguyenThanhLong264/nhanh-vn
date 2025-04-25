// lib/services/deal/updateDeal.js
import axios from 'axios';
import condition from '../../data/condition.json';
import { loadConfig, replacePlaceholders, mapOrderStatus, mapPipelineStageId } from '../services/webhookUtils';

export async function updateDeal(data, dealId) {
    const token = condition.token
    console.log('Updating deal with data:', data);
    console.log('Updating deal with dealId:', dealId);
    const config = await loadConfig();
    const nhanhStatus = data.status || '';
    const comment = { body: null, is_public: null, author_id: '' };
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
                ? replacePlaceholders(value, data)
                : data[value] || value;
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
            const mappedValue = replacePlaceholders(value, data);
            if (mappedValue !== value) dealUpdate[dealField] = mappedValue;
        } else {
            if (data.hasOwnProperty(value)) {
                dealUpdate[dealField] = data[value];
            }
        }
    }

    dealUpdate.comment = comment;

    if (Object.keys(dealUpdate).length === 0) {
        console.log('updateDeal - Nothing to update');
        return { skip: true };
    }
    console.log('updatedeal - final deal update', dealUpdate, dealId);

    const axiosConfig = {
        method: 'put',
        url: `https://api.caresoft.vn/${token.CareSoft_Domain}/api/v1/deal/${dealId}`,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token.CareSoft_ApiToken}`,
        },
        data: JSON.stringify({ deal: dealUpdate }),
    };

    const res = await axios.request(axiosConfig);
    return res.data;
}
