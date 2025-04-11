import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

async function openDb() {
    const dbPath = path.join(process.cwd(), 'src', 'app', 'data', 'webhook_mapping.db');
    const db = await open({
        filename: dbPath,
        driver: sqlite3.Database,
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS order_deal_mapping (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id VARCHAR(50) UNIQUE NOT NULL,
            deal_id VARCHAR(50) NOT NULL,
            business_id VARCHAR(50) NOT NULL,
            appid VARCHAR(50) NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    return db;
}

export async function saveOrderDealMapping(orderId, dealId, businessId, appid) {
    const db = await openDb();
    await db.run(
        `INSERT INTO order_deal_mapping (order_id, deal_id, business_id, appid) VALUES (?, ?, ?, ?)`,
        [orderId, dealId, businessId, appid]
    );
    await db.close();
}

export async function getDealIdByOrderId(orderId) {
    const db = await openDb();
    const result = await db.get(
        `SELECT deal_id FROM order_deal_mapping WHERE order_id = ?`,
        [orderId]
    );
    await db.close();
    return result ? result.deal_id : null;
}