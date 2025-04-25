import { handleOrderAdd } from './orderAddHandler.js';
import { handleOrderUpdate } from './orderUpdateHandler.js';

export async function webhookDispatcher(event, body) {
    switch (event) {
        case 'orderAdd':
            console.log('Handler Event:', event);
            return await handleOrderAdd(body);

        case 'orderUpdate':
            console.log('Handler Event:', event);
            return await handleOrderUpdate(body);

        case 'webhooksEnabled':
            console.log('Handler Event:', event);
            console.log('Webhook enabled, body.data:', body.data);
            return {
                status: 200,
                data: { message: 'Webhook enabled received' },
            };

        default:
            console.warn(`Unsupported webhook event: ${event}`);
            return {
                status: 400,
                data: { message: `Event "${event}" not supported` },
            };
    }
}
