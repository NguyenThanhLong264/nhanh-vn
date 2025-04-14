import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

let dbInstance = null;

async function getDb() {
    if (!dbInstance) {
        dbInstance = await open({
            filename: './src/app/data/webhook_mapping.db',
            driver: sqlite3.Database,
        });

        // Bật WAL mode để hỗ trợ đồng thời
        await dbInstance.run('PRAGMA journal_mode = WAL;');

        await dbInstance.run(`
            CREATE TABLE IF NOT EXISTS order_deal_mapping (
                order_id TEXT PRIMARY KEY,
                deal_id TEXT NOT NULL,
                business_id TEXT NOT NULL,
                appid TEXT NOT NULL
            )
        `);
    }
    return dbInstance;
}

export async function getDealIdByOrderId(orderId) {
    const db = await getDb();
    const result = await db.get(
        'SELECT deal_id FROM order_deal_mapping WHERE order_id = ?',
        orderId
    );
    return result ? result.deal_id : null;
}

export async function saveOrderDealMapping(orderId, dealId, businessId, appId) {
    const db = await getDb();
    const maxRetries = 5;
    let attempt = 0;

    while (attempt < maxRetries) {
        try {
            await db.run(
                'INSERT OR REPLACE INTO order_deal_mapping (order_id, deal_id, business_id, appid) VALUES (?, ?, ?, ?)',
                orderId,
                dealId,
                businessId,
                appId
            );
            console.log(`DB - Saved mapping: order_id=${orderId}, deal_id=${dealId}`);
            return;
        } catch (error) {
            if (error.code === 'SQLITE_BUSY' && attempt < maxRetries - 1) {
                attempt++;
                console.warn(`DB - SQLITE_BUSY, retrying ${attempt}/${maxRetries} for order_id=${orderId}`);
                await new Promise((resolve) => setTimeout(resolve, 100 * attempt));
            } else {
                throw error;
            }
        }
    }
}