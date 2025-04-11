import fs from 'fs/promises';
import path from 'path';

export async function loadConfig() {
    const configPath = path.join(process.cwd(), 'src', 'app', 'data', 'config.json');
    let config = { mapping: {}, inputTypes: {} };
    try {
        const configData = await fs.readFile(configPath, 'utf8');
        config = JSON.parse(configData);
    } catch (error) {
        console.log('Webhook - No config found, using default');
    }
    return config;
}

export function replacePlaceholders(template, data) {
    if (typeof template !== 'string') return template;
    return template.replace(/\{\{(\w+)\}\}/g, (match, param) => {
        const value = data[param] !== undefined ? data[param] : match;
        console.log(`Replacing ${match} with ${value} in template ${template}`);
        return value;
    });
}

export function mapOrderStatus(nhanhStatus, config) {
    let statusMapped = false;
    let mappedStatus = 'ORDER_STARTED';
    for (const [key, value] of Object.entries(config.mapping)) {
        if (key.startsWith('order_status.')) {
            const web2Status = key.replace('order_status.', '');
            if (value === nhanhStatus) {
                mappedStatus = web2Status;
                console.log(`Mapped order_status: ${nhanhStatus} -> ${web2Status}`);
                statusMapped = true;
                break;
            }
        }
    }
    if (!statusMapped && nhanhStatus) {
        console.log(`No mapping found for Nhanh.vn status: ${nhanhStatus}, using default: ${mappedStatus}`);
    }
    return mappedStatus;
}