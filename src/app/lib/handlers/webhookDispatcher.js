import { handleOrderAdd } from './orderAddHandler.js';
import { handleOrderUpdate } from './orderUpdateHandler.js';

export async function webhookDispatcher(event, body) {
    switch (event) {
        case 'orderAdd':
            return await handleOrderAdd(body);

        case 'orderUpdate':
            return await handleOrderUpdate(body);

        case 'webhooksEnabled':
            console.log('Webhook enabled, registered events:', body.data?.registeredEvents);
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
