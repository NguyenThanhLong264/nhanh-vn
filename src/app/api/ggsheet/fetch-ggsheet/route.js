// nhanh-vn/src/app/api/ggsheet/fetch-ggsheet/route.js
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { config, sheetFields } = await request.json();
        const { GGSheetApi: apiKey, GGSheetSpreadsheetId: spreadsheetId } = config;

        // Gọi Google Sheets API
        const range = 'Sheet1!A2:Z';
        const response = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`
        );

        if (!response.ok) {
            throw new Error(`Google Sheets API error: ${response.status}`);
        }

        const data = await response.json();
        const rows = data.values || [];

        // Biến đổi dữ liệu theo yêu cầu
        const result = rows.map(row => {
            const obj = {};
            sheetFields.forEach((field, index) => {
                obj[field.name] = row[index] || '';
            });
            return obj;
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error fetching Google Sheets data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch data from Google Sheets' },
            { status: 500 }
        );
    }
}