import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Lấy giá trị từ localStorage (chạy trên server nên cần kiểm tra)
        let spreadsheetId = '1Uc7NIf2QiD0cSz_8ie0D5QT1_xazUYAca5HvUm4I4gY';
        let apiKey = 'AIzaSyAn4gthKnJFyZwDwfes2GSTAskBl6_dLwU';

        if (typeof localStorage !== 'undefined') {
            const savedConfig = localStorage.getItem('ggsheetCondition');
            if (savedConfig) {
                const config = JSON.parse(savedConfig);
                spreadsheetId = config.GGSheetSpreadsheetId || spreadsheetId;
                apiKey = config.GGSheetApi || apiKey;
            }
        }

        const range = 'Sheet1!1:1';

        const response = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`
        );

        if (!response.ok) {
            throw new Error(`Google Sheets API error: ${response.status}`);
        }

        const data = await response.json();
        const firstRow = data.values?.[0] || [];

        // Xử lý dữ liệu đầu ra thành array object
        const result = firstRow.map(item => ({
            name: item
        }));

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error fetching Google Sheets data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch data from Google Sheets' },
            { status: 500 }
        );
    }
}