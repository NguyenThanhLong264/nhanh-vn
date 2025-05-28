import axios from 'axios';
import { configClassify } from "@/app/lib/services/webhookUtils.js";

const CS_Domain = process.env.CARESOFT_DOMAIN;
const CS_ApiToken = process.env.CARESOFT_API;

export async function ggsheetCreateDeal(data) {
    const maxRetries = 3;
    let retryCount = 0;
    const baseDelay = 300; // vẫn giữ để dùng cho retry

    while (retryCount < maxRetries) {
        try {
            const axiosConfig = {
                method: 'post',
                maxBodyLength: Infinity,
                url: `https://api.caresoft.vn/${CS_Domain}/api/v1/deal`,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${CS_ApiToken}`,
                },
                data: JSON.stringify({ deal: data }),
            };
            const CSresponse = await axios.request(axiosConfig);
            return {
                status: 200,
                data: CSresponse.data,
            };
        } catch (error) {
            if (error.response?.status !== 429 || retryCount >= maxRetries) {
                throw error;
            }
            retryCount++;
            const delay = baseDelay * Math.pow(2, retryCount); // giữ lại exponential backoff khi gặp lỗi 429
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    throw new Error('Max retries reached');
}


export async function ggsheetMapDeal(data, config) {
    const { normal, special, product, custom } = configClassify(config);
    const deal = {};

    normal.forEach(obj => {
        const { name, typeInput, value } = obj;
        if (typeInput === "normal") {
            deal[name] = replacePlaceholders(value, data);
        } else if (typeInput === "map") {
            deal[name] = data[value];
        }
    });

    special.forEach(obj => {
        const { name, typeInput, value } = obj;
        if (typeInput === "pipeline_stage") {
            const matchedStage = value.find(stage => stage.value === data.status);
            deal[name] = matchedStage ? matchedStage.id : "";
            // console.log(`Pipeline stage mapping: ${data.status} -> ${deal[name]}`);
        } else if (typeInput === "status") {
            const matchedStatus = value.find(status => status.value === data.status);
            deal[name] = matchedStatus ? matchedStatus.status : "ORDER_STARTED";
            // console.log(`Order status mapping: ${data.status} -> ${deal[name]}`);
        }
    });

    product.forEach(obj => {
        const { name, typeInput, subFields } = obj;
        deal[name] = (data.products || []).map(product => {
            const mappedProduct = {};
            subFields.forEach(field => {
                const { name: fieldName, typeInput: fieldType, value } = field;
                if (fieldType === "normal") {
                    mappedProduct[fieldName] = field.value || "";
                } else if (fieldType === "map") {
                    mappedProduct[fieldName] = product[value] || "";
                }
            });
            return mappedProduct;
        });
    });

    custom.forEach(obj => {
        const { name, typeInput, value } = obj;

        if (Array.isArray(value)) {
            deal[name] = (value || []).map(item => ({
                ...item,
                value: replacePlaceholders(item.value, data)
            }));
        }
    });
    const cleanedDeal = cleanEmptyValues(deal);
    // console.log("Final cleaned deal", cleanedDeal);
    return cleanedDeal;
}

function cleanEmptyValues(obj) {
    return Object.fromEntries(
        Object.entries(obj).filter(([_, value]) =>
            value !== null && value !== undefined && value !== ""
        )
    );
}

function replacePlaceholders(template, data) {
    return template.replace(/\{\{(.*?)\}\}/g, (match, key) => {
        const trimmedKey = key.trim();
        return data[trimmedKey] || '';
    });
}